import sqlite3
import hashlib
import os
from message_types import MessageTypes, StatusMessage
from abc import ABC, abstractmethod
import re
from datetime import datetime, timedelta
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from token_handler import is_token_valid, create_token, decode
from collections import defaultdict


#region Consts
DATABASE = r"C:\Coding\pro-find\Python\my_app.db"
PEPPER = "CYBERISH"

EMAIL = "x1xprofindx1x@gmail.com"
AUTHENTICATION_PAS = "dhgsdxvrlemuyupd"


with open (r"C:\Coding\pro-find\Python\professional.txt", 'r') as f:
    PROFESSIONS = [line.strip() for line in f]
with open(r"C:\Coding\pro-find\Python\cities.txt", 'r') as f:
    LOCALITIES = [line.strip() for line in f]


#endregion



def hash_password(password:str, salt:str) ->str:
    combined_encoded= (salt+password+PEPPER).encode()
    
    hashed = hashlib.sha256(combined_encoded).hexdigest()
    return hashed




class Message:
    def __init__(self, payload):
        self.type_of = payload["type"]
        self.data = payload["data"]
        self.token = payload["token"]
        
        
        
        
class MessageHandler(ABC):
    @abstractmethod
    def handle(self, msg:Message) ->tuple:
        pass        
    


#region Dispatcher
class MessageDispatcher:
    no_token_check = {
                    MessageTypes.LOGIN.value, MessageTypes.USER_SIGNUP.value,
                    MessageTypes.FREELANCER_SIGNUP.value, MessageTypes.VERIFICATION.value,
                    MessageTypes.FORGOT_PASSWORD_AUTHENTICATION.value, MessageTypes.FORGOT_PASSWORD_REQUEST.value,
                    MessageTypes.CHANGE_PASS.value}
    
    def __init__(self):
        self._handlers:dict[str, MessageHandler] ={}

       
    def register(self, msg_type, cls):
        self._handlers[msg_type] = cls    

        
    def dispatch(self, msg:Message) ->tuple:
        if msg.type_of not in self.no_token_check:
            if not is_token_valid(msg.token):
                return MessageTypes.BROAD, {StatusMessage.TOKEN_BAD.value:"Token format invalid"}
        handler_class = self._handlers.get(msg.type_of)
        if not handler_class:
            raise Exception("No handler registered")
        
        handler:MessageHandler = handler_class()
        return handler.handle(msg)
        
        
def configure_dispatcher() -> MessageDispatcher:
    d = MessageDispatcher()
    
    d.register(MessageTypes.LOGIN.value, LoginDispatcher)
    d.register(MessageTypes.USER_SIGNUP.value, UserSignUpService)
    d.register(MessageTypes.FREELANCER_SIGNUP.value, FreelancerSignUpService)
    d.register(MessageTypes.VERIFICATION.value, VerificationDispatcher)
    d.register(MessageTypes.FORGOT_PASSWORD_REQUEST.value, ForgotPasswordEmailVerifciationDispatcher)
    d.register(MessageTypes.FORGOT_PASSWORD_AUTHENTICATION.value, ForgotPasswordAuthenticationDispatcher)
    d.register(MessageTypes.CHANGE_PASS.value, UpdatePasswordDispatcher )
    d.register(MessageTypes.GET_USER_INFO.value, UserInfoDispatcher)
    d.register(MessageTypes.UPDATE_APPOINTMENTS_STATUS.value, ChangeAppointmentStatusDispatcher)
    d.register(MessageTypes.MARK_READ_NOTIFICATION.value, MarkNotificationsReadDispatcher)
    d.register(MessageTypes.GET_APPOINTMENT_TIMES.value, AppointmentStartTimesDispatcher)
    d.register(MessageTypes.MAKE_APPOINTMENT.value, BookAppointmentDispatcher)
    
    return d
        
        
        

#region authentication      
class LoginDispatcher(MessageHandler):
    def handle(self, msg:Message) -> tuple:
        try:

            email = msg.data["email"]
            password = msg.data["password"]
            with sqlite3.connect(DATABASE) as conn:
                cursor = conn.cursor()
                
                cursor.execute("SELECT password_hash, salt FROM users WHERE email = ?", (email,))
                data = cursor.fetchone()
                
                if data:
                    db_password, salt = data   
                    hashed_ps = hash_password(password, salt)
                    if db_password == hashed_ps:
                        return MessageTypes.LOGIN, {StatusMessage.LOGGED_IN.value:create_token(email)}
                return MessageTypes.LOGIN, {StatusMessage.FAILED_LOG_IN.value:"Email or password incorrect"}
        
        except Exception as e:
            print("Login dispatcher - ", e)
            return MessageTypes.LOGIN, {StatusMessage.FAILED_LOG_IN.value:"Client error"}
        
    
    
    
    
    
