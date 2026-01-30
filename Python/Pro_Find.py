import socket
import threading
from My_WebSocket import WebSocketOpcodes, send_message , accept_websocket_upgrade_request_from_client , recv_message 
from message_types import MessageTypes
import json







def handle_client(clt_soc:socket.socket):
    accept_websocket_upgrade_request_from_client(clt_soc)
    info = {"name":"Omer", "age":17}
    to_send = json.dumps(f"type:{MessageTypes.USER_INFO.value},data:{info}")
    send_message(clt_soc, WebSocketOpcodes.TEXT, to_split_message=False, msg=to_send)



def main_thread(srv_soc:socket.socket):
    while True:
        clt, addr = srv_soc.accept()
        t = threading.Thread(target=handle_client, args=(clt,), daemon=True)
        t.start()



if __name__ == "__main__":
    srv = socket.socket()
    srv.bind(("127.0.0.1", 1111))
    srv.listen(10)
    main_thread(srv)
    
    