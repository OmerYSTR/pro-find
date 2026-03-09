import socket
import threading
import My_WebSocket
import MessageHandler
import json
from collections import deque
import time
import sqlite3
MAX_MESSAGES = 5
TIME_WINDOW = 20 


dispacher = MessageHandler.configure_dispatcher()
DATABASE = r"C:\Coding\pro-find\Python\my_app.db"

def cleanup_expired_user():
    while True:
        try:
            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                
                cur.execute("""DELETE FROM pending_users WHERE expires_at IS NOT NULL AND expires_at<=CURRENT_TIMESTAMP""")
                delete = cur.rowcount
                
                conn.commit()
                if delete:
                    print(f"Cleanup deleted {delete} expired pending users")
        except Exception as e:
            print("Cleanup error - ", e)
           
        time.sleep(3600) 


def handle_client(soc: socket.socket):
    clt_soc = My_WebSocket.accept_client(soc)

    message_times = deque() 

    while True:
        try:
            now = time.time()
            
            while message_times and now - message_times[0] > TIME_WINDOW:
                message_times.popleft()

            if len(message_times) >= MAX_MESSAGES:
                print("Rate limit exceeded, ignoring message")
                time.sleep(0.5) 
                continue 
            
            payload = My_WebSocket.recv_message(clt_soc)
            
            message_times.append(now)
            
            msg = MessageHandler.Message(payload)
        except:
            break

        print(msg.type_of, msg.data)
        handler_type, to_send = dispacher.dispatch(msg)
        print(handler_type, to_send)
        My_WebSocket.send_message(
            clt_soc,
            handler_type,
            to_send,
            True if len(json.dumps(to_send)) > 1000 else False
        )



def main_thread(srv_soc:socket.socket):
    while True:
        clt, addr = srv_soc.accept()
        t = threading.Thread(target=handle_client, args=(clt,), daemon=True)
        t.start()


if __name__ == "__main__":
    srv = socket.socket()
    srv.bind(("0.0.0.0", 1111))
    srv.listen(10)
    
    cleanup_thread = threading.Thread(target=cleanup_expired_user, daemon=True)
    cleanup_thread.start()
    
    main_thread(srv)
    
    