import socket
import hashlib
import base64
from enum import Enum


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


class HttpUpgrade:

    def __init__(self, http_message:HttpMessage):
        self.message = http_message

    def to_upgrade_to_WebSocket(self) -> bool:
        if self.message.connection != "Upgrade":
            return False
        elif self.message.upgrade != "websocket":
            return False
        else:
            return True
        

    def upgrade_response(self) -> str:
        GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        contecation:str = self.message.websocket_key.strip()+GUID
        sha1_hash = hashlib.sha1(contecation.encode()).digest()    
        accept_text = base64.b64encode(sha1_hash).decode("ASCII")
        
        version = "HTTP/1.1 "
        accept_code = "101 Switching Protocols\r\n"
        upgrade = f"Upgrade: {http_message.upgrade}\r\n"
        connection = f"Connection: {http_message.connection}\r\n"
        accept_key = f"Sec-WebSocket-Accept: {accept_text}\r\n"
        return_text = f"{version}{accept_code}{upgrade}{connection}{accept_key}\r\n"
        return return_text


class WebSocketOpcodes(Enum):
    CONTINUATION = 0x0
    TEXT = 0x1
    BINARY = 0x2
    CLOSE_CONNETION = 0x8
    PING_MESSAGE = 0x9
    PONG_MESSAGE = 0xA
    

class WebSocketMessageFactory:
    @staticmethod
    def is_normal_payload_message() ->bool:
        pass
    
    
    @staticmethod
    def build_websocket_message(to_split:bool, opcode:WebSocketOpcodes, payload):
        frame_bytes = bytearray()
    
        fin = 0 if to_split else 1
        frame_bytes.append((fin<<7)|opcode.value)
        
        mask = 0 
        bytes_payload = payload if type(payload)==bytes else payload.encode("UTF-8")
        
        def get_length_bits(bytes_payload):
            payload_length = len(bytes_payload)
            
            if payload_length<=125:
                length_field = payload_length
                extended_length_bytes = b''
            
            elif payload_length<=65535:
                length_field = 126
                extended_length_bytes = payload_length.to_bytes(2, "big")
            
            else:
                length_field = 127
                extended_length_bytes = payload_length.to_bytes(8, "big")
            
            return length_field, extended_length_bytes
        
        length_field, extend_length_bytes = get_length_bits(bytes_payload)
        frame_bytes.append((mask<<7)|length_field)
        frame_bytes.extend(extend_length_bytes)
        frame_bytes.extend(bytes_payload)
        print(bytes(frame_bytes))


    @staticmethod
    def build_pong_message(payload=None):
        frame_bytes = bytearray()
        fin = 1
        frame_bytes.append((fin<<7)|WebSocketOpcodes.PONG_MESSAGE.value)
        
        
        mask = 0 
        if payload:
            bytes_payload = payload if type(payload)==bytes else payload.encode("UTF-8")
            payload_length = len(bytes_payload)
            frame_bytes.append((mask<<7)|payload_length)
            frame_bytes.extend(bytes_payload)
        else:
            payload_length = 0
            frame_bytes.append((mask<<7)|payload_length)
            
        print(bytes(frame_bytes))
        

def run_code():
    soc = socket.socket()
    soc.bind(("127.0.0.1", 1111))
    soc.listen(5)

    print("Trying to accept")
    clt, addr = soc.accept()

    info = recv_http_handshake_msg(clt)
    http_message = HttpMessageFactory.build_http_message(info)
    print(http_message)


    connection = HttpUpgrade(http_message)
    if connection.to_upgrade_to_WebSocket():
        to_send = connection.upgrade_response()
        clt.send(to_send.encode())

        print("Sent handshake")
        
        print(clt.recv(1024))
    
#run_code()
#WebSocketMessageFactory.build_websocket_message(False, WebSocketOpcodes.TEXT,"Hello world ooooooooooooooooooooooooooooooooooooaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiisssssssssssssssssssssssssssssssssssssssssss")
#WebSocketMessageFactory.build_pong_message(payload="test")