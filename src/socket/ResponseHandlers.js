import {MessageTypes, StatusMessage} from "./MsgTypes"
import {login} from "../store/authSlice"
import StateManagedSelect from "react-select";


//#region Login
export const handleLoginResponse = (payload, dispatch) =>{
    if (MessageTypes.LOGIN == payload.type)
        if (payload.data == StatusMessage.LOGGED_IN)
        {
            dispatch(login())
            return true;
        }
        else if (payload.data == StatusMessage.FAILED_LOG_IN)
            return false;
        else
            console.log("Unknown response")
    else
        console.log("Unknown message type")

}
//#endregion


//#region SignUp
export const handleSignUpResponse = (payload) =>{
    let signupFailed = StatusMessage.FAILED_SIGN_UP;
    let signupSuccess = StatusMessage.SIGNING_UP;
    if (MessageTypes.USER_SIGNUP === payload.type || MessageTypes.FREELANCER_SIGNUP === payload.type){
        if (payload.data && signupFailed in payload.data){
            console.log("Failed")
            return [false,payload.data[signupFailed]]
        }
        else{
            return [true, payload.data[signupSuccess]]
        }
    }
}
//#endregion


//#region Verification
export const handleVerificationReponse = (payload) =>{
    let data = payload.data
    if (StatusMessage.VERIFICATION_BAD in data){
        return [false, data[StatusMessage.VERIFICATION_BAD]]
    }
    else if (StatusMessage.VERIFICATION_GOOD in data)
        return [true, data[StatusMessage.VERIFICATION_GOOD]]
    return [false, "Server error"]
}
//#endregion