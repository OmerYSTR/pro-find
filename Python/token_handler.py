from json import loads, dumps
from hashlib import sha256
from base64 import b64decode, b64encode
from typing import Any
import sqlite3
from datetime import datetime, timedelta

secret_prefix = b"CYBERISH"

DATABASE = r"C:\Coding\pro-find\Python\my_app.db"


def _decode(token: str) -> Any:
    token_split = token.split(".")
    if len(token_split)!=2:
        return None
    
    encoded_data,encoded_signature = token_split
    try:    
        decoded_data = b64decode(encoded_data)
        data = loads(decoded_data)
        provided_signature = b64decode(encoded_signature)
    except:
        return None
    
    calculated_signature = sha256(secret_prefix + decoded_data).hexdigest().encode()
    if provided_signature != calculated_signature:
        return None
    return data



def is_token_valid(token:str) -> bool:
    decoded_token = _decode(token)

    if not decoded_token:
        return False

    exp = datetime.fromtimestamp(decoded_token["exp"])
    
    if exp < datetime.now():
        return False
    
    return True



def _encode(data: Any)->str:
    decoded_data = dumps(data).encode()
    encoded_data = b64encode(decoded_data).decode()

    decoded_signature = sha256(secret_prefix + decoded_data).hexdigest().encode()
    encoded_signature = b64encode(decoded_signature).decode()

    return f"{encoded_data}.{encoded_signature}"



def create_token(user_email:str)->str|None:
    with sqlite3.connect(DATABASE) as conn:
        cur = conn.cursor()
        
        cur.execute("SELECT id, full_name, created_at FROM users WHERE email=?", (user_email,))
        row = cur.fetchone()
        if not row:
            return None
        
        id, name, created_at = row
        
        token_obj = {"id":id, "name":name, "Creation time": created_at, "exp":int((datetime.now()+timedelta(days=1)).timestamp())}
        return _encode(token_obj)