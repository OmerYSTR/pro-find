import {MessageTypes, StatusMessage} from "./MsgTypes"
import {login} from "../store/authSlice"


//Returns true if server logged client in and false if not
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