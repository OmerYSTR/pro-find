import sqlite3
from enum import Enum
import hashlib
import os
from message_types import MessageTypes, StatusMessage
from abc import ABC, abstractmethod

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
    
    d.register("LOGIN", LoginDispatcher)
    
    return d
        



        
class LoginDispatcher(MessageHandler):
    def handle(self, msg:Message) -> tuple:
        to_ret = MessageTypes.LOGIN_REQUEST_RESPONSE, StatusMessage.FAILED_LOG_IN.value

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
                    user_dict["image":user[3]]
                return MessageTypes.LOGIN_REQUEST_RESPONSE, StatusMessage.LOGGED_IN.value
        return to_ret