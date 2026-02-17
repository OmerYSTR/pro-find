import socket
import threading
import My_WebSocket
from message_types import MessageTypes






def handle_client(soc:socket.socket):
    clt_soc = My_WebSocket.accept_client(soc)
    print(My_WebSocket.recv_message(clt_soc))
    while True:
        pass



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
    
    