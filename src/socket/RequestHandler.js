import MsgBuild from "./MsgBuilder"
import {useSocket} from '../socket/SocketContext'
import { MessageTypes } from "./MsgTypes"
import {useSelector} from 'react-redux'

//#region Login
export function LoginRequest(username, password, ws, token=""){
    const payload = {
        "email": username,
        "password": password
    }
    const msg = MsgBuild(MessageTypes.LOGIN, payload, token, "JSON")
    console.log(`Sending - ${msg}`)
    ws.send(msg)
}
//#endregion


//#region SignUp
export function SignUpRequest(ws, account_info, type_of_user = "User", token=""){
    let payload = account_info;
    payload.role = type_of_user;
    let msg;
    if (type_of_user === "User"){
        msg = MsgBuild(MessageTypes.USER_SIGNUP, payload, token,"JSON")
    }
    else{
        msg = MsgBuild(MessageTypes.FREELANCER_SIGNUP, payload, token, "JSON")
    }
    console.log(`Sending - ${msg}`)
    ws.send(msg)
}
//#endregion


//#region Verification
export function VerificationRequest(ws, email, veri_code, role, token=""){
    let payload = {"email":email, "verification_code":veri_code, "role":role}
    let msg = MsgBuild(MessageTypes.VERIFICATION, payload,token, "JSON")
    ws.send(msg)
}
//#endregion


//#region Forgot Password
export function ForgotPasswordVerificationCodeRequest(ws, email, token=""){
    let payload = {"email":email}
    let msg = MsgBuild(MessageTypes.FORGOT_PASSWORD_REQUEST, payload,token, "JSON")
    ws.send(msg)
}


export function ForgotPasswordAuthenticationRequest(ws, email, code, token=""){
    let payload = {"email":email, "veri_code":code}
    let msg = MsgBuild(MessageTypes.FORGOT_PASSWORD_AUTHENTICATION, payload,token, "JSON")
    ws.send(msg)
}

export function ChangePasswordRequest(ws, email, pass, token=""){
    let payload = {"email":email,"password":pass }
    let msg = MsgBuild(MessageTypes.CHANGE_PASS, payload, token, "JSON")
    ws.send(msg)
}
//#endregion