class UserSignUpService(MessageHandler):
    def handle(self, msg:Message) -> tuple:
        #validate that info is good
        v = UserSignUpValidator()
        info_is_good, message = v.validate(msg)
        if not info_is_good:
            return MessageTypes.USER_SIGNUP, message
        
        #Checks that user doesn't exist under the same email and sends email if valid
        status, message = self._add_pending_user(msg)
        if not status:
            return MessageTypes.USER_SIGNUP, message
        
        return MessageTypes.USER_SIGNUP, {StatusMessage.SIGNING_UP.value:""}
    
    
    
    def _add_pending_user(self, msg:Message) -> tuple[bool,dict]:
        try:
            data = msg.data
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                conn.execute("BEGIN")
                
                #Checks if email already exists in system
                cur.execute("SELECT 1 FROM users WHERE email=?", (data["email"],))

                if cur.fetchone():
                    conn.rollback()
                    return False, {StatusMessage.FAILED_SIGN_UP.value:"Email already in use"}
            
                #Checks if email exists in table
                cur.execute("""SELECT expires_at FROM pending_users WHERE email=?""", (data["email"],))
                find = cur.fetchone()
                
                if find:
                    expires_at = datetime.strptime(find[0], "%Y-%m-%d %H:%M:%S.%f")
                    
                    #If time expired
                    if expires_at<datetime.now():
                        cur.execute("""DELETE FROM pending_users WHERE email=?""", (data["email"],))      
                    else:
                        conn.rollback()
                        return False, {StatusMessage.FAILED_SIGN_UP.value:"Email already in use"}
                
                salt = os.urandom(16).hex()
                password_hash = hash_password(data["password"], salt)
                ver = EmailVerification(data["email"])   
                
                cur.execute("""
                INSERT INTO pending_users
                (full_name, email, password_hash, salt, user_type, verification_code, expires_at)
                VALUES (?,?,?,?,?,?,?)
            """, (data["name"], data["email"], password_hash, salt, data["role"], ver.verification_code, ver.expires_at))
                 
                if not ver.send_verification_code():
                    conn.rollback()
                    return False, {StatusMessage.FAILED_SIGN_UP.value:"Failed to send verification email.\nCheck email field"}     
                
                conn.commit()
                return True, {MessageTypes.VERIFICATION.value:"Sending verification"}
                    
        except sqlite3.IntegrityError:
            # Handles race condition: two requests at same time trying to insert same email
            conn.rollback()
            return False, {StatusMessage.FAILED_SIGN_UP.value: "Email already in use"}

        except Exception as e:
            conn.rollback()
            print("User sign up service - ", e)
            return False, {StatusMessage.FAILED_SIGN_UP.value: "Not all fields were valid"}
    
    
    
    
    
