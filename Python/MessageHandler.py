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
        
        
        
        
class MessageHandler(ABC):
    @abstractmethod
    def handle(self, msg:Message) ->tuple:
        pass        
    


#region Dispatcher
class MessageDispatcher:
    def __init__(self):
        self._handlers:dict[str, MessageHandler] ={}

       
    def register(self, msg_type, cls):
        self._handlers[msg_type] = cls    

        
    def dispatch(self, msg:Message) ->tuple:
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
    
    return d
        
        
        

        
class LoginDispatcher(MessageHandler):
    def handle(self, msg:Message) -> tuple:
        try:
            to_ret = MessageTypes.LOGIN, StatusMessage.FAILED_LOG_IN.value

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
                        return MessageTypes.LOGIN, StatusMessage.LOGGED_IN.value
                return to_ret
        
        except Exception as e:
            print("Login dispatcher - ", e)
            return to_ret
    
    
    
    
    
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
                            finish_working, verification_code, expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", 
                            (data["name"],data["email"], password_hash, salt, data["role"], data["profession"], 
                            cities, data["years"], data["jobDuration"], data["description"],data["startWorking"], 
                            data["finishWorking"], ver.verification_code, ver.expires_at))
                       
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
                                start_working, finish_working 
                                FROM pending_users 
                                WHERE email=?""",(email,))
                    row = cur.fetchone()
                    if not row:
                        conn.rollback()
                        return False
                    
                    (name, password_hash, salt, user_type, profession, cities, 
                     years, job_duration, description, start_working, finish_working) = row

                    cur.execute("""INSERT INTO users (full_name, email, password_hash, user_type, salt) 
                                VALUES (?,?,?,?,?)""", (name, email, password_hash, user_type, salt))
                    id = cur.lastrowid
                    
                    cur.execute("""INSERT INTO professional (user_id, profession, service_cities,
                                description, years_experience, avg_job_duration, start_time, end_time)
                                VALUES (?,?,?,?,?,?,?,?)""", (id, profession, cities, description, years, job_duration, start_working, finish_working))
                
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
                    return MessageTypes.FORGOT_PASSWORD_REQUEST, StatusMessage.FORGOT_PASSWORD_BAD.value
                
                
                cur.execute("SELECT expires_at FROM pending_users WHERE email=?", (email,))
                
                find =cur.fetchone()
                if find:
                    
                    expires_at = datetime.strptime(find[0], "%Y-%m-%d %H:%M:%S.%f")
                    if expires_at<datetime.now():
                        cur.execute("DELETE FROM pending_users WHERE email=?", (email,))
                    else:
                        return MessageTypes.FORGOT_PASSWORD_REQUEST, StatusMessage.FORGOT_PASSWORD_BAD.value 
                
                ver = EmailVerification(email)
                
                if not ver.send_verification_code():
                    conn.rollback()
                    return MessageTypes.FORGOT_PASSWORD_REQUEST, StatusMessage.FORGOT_PASSWORD_BAD.value
                
                cur.execute("""
                    INSERT INTO pending_users 
                    (full_name, email, password_hash, salt, user_type, verification_code, expires_at)
                    VALUES (?,?,?,?,?,?,?)
                """, ("", email, "", "", "User", ver.verification_code, ver.expires_at))
                
                
                conn.commit()
                return MessageTypes.FORGOT_PASSWORD_REQUEST, StatusMessage.FORGOT_PASSWORD_GOOD.value
                
        except Exception as e:
            conn.rollback()
            print("Forgot Password Dispatcher - ",e)
            return MessageTypes.FORGOT_PASSWORD_REQUEST, StatusMessage.FORGOT_PASSWORD_BAD.value





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
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, StatusMessage.FORGOT_PASSWORD_BAD.value
                
                cur.execute("SELECT 1 FROM users WHERE email=?",(email,))
                user = cur.fetchone()
                if not user:
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, StatusMessage.FORGOT_PASSWORD_BAD.value
                
                
                expires_at =  datetime.strptime(pending[1], "%Y-%m-%d %H:%M:%S.%f")
                if expires_at<datetime.now():
                    cur.execute("""DELETE FROM pending_users WHERE email=?""", (email,))
                    conn.commit()
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, StatusMessage.FORGOT_PASSWORD_BAD.value
                
                if ver_code == pending[0]:
                    cur.execute("""DELETE FROM pending_users WHERE email=?""", (email,))
                    cur.execute("INSERT INTO pass_change (email) VALUES (?)", (email,))
                    conn.commit()
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, StatusMessage.FORGOT_PASSWORD_GOOD.value
                else:
                    return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, StatusMessage.FORGOT_PASSWORD_BAD.value
 
                
                
                
        except Exception as e:
            conn.rollback()
            print("Forgot password authentication dispatcher - ", e)
            return MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, StatusMessage.FORGOT_PASSWORD_BAD.value





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
                    return MessageTypes.CHANGE_PASS, StatusMessage.CHANGE_PASSWORD_BAD.value
                
                salt = os.urandom(16).hex()
                password_hash = hash_password(password, salt)
                
                cur.execute(""" UPDATE users SET password_hash = ?, salt = ? WHERE email = ?""", (password_hash, salt, email))
                cur.execute("""DELETE FROM pass_change WHERE email=?""", (email,))
                conn.commit()
                return MessageTypes.CHANGE_PASS, StatusMessage.CHANGE_PASSWORD_GOOD.value
        
        
        except Exception as e:
            conn.rollback()
            print("Update password dispatcher - ", e)
            return MessageTypes.CHANGE_PASS, StatusMessage.CHANGE_PASSWORD_BAD.value

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
            if not self._check_email_format(email):
                return False, {StatusMessage.FAILED_SIGN_UP.value:"Email format is incorrect"}
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


with sqlite3.connect(DATABASE) as conn:
    cur = conn.cursor()
# #     salt = os.urandom(16).hex()
# #     password_hash = hash_password("111", salt)
# #     cur.execute("""INSERT INTO users (full_name, email, password_hash, user_type, salt)
# #                 VALUES (?,?,?,?,?)""", ("Ido Yaffet", "idoy90@gmail.com", password_hash, "User", salt))
# #     conn.commit()
    
# #     cur.execute("SELECT * FROM users")
# #     print(cur.fetchall())
    
    # cur.execute("DELETE FROM users WHERE email='yaffetsterno@gmail.com'")
    # conn.commit()
    
    cur.execute("SELECT * FROM users")
    print(cur.fetchall())
