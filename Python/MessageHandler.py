import sqlite3
from enum import Enum
import hashlib
import os
from message_types import MessageTypes, StatusMessage
from abc import ABC, abstractmethod
import re
from datetime import datetime, timedelta

DATABASE = "my_app.db"
PEPPER = "CYBERISH"



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
        to_ret = MessageTypes.LOGIN, StatusMessage.FAILED_LOG_IN.value

        email = msg.data["email"]
        password = msg.data["password"]
        
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        
        cursor.execute("SELECT password_hash, salt FROM users WHERE email = ?", (email,))
        data = cursor.fetchone()
        
        if data:
            db_password, salt = data   
            hashed_ps = hash_password(password, salt)
            if db_password == hashed_ps:
                cursor.execute("SELECT full_name, email, user_type, profile_image FROM users WHERE email=?", (email,))
                user = cursor.fetchone()
                user_dict = {"name":user[0], "email":user[1], "user type":user[2]}
                if len(user)== 4 and user[3]:
                    user_dict["image"] = user[3]
                return MessageTypes.LOGIN, StatusMessage.LOGGED_IN.value
        return to_ret
    
    
    
    
    
class UserSignUpService(MessageHandler):
    def handle(self, msg:Message) -> tuple:
        #validate that info is good
        v = UserSignUpValidator()
        info_is_good, message = v.validate(msg)
        print(MessageTypes.USER_SIGNUP, message)
        if not info_is_good:
            return MessageTypes.USER_SIGNUP, message
        return MessageTypes.USER_SIGNUP, {StatusMessage.SIGNING_UP.value:"GOOD"}
    
class FreelancerSignUpService(MessageHandler):
    def handle(self, msg:Message) -> tuple:
        #Validate that info is good
        v = FreelancerSignUpValidator()
        info_is_good, message = v.validate(msg)
        if not info_is_good:
            return MessageTypes.FREELANCER_SIGNUP, message
        return MessageTypes.FREELANCER_SIGNUP, {StatusMessage.SIGNING_UP.value:"GOOD"}
    
    
    
    
    
class Validator(ABC):
    @abstractmethod
    def validate(self, msg:Message) ->tuple[bool:str]:
        pass
     
    
class UserSignUpValidator(Validator):
    def validate(self, msg:Message) ->tuple[bool, str]:
        #Password I don't check
        #Name I don't check
        email = msg.data["email"]
        if not self._check_email_format(email):
            return False, {StatusMessage.FAILED_SIGN_UP.value:"Email format is incorrect"}
        return True, ""
        
        
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
        
        email = data["email"]
        if not self._check_email_format(email):
            return status, {error_message:"Email format is incorrect"}


        with open (r"C:\Coding\pro-find\Python\professional.txt", 'r') as f:
            PROFESSIONS = [line.strip() for line in f]

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
        
        
    def _check_city(self, cities):
        with open(r"C:\Coding\pro-find\Python\cities.txt", 'r') as f:
            LOCALITIES = [line.strip() for line in f]
        for city in cities:
            if city not in LOCALITIES:
                return False
        return True

          
    def _check_email_format(self, email):
        pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        return re.match(pattern, email) is not None