class FreelancerSignUpService(MessageHandler):
    def handle(self, msg:Message) -> tuple:
        #Validate that info is good
        v = FreelancerSignUpValidator()
        info_is_good, message = v.validate(msg)
        if not info_is_good:
            return MessageTypes.FREELANCER_SIGNUP, message
        
        status, message = self._add_pending_freelancer(msg)

        if not status:
            return MessageTypes.FREELANCER_SIGNUP, message
        
        return MessageTypes.FREELANCER_SIGNUP, {StatusMessage.SIGNING_UP.value:""}
    
    
    def _add_pending_freelancer(self, msg:Message) -> tuple[bool,dict]:
        data = msg.data
        try:
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                conn.execute("BEGIN")
                
                #Checks if email already exists in system
                cur.execute("SELECT 1 FROM users WHERE email=?", (data["email"],))

                if cur.fetchone():
                    conn.rollback()
                    return False, {StatusMessage.FAILED_SIGN_UP.value:"Email already in use"}
                
    
                #Checks if email exists in table
                cur.execute("SELECT expires_at FROM pending_users WHERE email=?", (data["email"],))
                row = cur.fetchone()

                if row:
                    expires_at = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S.%f")
                    #If time expired
                    if expires_at<datetime.now():
                        cur.execute("""DELETE FROM pending_users WHERE email=?""", (data["email"],))    
                    else:
                        conn.rollback()
                        return False, {StatusMessage.FAILED_SIGN_UP.value:"Email already in use"}
                
                salt = os.urandom(16).hex()
                password_hash = hash_password(data["password"], salt)
                ver = EmailVerification(data["email"])
                cities = ", ".join(data["cities"])
                
                cur.execute("""INSERT INTO pending_users (full_name, email, password_hash,
                            salt, user_type, profession, cities, years, job_duration, description, start_working, 
                            finish_working, verification_code, expires_at, hour_price) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", 
                            (data["name"],data["email"], password_hash, salt, data["role"], data["profession"], 
                            cities, data["years"], data["jobDuration"], data["description"],data["startWorking"], 
                            data["finishWorking"], ver.verification_code, ver.expires_at, data["hourPrice"]))
                       
                if not ver.send_verification_code():
                    conn.rollback()
                    return False, {StatusMessage.FAILED_SIGN_UP.value: "Failed to send verification email. Check email field"}
            
                conn.commit()
                return True, {MessageTypes.VERIFICATION.value: "Sending verification"}
        
        except sqlite3.IntegrityError:
            conn.rollback()
            return False, {StatusMessage.FAILED_SIGN_UP.value: "Email already in use"}

        except Exception as e:
            conn.rollback()
            print("Freelancer sign up service -", e)
            return False, {StatusMessage.FAILED_SIGN_UP.value: "Not all fields were valid"}
        
    

    
    
class VerificationDispatcher(MessageHandler):
    def handle(self, msg:Message) -> tuple:
        verified, message = EmailVerification.check_verification_code(msg)
        if verified:
            
            if self.log_new_customer(msg):
                return MessageTypes.VERIFICATION,message
            else:
                return MessageTypes.VERIFICATION, {StatusMessage.VERIFICATION_BAD.value:"Error while logging user"}
        
        else:
            return MessageTypes.VERIFICATION, message
            
    def log_new_customer(self, msg:Message) -> bool:
        try:
            with sqlite3.connect(DATABASE) as conn:
                conn.execute("BEGIN")
                cur = conn.cursor()
                
                data = msg.data
                email = data["email"]
                role = data["role"]
                
                if role == "User":
                    cur.execute("SELECT full_name, password_hash, salt, user_type FROM pending_users WHERE email=?", (email,))
                    row = cur.fetchone()
                    if not row:
                        conn.rollback()
                        return False
                    
                    name, password_hash, salt, user_type = row
                    
                    cur.execute("""INSERT INTO users (full_name, email, password_hash, user_type, salt) 
                                VALUES (?,?,?,?,?)""", (name, email, password_hash, user_type, salt))
                
                elif role == "Freelancer":
                    cur.execute("""SELECT full_name, password_hash, salt, user_type, 
                                profession, cities, years, job_duration, description, 
                                start_working, finish_working, hour_price 
                                FROM pending_users 
                                WHERE email=?""",(email,))
                    row = cur.fetchone()
                    if not row:
                        conn.rollback()
                        return False
                    
                    (name, password_hash, salt, user_type, profession, cities, 
                     years, job_duration, description, start_working, finish_working, hour_price) = row

                    cur.execute("""INSERT INTO users (full_name, email, password_hash, user_type, salt) 
                                VALUES (?,?,?,?,?)""", (name, email, password_hash, user_type, salt))
                    id = cur.lastrowid
                    
                    cur.execute("""INSERT INTO professional (user_id, profession, service_cities,
                                description, years_experience, avg_job_duration, start_time, end_time, hour_price)
                                VALUES (?,?,?,?,?,?,?,?,?)""", (id, profession, cities, description, years, job_duration, start_working, finish_working, hour_price))
                
                cur.execute("DELETE FROM pending_users WHERE email=?",(email,))
                conn.commit()
                return True
                    
        except sqlite3.IntegrityError:
            conn.rollback()
            return False

        except Exception as e:
            conn.rollback()
            print("Verification dispatcher, logging customer -", e)
            return False
            
        


        
class ForgotPasswordEmailVerifciationDispatcher(MessageHandler):
    def handle(self, msg:Message) ->tuple:
        try:
            with sqlite3.connect(DATABASE) as conn:
                conn.execute("BEGIN")
                email = msg.data["email"]
                cur = conn.cursor()
                
                cur.execute("SELECT 1 FROM users WHERE email=?", (email,))
                if not cur.fetchone():
                    return MessageTypes.FORGOT_PASSWORD_REQUEST, {StatusMessage.FORGOT_PASSWORD_BAD.value:"Email not in system"}
                
                
                cur.execute("SELECT expires_at FROM pending_users WHERE email=?", (email,))
                
                find =cur.fetchone()
                if find:
                    
                    expires_at = datetime.strptime(find[0], "%Y-%m-%d %H:%M:%S.%f")
                    if expires_at<datetime.now():
                        cur.execute("DELETE FROM pending_users WHERE email=?", (email,))
                    else:
                        return MessageTypes.FORGOT_PASSWORD_REQUEST, {StatusMessage.FORGOT_PASSWORD_BAD.value:"Expired verification time"} 
                
                ver = EmailVerification(email)
                
                if not ver.send_verification_code():
                    conn.rollback()
                    return MessageTypes.FORGOT_PASSWORD_REQUEST, {StatusMessage.FORGOT_PASSWORD_BAD.value:"Error sending verification email\ntry again at a later time"}
                
                cur.execute("""
                    INSERT INTO pending_users 
                    (full_name, email, password_hash, salt, user_type, verification_code, expires_at)
                    VALUES (?,?,?,?,?,?,?)
                """, ("", email, "", "", "User", ver.verification_code, ver.expires_at))
                
                
                conn.commit()
                return MessageTypes.FORGOT_PASSWORD_REQUEST, {StatusMessage.FORGOT_PASSWORD_GOOD.value:""}
                
        except Exception as e:
            conn.rollback()
            print("Forgot Password Dispatcher - ",e)
            return MessageTypes.FORGOT_PASSWORD_REQUEST, {StatusMessage.FORGOT_PASSWORD_BAD.value:"Client error"}





class ForgotPasswordAuthenticationDispatcher(MessageHandler):
    def handle(self, msg:Message) ->tuple:
        try:
            with sqlite3.connect(DATABASE) as conn:
                conn.execute("BEGIN")
                cur = conn.cursor()
                email = msg.data["email"]
                ver_code = msg.data["veri_code"]
                
                cur.execute("SELECT verification_code, expires_at FROM pending_users WHERE email=?",(email,))
                pending = cur.fetchone()

                if not pending:
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, {StatusMessage.FORGOT_PASSWORD_BAD.value:"Email is not verifying"}
                
                cur.execute("SELECT 1 FROM users WHERE email=?",(email,))
                user = cur.fetchone()
                if not user:
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, {StatusMessage.FORGOT_PASSWORD_BAD.value:"No such user in system"}
                
                
                expires_at =  datetime.strptime(pending[1], "%Y-%m-%d %H:%M:%S.%f")
                if expires_at<datetime.now():
                    cur.execute("""DELETE FROM pending_users WHERE email=?""", (email,))
                    conn.commit()
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, {StatusMessage.FORGOT_PASSWORD_BAD.value:"Verification time finished"}
                
                if ver_code == pending[0]:
                    cur.execute("""DELETE FROM pending_users WHERE email=?""", (email,))
                    cur.execute("INSERT INTO pass_change (email) VALUES (?)", (email,))
                    conn.commit()
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, {StatusMessage.FORGOT_PASSWORD_GOOD.value:""}
                else:
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, {StatusMessage.FORGOT_PASSWORD_BAD.value:"Incorrect verification code"}
 
                
                
                
        except Exception as e:
            conn.rollback()
            print("Forgot password authentication dispatcher - ", e)
            return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, {StatusMessage.FORGOT_PASSWORD_BAD.value:"Client error"}





class UpdatePasswordDispatcher(MessageHandler):
    def handle(self, msg:Message) ->tuple:
        try:
            with sqlite3.connect(DATABASE) as conn:
                conn.execute("BEGIN")
                cur = conn.cursor()
                email = msg.data["email"]
                password = msg.data["password"]
                
                cur.execute("""SELECT 1 FROM pass_change WHERE email=?""", (email,))
                user = cur.fetchone()
                
                if not user:
                    return MessageTypes.CHANGE_PASS, {StatusMessage.CHANGE_PASSWORD_BAD.value:"User not changin password"}
                
                salt = os.urandom(16).hex()
                password_hash = hash_password(password, salt)
                
                cur.execute(""" UPDATE users SET password_hash = ?, salt = ? WHERE email = ?""", (password_hash, salt, email))
                cur.execute("""DELETE FROM pass_change WHERE email=?""", (email,))
                conn.commit()
                return MessageTypes.CHANGE_PASS, {StatusMessage.CHANGE_PASSWORD_GOOD.value:""}
        
        
        except Exception as e:
            conn.rollback()
            print("Update password dispatcher - ", e)
            return MessageTypes.CHANGE_PASS, {StatusMessage.CHANGE_PASSWORD_BAD.value:"Client error"}
#endregion




#region homepage
class UserInfoDispatcher(MessageHandler):
    def handle(self, msg:Message)->tuple:
        try:
            with sqlite3.connect(DATABASE) as conn:
                actual_email = decode(msg.token)["email"]
                cur = conn.cursor()
                email = msg.data["email"]
                
                if email !=actual_email:
                    return MessageTypes.GET_USER_INFO, {StatusMessage.FAILED_TO_GET_USER_INFO.value:"Email not matching token"}

                cur.execute("SELECT id, full_name, user_type FROM users WHERE email=?", (email,))
                row = cur.fetchone()
                
                if not row:
                    return MessageTypes.GET_USER_INFO, {StatusMessage.FAILED_TO_GET_USER_INFO.value:"Couldn't find user"}
                
                id, name, role = row
                payload_to_send = {"name":name, "role":role}
                
                if role=="Freelancer":
                    cur.execute("SELECT profession, service_cities, description, years_experience, rating, start_time, end_time, avg_job_duration, hour_price FROM professional WHERE user_id=?",(id,))
                    row = cur.fetchone()
                    if not row:
                        return MessageTypes.GET_USER_INFO, {StatusMessage.FAILED_TO_GET_USER_INFO.value:"Couldn't find user"}
                    profession, cities, description, years_experience, rating, start, end, job_duration, hour_price = row
                    
                    try:    
                        h, m = map(int, job_duration.split(':'))
                        
                        h_str = f"{h}h" if h > 0 else ""
                        m_str = f"{m}m" if m > 0 else ""
                        
                        job_duration = f"{h_str} {m_str}".strip()                        
                    except:
                        pass
                    
                    payload_to_send.update({"job":profession, "cities":cities, "description":description, "years":years_experience, "rating":rating, "start_working":start, "end_working":end, "job_duration":job_duration, "hour_price":hour_price})
                
                    
                appointments = self._get_appointments(id, cur, role)
                
                notifications = self._get_notifications(id, cur)
                
                conn.commit()
                payload_to_send["appointments"] =  appointments
                payload_to_send["notifications"] = notifications
                    
                return MessageTypes.GET_USER_INFO, {StatusMessage.GOT_USER_INFO.value:payload_to_send, "user_id": id}
        
        except Exception as e:
            print(f"User info dispatcher - {e}")
            return MessageTypes.GET_USER_INFO, {StatusMessage.FAILED_TO_GET_USER_INFO.value:"Couldn't find user"}


    def _get_appointments(self, user_id, cur, role) -> list[dict]:
        
        is_freelancer = (role=="Freelancer")
        
        now = datetime.now()
        current_date = now.strftime("%Y-%m-%d")
        current_time = now.strftime("%H:%M")

        actual_id = user_id
        if is_freelancer:
            id_column = "a.professional_id"
            user_join = "JOIN users u ON a.customer_id = u.id"
        else:
            id_column = "a.customer_id"
            user_join = """
                JOIN professional p ON a.professional_id = p.user_id 
                JOIN users u ON p.user_id = u.id
            """ 

        query = f"""
            SELECT u.full_name, a.date, a.id,
                a.start_time, a.end_time, a.address, 
                a.details, a.status 
            FROM appointments a
            {user_join}
            WHERE {id_column} = ? 
        """

        if not is_freelancer:
            query += " AND a.status = 'Confirmed'"

        query += """
            AND (a.date > ? OR (a.date = ? AND a.start_time >= ?))
            ORDER BY a.date ASC, a.start_time ASC
        """
        
        cur.execute(query, (actual_id, current_date, current_date, current_time))
        rows = cur.fetchall()
        
        appointments = []
        for row in rows:
            name, app_date, app_id, start, end, addr, det, stat = row
            
            try:
                date_obj = datetime.strptime(str(app_date), "%Y-%m-%d")
                display_date = date_obj.strftime("%d/%m/%Y")
            except ValueError:
                display_date = str(app_date)
            
            appointments.append({
                "id": app_id,
                "person_name": name, 
                "display_date": display_date,
                "date": str(app_date), 
                "start_time": str(start), 
                "end_time": str(end), 
                "address": addr, 
                "details": det, 
                "status": stat, 
                "iso_timestamp": f"{app_date}T{start}"
            })
            
        return appointments
            
        
    def _get_notifications(self, user_id, cur) -> list[dict]:
        query = """
            SELECT n.message, n.created_at, n.is_read, u.full_name as sender_name
            FROM notifications n
            LEFT JOIN users u ON n.from_id = u.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC
        """
        cur.execute(query, (user_id,))
        rows = cur.fetchall()      

        notifications = []
        for row in rows:
            message, created_at, is_read, sender_name = row            
            try:
                dt_obj = datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S.%f")
                formatted_date = dt_obj.strftime("%d/%m/%y")
            except ValueError:
                try:
                    dt_obj = datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")
                    formatted_date = dt_obj.strftime("%d/%m/%y")
                except Exception:
                    formatted_date = str(created_at)[:10]

            notifications.append({
                "message": message,
                "created_at": formatted_date,
                "from_name": sender_name if sender_name else "System",
                "is_read": bool(is_read)
            })
            
        return notifications



class MarkNotificationsReadDispatcher(MessageHandler):
    def handle(self, msg: Message) -> tuple:
        try:
            user_id = msg.data["user_id"]
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                cur.execute("""
                    UPDATE notifications 
                    SET is_read = 1 
                    WHERE user_id = ? AND is_read = 0
                """, (user_id,))
                conn.commit()
            return MessageTypes.MARK_READ_NOTIFICATION, {StatusMessage.MARKED_READ_NOTIFICATIONS.value: ""}
        except Exception as e:
            print("Marked notification dispatcher error - ", e)
            return MessageTypes.MARK_READ_NOTIFICATION, {StatusMessage.FAILED_TO_MARK_READ_NOTIFICATIONS.value:"Failed to mark messages"}



class ChangeAppointmentStatusDispatcher(MessageHandler):
    def handle(self, msg: Message) -> tuple:
        try:
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                apps: dict = msg.data["appointments"]
                
                processed_results = {"successful": [], "failed": {}}
                
                first_key = int(next(iter(apps)))
                cur.execute("SELECT u.full_name, a.professional_id FROM appointments a JOIN users u ON a.professional_id = u.id WHERE a.id = ?", (first_key,))
                res = cur.fetchone()
                prof_name, p_id = res if res else ("Freelancer", None)

                status_map = {'accepted': "Confirmed", 'cancelled': "Cancelled"}

                for app_id, status_input in apps.items():
                    try:
                        target_status = status_map.get(status_input)
                        
                        if target_status == "Confirmed":
                            if self._is_time_slot_taken(cur, app_id):
                                cur.execute("DELETE FROM appointments WHERE id=?", (app_id,))
                                processed_results["failed"][app_id] = "Slot already taken"
                                continue

                        cur.execute("SELECT customer_id FROM appointments WHERE id=?", (app_id,))
                        row = cur.fetchone()
                        if not row:
                            processed_results["failed"][app_id] = "Appointment not found"
                            continue
                        
                        u_id = row[0]

                        if target_status == "Confirmed":
                            cur.execute("UPDATE appointments SET status=? WHERE id=?", (target_status, app_id))
                            msg_text = f"{prof_name} has accepted your appointment"
                        else:
                            cur.execute("DELETE FROM appointments WHERE id=?", (app_id,))
                            msg_text = f"{prof_name} has declined your appointment"

                        cur.execute("""INSERT INTO notifications (user_id, message, is_read, created_at, from_id)
                                    VALUES (?, ?, 0, ?, ?)""", 
                                    (u_id, msg_text, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), p_id))
                        
                        processed_results["successful"].append(app_id)

                    except Exception as inner_e:
                        processed_results["failed"][app_id] = str(inner_e)
                        continue

                conn.commit()
                
                return MessageTypes.UPDATE_APPOINTMENTS_STATUS, {
                    StatusMessage.UPDATED_APP_STATUS.value: "Batch processed",
                    "results": processed_results
                }

        except Exception as e:
            print(f"Critical Dispatcher Error: {e}")
            return MessageTypes.UPDATE_APPOINTMENTS_STATUS, {StatusMessage.FAILED_TO_UPDATE_APP_STATUS.value: "System error"}
        
    def _is_time_slot_taken(self, cur, app_id):
        cur.execute("SELECT professional_id, date, start_time, end_time FROM appointments WHERE id=?", (app_id,))
        target = cur.fetchone()
        if not target:
            return False
        
        p_id, a_date, a_start, a_end = target

        query = """
            SELECT id FROM appointments 
            WHERE professional_id = ? 
            AND date = ? 
            AND status = 'Confirmed'
            AND id != ?
            AND (? < end_time AND start_time < ?)
        """
        cur.execute(query, (p_id, a_date, app_id, a_start, a_end))
        return cur.fetchone() is not None



class AppointmentStartTimesDispatcher(MessageHandler):
    def handle(self, msg:Message) ->tuple:
        try:
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                pro_id = msg.data["id"]
                
                cur.execute("SELECT avg_job_duration, start_time, end_time FROM professional WHERE user_id=?", (pro_id,))
                row = cur.fetchone()
                if not row:
                    return MessageTypes.GET_APPOINTMENT_TIMES, {StatusMessage.FAILED_TO_GET_APPOINTMENT_TIMES.value:"Couldn't find freelancer"}
                
                job_duration, start_time, end_time = row                
                 
                cur.execute("""SELECT start_time, date FROM appointments WHERE professional_id=? 
                            AND date BETWEEN date('now') AND date('now', '+1 month') 
                            AND status='Confirmed' ORDER BY date ASC; """, (pro_id,))
                
                appointments = cur.fetchall()
                
                existing_appointments = defaultdict(list)

                if appointments:
                    for row in appointments:
                        time = row[0]
                        date =row[1]
                        existing_appointments[date].append(time)
                    existing_appointments = dict(existing_appointments)
                    
                h,m = map(int, job_duration.split(":"))
                duration_minutes = (h*60) + m
                    
                app_times = {}
                current_date = datetime.now() + timedelta(days=1)           
                
                for _ in range(0, 35):
                    date_str = current_date.strftime("%Y-%m-%d")
                    booked_slots = existing_appointments.get(date_str, [])
                    app_times[date_str] = _calculate_free_day_working_hours(start_time, end_time, duration_minutes, booked_slots)
                    current_date = current_date+timedelta(days=1)
                    
                    
                return MessageTypes.GET_APPOINTMENT_TIMES, {StatusMessage.GOT_APPOINTMENT_TIMES.value:app_times}
        except Exception as e:
            print("Appointment time dispatcher error - ", e)
            return MessageTypes.GET_APPOINTMENT_TIMES, {StatusMessage.FAILED_TO_GET_APPOINTMENT_TIMES.value:"Issue fetching the appointment dates and times"}

    

def _calculate_free_day_working_hours(start_time, end_time, job_duration, existing_appointments=[]) ->list:
    format = "%H:%M"
    current_slot = datetime.strptime(start_time, format)
    end_of_day = datetime.strptime(end_time, format)
    
    available_times = []
    while current_slot+timedelta(minutes=job_duration) <= end_of_day:
        slot_str = current_slot.strftime(format)
        
        if slot_str not in existing_appointments:
            available_times.append(slot_str)
            
        current_slot+= timedelta(minutes=job_duration)
    
    return available_times
        
        
        
class BookAppointmentDispatcher(MessageHandler):
    def handle(self, msg:Message) ->tuple:
        try:
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                data = msg.data["app"]
                
                cur.execute("SELECT start_time FROM appointments WHERE date=? AND professional_id=? AND status='Confirmed'", 
                            (data["date"], data["prof_id"]))
                start_times_booked = [row[0] for row in cur.fetchall()]
                
                fmt = "%H:%M"
                start_dt = datetime.strptime(data["start_time"], fmt)
                end_dt = datetime.strptime(data["end_time"], fmt)
                
                delta = end_dt - start_dt 
                minutes = int(delta.total_seconds() // 60)

                available_slots = _calculate_free_day_working_hours(
                    data["start_time"], 
                    data["end_time"],
                    minutes, 
                    start_times_booked
                )

                if data["start_time"] not in available_slots:
                    return MessageTypes.MAKE_APPOINTMENT, {StatusMessage.BOOKED_APPOINTMENT.value: "Time slot is unavailable or invalid."}

                cur.execute("""
                    INSERT INTO appointments (professional_id, customer_id, date, start_time, end_time, address, details, status)
                    VALUES (?,?,?,?,?,?,?,'Requested')
                """, (data["prof_id"], data["user_id"], data["date"], data["start_time"], data["end_time"], data["address"], data["details"])) 
                
                conn.commit()
                return MessageTypes.MAKE_APPOINTMENT, {StatusMessage.BOOKED_APPOINTMENT.value: "Appointment booked successfully"}
                
        except Exception as e:
            print(f"Appointment booking dispatcher exception - {e}")
            return MessageTypes.MAKE_APPOINTMENT, {StatusMessage.FAILED_TO_BOOK_APPOINTMENT.value: "Failed to book, please try again."}
#endregion






#endregion
    
    
    
#region Signup Validators
class Validator(ABC):
    @abstractmethod
    def validate(self, msg:Message) ->tuple[bool:str]:
        pass
     
    
class UserSignUpValidator(Validator):
    def validate(self, msg:Message) ->tuple[bool, str]:
        #Password I don't check
        #Name I don't check
        try:
            email = msg.data["email"]
            full_name = msg.data["name"]
            if not self._check_email_format(email):
                return False, {StatusMessage.FAILED_SIGN_UP.value:"Email format is incorrect"}
            if len(full_name)>30:
                return False, {StatusMessage.FAILED_SIGN_UP.value:"Name field can't exceed 30 characters"}
            return True, ""
        except Exception as e:
            print("User sign up validator - ",e)
            return False, {StatusMessage.FAILED_SIGN_UP.value:"Not all fields were sent"}
        
        
    def _check_email_format(self, email):
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, email) is not None
        
        
class FreelancerSignUpValidator(Validator):
    def validate(self, msg:Message) ->tuple[bool, str]:
        #Password I don't check
        #Name I don't check
        status = False
        error_message = StatusMessage.FAILED_SIGN_UP.value
        
        
        data = msg.data
        try:
            email = data["email"]
            if not self._check_email_format(email):
                return status, {error_message:"Email format is incorrect"}

            if len(data["name"]) > 30:
                return status, {error_message:"Name field can't exceed 30 characters"}
            
            if data["profession"] not in PROFESSIONS:
                return status, {error_message:"Job isn't recognized"}


            if not self._check_city(data["cities"]):
                return status, {error_message:"City not recognized"}

                
            if data["years"] > 40:
                return status, {error_message:"Experience seems a bit off..."}

            
            try:
                start_dt = datetime.strptime(data["startWorking"], "%H:%M")
                finish_dt = datetime.strptime(data["finishWorking"], "%H:%M")
                job_duration_dt = datetime.strptime(data["jobDuration"], "%H:%M")
                job_duration = timedelta(hours=job_duration_dt.hour, minutes=job_duration_dt.minute)
            except:
                return status, {error_message:"Work, start, or finish time bad format"}


            if start_dt >= finish_dt:
                return status, {error_message:"Start work time must be before finish work time"}
            
            
            if job_duration.total_seconds() <= 0 or job_duration >= timedelta(days=1):
                return status, {error_message:"Enter proper job duration"}

            first_job_time = start_dt + job_duration
            if first_job_time > finish_dt:
                return status, {error_message:"You won't complete a single job..."}
            
            
            if data["role"] not in ["Freelancer", "User"]:
                return status, {error_message:"No such user type"}
            
            if type(data["hourPrice"]) != int:
                return status,{error_message:"price per hour is not in correct format "}
            
            if data["hourPrice"] > 1000:
                return status, {error_message, "your wage is to expensive for this site"}
            
            if len(data["description"]) > 500:
                return status, {error_message:f"Description must be less then 500 characters, yours is {len(data['description'])}"}
                
            
            
            status = True
            return status, {StatusMessage.SIGNING_UP.value:""}
        except Exception as e:
            print("Freelancer validator - ", e)
            return False, {StatusMessage.FAILED_SIGN_UP.value:"Not all fields were sent"}
        
        
    def _check_city(self, cities):
        if type(cities) != list:
            return False

        for city in cities:
            if city not in LOCALITIES:
                return False
        return True

          
    def _check_email_format(self, email):
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, email) is not None
#endregion





class EmailVerification:
    def __init__(self, email):
        self.email = email
        self.verification_code = f"{random.randint(0, 999999):06d}"
        self.expires_at = datetime.now()+timedelta(minutes=5)
        
   
    def send_verification_code(self):
        message = MIMEMultipart("alternative")
        
        message["Subject"] = "Verification email"
        message["From"] = EMAIL
        message["To"] = self.email

        html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #2a9d8f;">Welcome to Pro-Find!</h2>
          <p>Hi there,</p>
          <p>Thanks for signing up. Your verification code is:</p>
          <p style="font-size: 24px; font-weight: bold; color: #e76f51;">{self.verification_code}</p>
          <p>Please enter this code in the app to verify your account.</p>
          <hr>
          <p style="font-size: 12px; color: #888;">If you didn't sign up, you can ignore this email.</p>
        </div>
      </body>
    </html>
    """
    
        text = f"Hi there!\nYour verification code is {self.verification_code}\nPlease enter it in the app."
        message.attach(MIMEText(text, "plain"))
        message.attach(MIMEText(html, "html"))

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(EMAIL, AUTHENTICATION_PAS)
                server.sendmail(EMAIL, self.email, message.as_string())
            print("Email sent successfully!")
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False


    @staticmethod
    def check_verification_code(msg:Message) -> tuple [bool, dict]:
        try:
            email = msg.data["email"]
            veri_code = msg.data["verification_code"]
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                cur.execute("SELECT verification_code, expires_at FROM pending_users WHERE email=?", (email,))
                data = cur.fetchone()
                if not data:
                    return False, {StatusMessage.VERIFICATION_BAD.value:"Email not found"}
                
                else:
                    expires_at = datetime.strptime(data[1], "%Y-%m-%d %H:%M:%S.%f")
                    veri_code_fetched = data[0]
                    
                    if expires_at < datetime.now():
                        cur.execute("""DELETE FROM pending_users WHERE email=?""", (email,))    
                        conn.commit()
                        return False, {StatusMessage.VERIFICATION_BAD.value:"Verification time expired, restart the process"}

                    if veri_code_fetched == veri_code:
                        return True, {StatusMessage.VERIFICATION_GOOD.value:""}
                    
                    else:
                        return False, {StatusMessage.VERIFICATION_BAD.value:"Verification code does not match"}
                
                
        except Exception as e:
            print (f"Verification code check - {e}")
            return False, {StatusMessage.VERIFICATION_BAD.value:"Not all fields were sent"}



#region table checks
with sqlite3.connect(DATABASE) as conn:
    cur = conn.cursor()
# #     salt = os.urandom(16).hex()
# #     password_hash = hash_password("111", salt)
# #     cur.execute("""INSERT INTO users (full_name, email, password_hash, user_type, salt)
# #                 VALUES (?,?,?,?,?)""", ("Ido Yaffet", "idoy90@gmail.com", password_hash, "User", salt))
# #     conn.commit()
    

    # cur.execute("""UPDATE notifications SET is_read = 0""")
    # conn.commit()

    # cur.execute("PRAGMA table_info(appointments)")
    # columns = cur.fetchall()
    # for col in columns:
    #     print(col)
        # cur.execute("""ALTER TABLE notifications 
    #     ADD COLUMN from_id INTEGER REFERENCES users(id) ON DELETE SET NULL;""")
    # conn.commit()

    # cur.execute("DELETE FROM users WHERE 1==1")
    # conn.commit()
    # cur.execute("""INSERT INTO notifications (user_id, message, is_read, created_at, from_id)
    # VALUES (13, 'System alert: Your trial period ended last week.', 0, '2026-03-05 10:00:00', NULL)""")

    # notifications_data = [
    #     ("Your appointment with Dr. Smith has been confirmed for tomorrow at 10:00 AM.", 0, datetime.now()),
    #     ("New Message: A freelancer has replied to your project inquiry.", 0, datetime.now()),
    #     ("Reminder: Your scheduled session starts in 30 minutes. Get ready!", 0, datetime.now()),
    #     ("Payment Successful: Your transaction for 'Web Design' was processed.", 1, datetime.now()),
    #     ("Security Alert: A new login was detected from a Chrome browser on Windows.", 0, datetime.now()),
    #     ("The address for your 'Home Cleaning' service has been updated by the pro.", 0, datetime.now()),
    #     ("Rate your experience! How was your session with Sarah last night?", 1, datetime.now()),
    #     ("System Update: We've added new features to your dashboard. Check them out!", 0, datetime.now()),
    #     ("Booking Cancelled: Unfortunately, the professional is no longer available.", 0, datetime.now()),
    #     ("Welcome to the platform! Complete your profile to get the best results.", 1, datetime.now())
    # ]

    # for msg, is_read, created in notifications_data:
    #     cur.execute("""
    #         INSERT INTO notifications (user_id, message, is_read, created_at)
    #         VALUES (11, ?, ?, ?)
    #     """, (msg, is_read, created))
    
    
    # cur.execute("""UPDATE notifications SET is_read = 0""")
    
    # conn.commit()
    
    # appointments_to_insert = []

    # base_date = datetime.now()
    # for i in range(12):        
    #     app_date = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
        
    #     appointments_to_insert.append((
    #         11,           # professional_id
    #         13,           # customer_id
    #         app_date,     # date
    #         "10:00",      # start_time
    #         "11:00",      # end_time
    #         "123 Main St, Tech City", # address
    #         f"Session number {i+1} regarding project details.", # details
    #         "Requested",       # status
    #         None,         # cancel_reason (NULL)
    #         datetime.now().isoformat() # created_at
    #     ))

    # for app in appointments_to_insert:
    #     cur.execute("""
    #         INSERT INTO appointments (
    #             professional_id, customer_id, date, start_time, 
    #             end_time, address, details, status, cancel_reason, created_at
    #         )
    #         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    #     """, app)
    # conn.commit()

    # cur.execute("SELECT * FROM professional WHERE user_id = '11'")
    # print(cur.fetchall())
    # cur.execute("SELECT * FROM appointments WHERE status='Confirmed'")
    # print(cur.fetchall())
    # cur.execute("""INSERT INTO notifications (user_id, message, is_read, created_at, from_id)
    # VALUES (13, 'You viewed the project files yesterday.', 1, '2026-03-14 15:30:00', 11)""")
    # conn.commit()
    
#endregion
