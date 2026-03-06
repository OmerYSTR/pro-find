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

DATABASE = r"C:\Coding\pro-find\Python\my_app.db"
PEPPER = "CYBERISH"

EMAIL = "x1xprofindx1x@gmail.com"
AUTHENTICATION_PAS = "dhgsdxvrlemuyupd"

def hash_password(password:str, salt:str) ->str:
    combined_encoded= (salt+password+PEPPER).encode()
    
    hashed = hashlib.sha256(combined_encoded).hexdigest()
    return hashed



with open (r"C:\Coding\pro-find\Python\professional.txt", 'r') as f:
    PROFESSIONS = [line.strip() for line in f]
with open(r"C:\Coding\pro-find\Python\cities.txt", 'r') as f:
    LOCALITIES = [line.strip() for line in f]



class Message:
    def __init__(self, payload):
        self.type_of = payload["type"]
        self.data = payload["data"]
        
        
        
        
class MessageHandler(ABC):
    @abstractmethod
    def handle(self, msg:Message) ->tuple:
        pass        
    



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
        
        return MessageTypes.USER_SIGNUP, {StatusMessage.SIGNING_UP.value:"GOOD"}
    
    
    
    def _add_pending_user(self, msg:Message) -> tuple[bool,dict]:
        try:
            data = msg.data
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                
                #Checks if email already exists in system
                cur.execute("SELECT * FROM users WHERE email=?", (data["email"],))
                exists = cur.fetchone()

                if exists:
                    return False, {StatusMessage.FAILED_SIGN_UP.value:"Email already in use"}
            
            
            
                salt = os.urandom(16).hex()
                password_hash = hash_password(data["password"], salt)
                
                ver = EmailVerification(data["email"])
                
                #Checks if email exists in table
                cur.execute("""SELECT expires_at FROM pending_users WHERE email=?""", (data["email"],))
                find = cur.fetchone()

                if find:
                    expires_at = datetime.strptime(find[0], "%Y-%m-%d %H:%M:%S.%f")
                    #If time expired
                    if expires_at<datetime.now():
                        cur.execute("""DELETE FROM pending_users WHERE email=?""", (data["email"],))    
                        
                        cur.execute("""INSERT INTO pending_users (full_name, email, password_hash, salt, user_type, verification_code, expires_at)
                            VALUES (?,?,?,?,?,?,?)""", (data["name"],data["email"], password_hash, salt, data["role"], ver.verification_code, ver.expires_at))
                        conn.commit()
                    
                    else:
                        return False, {StatusMessage.FAILED_SIGN_UP.value:"Email already in use"}
                else:
                    cur.execute("""INSERT INTO pending_users (full_name, email, password_hash, salt, user_type, verification_code, expires_at)
                            VALUES (?,?,?,?,?,?,?)""", (data["name"],data["email"], password_hash, salt, data["role"], ver.verification_code, ver.expires_at))
                    conn.commit()
            if not ver.send_verification_code():
                return False, {StatusMessage.FAILED_SIGN_UP.value:"Failed to send verification email.\nCheck email field"}     
            return True, {MessageTypes.VERIFICATION.value:"Sending verification"}
                    
        except Exception as e:
            print("User sign up service - ",e)
            return False, {StatusMessage.FAILED_SIGN_UP.value:"Not all fields were"}
        
        finally:
            conn.close()
    
    
    
    
    
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
        
        return MessageTypes.FREELANCER_SIGNUP, {StatusMessage.SIGNING_UP.value:"GOOD"}
    
    
    def _add_pending_freelancer(self, msg:Message) -> tuple[bool,dict]:
        try:
            data = msg.data
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                
                #Checks if email already exists in system
                cur.execute("SELECT * FROM users WHERE email=?", (data["email"],))
                exists = cur.fetchone()

                if exists:
                    return False, {StatusMessage.FAILED_SIGN_UP.value:"Email already in use"}
            
            
            
                salt = os.urandom(16).hex()
                password_hash = hash_password(data["password"], salt)
                
                ver = EmailVerification(data["email"])
                
                #Checks if email exists in table
                cur.execute("""SELECT expires_at FROM pending_users WHERE email=?""", (data["email"],))
                find = cur.fetchone()
                cities = ", ".join(data["cities"])
                if find:
                    expires_at = datetime.strptime(find[0], "%Y-%m-%d %H:%M:%S.%f")
                    #If time expired
                    if expires_at<datetime.now():
                        cur.execute("""DELETE FROM pending_users WHERE email=?""", (data["email"],))    
                        
                        cur.execute("""INSERT INTO pending_users (full_name, email, password_hash, salt, user_type, profession, cities, years, job_duration, description, start_working, finish_working, verification_code, expires_at)
                            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (data["name"],data["email"], password_hash, salt, data["role"], data["profession"], cities, data["years"], data["jobDuration"], data["description"],data["startWorking"], data["finishWorking"], ver.verification_code, ver.expires_at))
                        conn.commit()
                    
                    else:
                        return False, {StatusMessage.FAILED_SIGN_UP.value:"Email already in use"}
                else:
                        cur.execute("""INSERT INTO pending_users (full_name, email, password_hash, salt, user_type, profession, cities, years, job_duration, description, start_working, finish_working, verification_code, expires_at)
                            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (data["name"],data["email"], password_hash, salt, data["role"], data["profession"], cities, data["years"], data["jobDuration"], data["description"],data["startWorking"], data["finishWorking"], ver.verification_code, ver.expires_at))
                        conn.commit()
            if not ver.send_verification_code():
                return False, {StatusMessage.FAILED_SIGN_UP.value:"Failed to send verification email.\nCheck email field"}     
            return True, {MessageTypes.VERIFICATION.value:"Sending verification"}
        
        except Exception as e:
            print("User sign up service - ",e)
            return False, {StatusMessage.FAILED_SIGN_UP.value:"Not all fields were"}    
        finally:
            conn.close()
    
    
    
    
    
    
    
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
        


# with sqlite3.connect(DATABASE) as conn:
#     cur = conn.cursor()
#     cur.execute("SELECT * FROM pending_users")
#     print(cur.fetchall())