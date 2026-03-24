import MsgBuild from "./MsgBuilder"
import {useSocket} from '../socket/SocketContext'
import { MessageTypes } from "./MsgTypes"
import {useSelector} from 'react-redux'
import { MousePointerBan } from "lucide-react"

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


//#region HomePage
export function UserInfoRequest(ws, token){
    const [encodedData] = token.split('.')
    const decodedJson = atob(encodedData)
    const data = JSON.parse(decodedJson)
    let payload = {"email":data.email}
    let msg = MsgBuild(MessageTypes.GET_USER_INFO, payload, token, "JSON")
    ws.send(msg) 
}


export function UpdateAppointmentsStatusRequest(ws, apps, token){
    let payload = {"appointments":apps}
    let msg = MsgBuild(MessageTypes.UPDATE_APPOINTMENTS_STATUS, payload, token, "JSON")
    console.log(`About to send - ${msg}`)
    ws.send(msg)
}


export function MarkReadNotificationsRequest(ws, userId, token){
    let payload = {"user_id":userId}
    let msg = MsgBuild(MessageTypes.MARK_READ_NOTIFICATION, payload, token, "JSON")
    ws.send(msg)
}


export function GetAvailableWorkTimes(ws, targetId, token){
    let payload = {"id":targetId}
    let msg = MsgBuild(MessageTypes.GET_APPOINTMENT_TIMES, payload, token, "JSON")
    ws.send(msg)
}


export function BookAppointment(ws, app, token){
    let payload = {"app":app}
    let msg = MsgBuild(MessageTypes.MAKE_APPOINTMENT, payload, token, "JSON")
    console.log(`sending - ${msg}`)
    ws.send(msg)
}

//#endregion


//#region Search
export function GetPublicProfileInfoRequest(ws, targetId, token){
    let payload = {id:targetId}
    let msg = MsgBuild(MessageTypes.GET_PUBLIC_PROFILE_INFO, payload, token, "JSON")
    ws.send(msg)
}


export function GetMinimalFreelancerInfo(ws, token, city, job){
    let payload = {"city":city, "job":job}
    let msg = MsgBuild(MessageTypes.GET_MINIMAL_FREELANCER_INFO, payload, token, "JSON")
    ws.send(msg)
}

export function GetAllJobs(ws, token)
{
    let msg = MsgBuild(MessageTypes.GET_JOBS, "", token, "JSON")
    ws.send(msg)
}


export function GetCitiesByJob(ws, job, token){
    let payload = {"job":job}
    let msg = MsgBuild(MessageTypes.GET_CITIES_BY_JOB, payload, token, "JSON")
    ws.send(msg)
}

//#endregion