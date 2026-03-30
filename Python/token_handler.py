from json import loads, dumps
from hashlib import sha256
from base64 import b64decode, b64encode
from typing import Any
import sqlite3
from datetime import datetime, timedelta

sec = b"CYBERISH"

DATABASE = r"C:\Coding\pro-find\Python\my_app.db"


def decode(token: str):
    token_split = token.split(".")
    if len(token_split)!=2:
        return None
    
    enc_data,enc_sign = token_split
    try:    
        dec_data = b64decode(enc_data)
        data = loads(dec_data)
        provided_sign = b64decode(enc_sign)
    except:
        return None
    
    calc_sign = sha256(sec + dec_data).hexdigest().encode()
    if provided_sign != calc_sign:
        return None
    return data



def is_token_valid(token:str):
    dec_tkn = decode(token)
    
    if not dec_tkn:
        return False
    exp = datetime.fromtimestamp(dec_tkn["exp"])
    
    if exp < datetime.now():
        return False
    return True



def _encode(data):
    dec_data = dumps(data).encode()
    enc_data = b64encode(dec_data).decode()
    dec_sign = sha256(sec + dec_data).hexdigest().encode()
    enc_sign = b64encode(dec_sign).decode()
    return f"{enc_data}.{enc_sign}"



def create_token(user_email:str):
    with sqlite3.connect(DATABASE) as conn:
        cur = conn.cursor()
        
        cur.execute("SELECT id, full_name, created_at FROM users WHERE email=?", (user_email,))
        row = cur.fetchone()
        if not row:
            return None 
        id, name, created_at = row
        tkn_obj = {"id":id, "email": user_email, "name":name, "Creation time": created_at, "exp":int((datetime.now()+timedelta(days=1)).timestamp())}
        return _encode(tkn_obj)
    