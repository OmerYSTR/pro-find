import socket
import threading
import My_WebSocket
import MessageHandler
import json

dispacher = MessageHandler.configure_dispatcher()


def handle_client(soc:socket.socket):
    clt_soc = My_WebSocket.accept_client(soc)
    while True:
        payload = My_WebSocket.recv_message(clt_soc)
        
        msg = MessageHandler.Message(payload)
        handler_type, to_send = dispacher.dispatch(msg)
        
        My_WebSocket.send_message(clt_soc, handler_type, to_send, True if len(json.dumps(to_send))>1000 else False)
        




def main_thread(srv_soc:socket.socket):
    while True:
        clt, addr = srv_soc.accept()
        t = threading.Thread(target=handle_client, args=(clt,), daemon=True)
        t.start()


if __name__ == "__main__":
    srv = socket.socket()
    srv.bind(("0.0.0.0", 1111))
    srv.listen(10)
    main_thread(srv)
    
    