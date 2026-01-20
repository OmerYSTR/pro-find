import socket
import hashlib
import base64


def recv_http_handshake_msg(soc:socket.socket) ->bytes:
    data=b""
    while b'\r\n\r\n' not in data:
        chunk=soc.recv(1024)
        if not chunk:
            return data
        data+=chunk
    return data

               

class HttpMessage:
    def __init__(self, http_method, protcol_version, host, upgrade,connection, websocket_key):
        self.http_method = http_method
        self.protocol_version = protcol_version
        self.host = host
        self.upgrade = upgrade
        self.connection = connection
        self.websocket_key = websocket_key

    def __repr__(self):
        return(        
        f"Http method        : {self.http_method}\n"
        f"Protocol version   : {self.protocol_version}\n"
        f"Server             : {self.host}\n"
        f"Upgrade to         : {self.upgrade}\n"
        f"Connection type    : {self.connection}\n"
        f"WebSocket key      : {self.websocket_key}"
        )



class HttpMessageFactory:
    @staticmethod
    def build_http_message(msg: bytes) -> HttpMessage:
        headers = msg.split(b'\r\n\r\n')[0].decode()
        lines = headers.split('\r\n')

        http_method, _, protocol_version = lines[0].split(' ')

        header_dict = {}
        for line in lines[1:]:
            key, value = line.split(": ", 1)
            header_dict[key] = value
        try:
            return HttpMessage(
                http_method,
                protocol_version,
                host=header_dict["Host"],
                upgrade=header_dict["Upgrade"],
                connection=header_dict["Connection"],
                websocket_key=header_dict["Sec-WebSocket-Key"],
            )
        except Exception as e:
            print(f"Found exception ---- {e}")
            return None


def to_upgrade_to_WebSocket(message:HttpMessage) -> bool:
    if message.connection != "Upgrade":
        return False
    elif message.upgrade != "websocket":
        return False
    else:
        return True
    

def upgrade_response(request_message:HttpMessage):
    to_encrypt = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
    
    contecation:str = request_message.websocket_key.strip()+to_encrypt
    
    sha1_hash = hashlib.sha1(contecation.encode()).hexdigest()    
    accept_text = base64.b64encode(sha1_hash.encode())




soc = socket.socket()
soc.bind(("127.0.0.1", 1111))
soc.listen(5)

print("Trying to accept")
clt, addr = soc.accept()

info = recv_http_handshake_msg(clt)
Http_message = HttpMessageFactory.build_http_message(info)
print(Http_message)
