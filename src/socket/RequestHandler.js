import MsgBuild from "./MsgBuilder"
import {useSocket} from '../socket/SocketContext'
import { MessageTypes } from "./MsgTypes"

//#region Login
export function LoginRequest(username, password, ws){
    const payload = {
        "email": username,
        "password": password
    }
    const msg = MsgBuild(MessageTypes.LOGIN, payload)
    console.log(`Sending - ${msg}`)
    ws.send(msg)
}
//#endregion


//#region SignUp
export function SignUpRequest(ws, account_info, type_of_user = "User"){
    let payload = account_info;
    payload.role = type_of_user;
    let msg;
    if (type_of_user === "User"){
        msg = MsgBuild(MessageTypes.USER_SIGNUP, payload)
    }
    else{
        msg = MsgBuild(MessageTypes.FREELANCER_SIGNUP, payload)
    }
    console.log(`Sending - ${msg}`)
    ws.send(msg)
}
//#endregion


//#region Verification
export function VerificationRequest(ws, email, veri_code, role){
    let payload = {"email":email, "verification_code":veri_code, "role":role}
    let msg = MsgBuild(MessageTypes.VERIFICATION, payload, "JSON")
    ws.send(msg)
}
//#endregion