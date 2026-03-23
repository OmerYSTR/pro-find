import {MessageTypes, StatusMessage} from "./MsgTypes"
import {login, setUserInfo} from "../store/authSlice"
import StateManagedSelect from "react-select";
import { appointmentsRecvd } from "../store/appointmentsSlice";


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
    let data = payload.data

    if (StatusMessage.FAILED_TO_GET_USER_INFO in data){
        return [false, "Issue retrieving info"]
    }
    else{
        const accInfo = data[StatusMessage.GOT_USER_INFO]
        let toInsert = {"user":{}}
        for (const key in accInfo){
            if (key === "appointments" || key==="notifications") continue;
            
            toInsert["user"][key] = accInfo[key]
        }
        toInsert["user"]["id"] = data["user_id"]
        toInsert["notifications"] = accInfo["notifications"]
        dispatch(setUserInfo(toInsert)) 
        dispatch(appointmentsRecvd(accInfo["appointments"]))   
        return [true, data["user_id"]]
    }
}


export const handleUpdatedAppointmentsResponse = (payload) =>{
    let data = payload.data
    if (StatusMessage.FAILED_TO_UPDATE_APP_STATUS in data)
        return [false, "Failed to update status"]
    else if (StatusMessage.UPDATED_APP_STATUS in data)
        return [true, ""]
}


export const handleMarkedReadNotifications = (payload) =>{
    let data = payload.data
    if (StatusMessage.MARKED_READ_NOTIFICATIONS in data){
        return [true, ""]
    }  
    else{
        return [false, data[StatusMessage.FAILED_TO_MARK_READ_NOTIFICATIONS]]
    }

}


export const handleAppointmentTimes = (payload) =>{
    let data = payload.data
    if (StatusMessage.GOT_APPOINTMENT_TIMES in data)
        return [true, data[StatusMessage.GOT_APPOINTMENT_TIMES]]
    else 
        return [false, data[StatusMessage.FAILED_TO_GET_APPOINTMENT_TIMES]]
        
}


export const handleAppointmentMadeResponse = (payload) =>{
    let data = payload.data

    if (StatusMessage.BOOKED_APPOINTMENT in data)
        return [true, ""]
    else
        return [false, data[StatusMessage.FAILED_TO_BOOK_APPOINTMENT]]
}


//#endregion


//#region Search
export const handleProfileInfoResponse = (payload) => {
    return;
}


export const handleJobsResponse = (payload) =>{
    let data = payload.data
    console.log(data)
    if (StatusMessage.GOT_JOBS in data){
        return [true, data[StatusMessage.GOT_JOBS]["jobs"]]
    }
    else{
        return [false, data[StatusMessage.FAILED_TO_GET_JOBS]]
    }
}


export const handleCitiesResponse = (payload) =>{
    let data = payload.data
    if (StatusMessage.GOT_CITIES in data) 
        return [true, data[StatusMessage.GOT_CITIES]["cities"]]
    else
        return [false, data[StatusMessage.FAILED_TO_GET_CITIES]]
}

//#endregion