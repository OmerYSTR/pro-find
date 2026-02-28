import MsgBuild from "./MsgBuilder"
import {useSocket} from '../socket/SocketContext'
import { MessageTypes } from "./MsgTypes"




export function LoginRequest(username, password, ws){
    const payload = {
        "email": username,
        "password": password
    }
    const msg = MsgBuild(MessageTypes.LOGIN, payload, "JSON")
    console.log(`Sending - ${msg}`)
    ws.send(msg)
}