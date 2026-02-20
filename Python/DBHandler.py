import sqlite3
from enum import Enum
import hashlib
import os
from message_types import MessageTypes
DATABASE = "my_app.db"
PEPPER = "CYBERISH"


class TableFunctions(Enum):
    CHECK_LOGIN = "check_login"
    SIGN_UP = "sign_up"


def hash_password(password:str, salt:str) ->str:
    combined_encoded= (salt+password+PEPPER).encode()
    
    hashed = hashlib.sha256(combined_encoded).hexdigest()
    return hashed





class TableHandler:
    def __init__(self, func:TableFunctions, data=None):
        """ 'data' is structured:
        {
            field1: data
            field2: data
        ....}"""
        
        self.conn = sqlite3.connect(DATABASE)
        self.cursor = self.conn.cursor()
        self.cursor.execute("PRAGMA foreign_keys = ON;")
        
        self.data:dict = data
        self.func = getattr(self,func.value) #If not true and not false then this is the response message to the user
        
        
    def check_login(self):
        try:
            email = self.data.get("email")
            password = self.data.get("password")
        except:
            return "Fields sent are incorrect"
        
        self.cursor.execute("SELECT password_hash, salt FROM users WHERE email = ?", (email,))
         
        result = self.cursor.fetchone()
        
        if not result:
            print("No user with such an email")
            return False
        
        stored_hash, salt = result
        
        if stored_hash == hash_password(password, salt):
            print("Logged in!")
            return True
        else:
            print("Wrong password")
            return False
        


