import {MessageTypes, StatusMessage} from "./MsgTypes"
import {login, setUserInfo} from "../store/authSlice"
import StateManagedSelect from "react-select";
import { appointmentsRecvd } from "../store/appointmentsSlice";


function CheckBROADErrors(payload){
    let data = payload.data
    if (payload.type === MessageTypes.BROAD){
        if (StatusMessage.TOKEN_BAD in data)
            return [false, "Token invalid.\nRefresh page"]
        //else ....
    }
    else{ return [true, ""]}
}


//#region Login
export const handleLoginResponse = (payload, dispatch) =>{
    if (MessageTypes.LOGIN == payload.type)
        if (StatusMessage.LOGGED_IN in payload.data)
        {
            dispatch(login(payload.data[StatusMessage.LOGGED_IN]))
            return [true, payload.data[StatusMessage.LOGGED_IN]];
        }
        else if (StatusMessage.FAILED_LOG_IN in payload.data)
            return [false, payload.data[StatusMessage.FAILED_LOG_IN]];
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


//#region Forgot password
export const handleForgotPasswordVerificationCodeResponse =(payload) =>{
    let data = payload.data
    if (StatusMessage.FORGOT_PASSWORD_GOOD in data)
        return [true, data[StatusMessage.FORGOT_PASSWORD_GOOD]]
    else
        return [false, data[StatusMessage.FORGOT_PASSWORD_BAD]]
}

export const handleForgotPasswordVerifyCodeResponse = (payload) =>{
    let data = payload.data
    if (StatusMessage.FORGOT_PASSWORD_GOOD in data)
        return [true, StatusMessage.FORGOT_PASSWORD_GOOD]
    else
        return [false, StatusMessage.FORGOT_PASSWORD_BAD]
}

export const handleChangePasswordResponse = (payload) =>{
    let data = payload.data
    if (StatusMessage.CHANGE_PASSWORD_BAD in data)
        return [false, data[StatusMessage.CHANGE_PASSWORD_BAD]]
    else
        return [true,data[StatusMessage.CHANGE_PASSWORD_GOOD]]
}

//#endregion

//#region Homepage
export const handleUserInfoResponse = (dispatch, payload) =>{
    const [notExist, statusMessage] = CheckBROADErrors(payload)
    if (!notExist){
        return [notExist, statusMessage]
    }

    else{
        let data = payload.data

        if (StatusMessage.FAILED_TO_GET_USER_INFO in data){
            return [false, "Issue retrieving info"]
        }
        else{
            const accInfo = data[StatusMessage.GOT_USER_INFO]
            let toInsert = {"user":{}}
            for (const key in accInfo){
                if (key === "appointments") break
                
                toInsert["user"][key] = accInfo[key]
            }
            toInsert["notifications"] = accInfo["notifications"]
            dispatch(setUserInfo(toInsert)) 

            let action = {"payload":accInfo["appointments"]}
            dispatch(appointmentsRecvd(action))   
        }
    }
}


//#endregion