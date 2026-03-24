import socket
import threading
import My_WebSocket
import MessageHandler
from datetime import datetime, timedelta
from collections import deque
import time
import sqlite3
from collections import defaultdict

MAX_MESSAGES = 15
TIME_WINDOW = 20 

dispacher = MessageHandler.configure_dispatcher()
DATABASE = r"C:\Coding\pro-find\Python\my_app.db"

MAX_CONNECTIONS_PER_IP = 5     
IP_TIMEOUT = 60               

ip_connections = defaultdict(list)




def can_accept_connection(ip: str) -> bool:
    now = time.time()
    
    ip_connections[ip] = [t for t in ip_connections[ip] if now - t < IP_TIMEOUT]
    
    if len(ip_connections[ip]) >= MAX_CONNECTIONS_PER_IP:
        return False
    
    ip_connections[ip].append(now)
    return True



def cleanup_tables():
    while True:
        try:
            now = datetime.now()
            current_date = now.strftime("%Y-%m-%d")
            current_time = now.strftime("%H:%M")
            one_week_ago = (now - timedelta(days=7)).strftime("%Y-%m-%d %H:%M:%S")
            two_day_ago = (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")

            with sqlite3.connect(DATABASE) as conn:
                cur = conn.cursor()
                
                cur.execute("""
                    DELETE FROM pending_users 
                    WHERE expires_at IS NOT NULL AND expires_at <= CURRENT_TIMESTAMP
                """)
                users_deleted = cur.rowcount

                cur.execute("""DELETE FROM appointments WHERE date < ? OR (date = ? AND start_time < ?)
                """, (current_date, current_date, current_time))
                apps_deleted = cur.rowcount

                cur.execute("""DELETE FROM notifications WHERE created_at < ? OR (created_at < ? AND is_read = 1)
                            """,(one_week_ago, two_day_ago))
                notes_deleted = cur.rowcount
                
                conn.commit()

                if users_deleted or apps_deleted or notes_deleted:
                    print(f"[{now.strftime('%Y-%m-%d %H:%M')}] Cleanup complete:")
                    print(f" - {users_deleted} pending users removed")
                    print(f" - {apps_deleted} past appointments removed")
                    print(f" - {notes_deleted} old notifications removed")

        except Exception as e:
            print(f"Cleanup error - {e}")
           
        time.sleep(3600)



def handle_client(soc: socket.socket):
    clt_soc = My_WebSocket.accept_client(soc)

    message_times = deque() 

    while True:
        try:
            while message_times and time.time() - message_times[0] > TIME_WINDOW:
                message_times.popleft()

            if len(message_times) >= MAX_MESSAGES:
                print("Rate limit exceeded, ignoring message")
                time.sleep(0.5) 
                continue 
            
            payload = My_WebSocket.recv_message(clt_soc)
            
            message_times.append(time.time())
            
            msg = MessageHandler.Message(payload)
        except Exception as e:
            print(f"Exception in recieving - {e}")
            break

        print(f"Got - {msg.type_of}, {msg.data}\n\n")
        handler_type, to_send = dispacher.dispatch(msg)
        print(f"Sending - {handler_type}, {to_send}\n\n")
        My_WebSocket.send_message(
            clt_soc,
            handler_type,
            msg.token,
            to_send,
            False
        )




def main_thread(srv_soc:socket.socket):
    while True:
        clt, addr = srv_soc.accept()
        ip = addr[0]
        if not can_accept_connection(ip):
            print(f"Too many connections from {ip}, rejecting")
            clt.close()
            continue
        t = threading.Thread(target=handle_client, args=(clt,), daemon=True)
        t.start()




if __name__ == "__main__":
    srv = socket.socket()
    srv.bind(("0.0.0.0", 1111))
    srv.listen(10)
    
    #__________####SKIP IN DEVELOPMENT, BRING BACK WHEN PRESENTING!!!!!!!!!!!!#######____________#
    
    # cleanup_thread = threading.Thread(target=cleanup_tables, daemon=True)
    # cleanup_thread.start()
    
    main_thread(srv)
    
    