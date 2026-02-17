import MsgBuild from "./MsgBuilder"
import {useSocket} from '../socket/SocketContext'
import { MessageTypes } from "./MsgTypes"




export function LoginRequest(username, password, ws){
    const payload = {
        "username": username,
        "password": password
    }
    const msg = MsgBuild(MessageTypes.LOGIN_REQUEST, payload, "JSON")
    console.log(msg)
    ws.send(msg)
}