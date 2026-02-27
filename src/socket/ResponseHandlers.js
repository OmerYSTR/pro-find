    import {MessageTypes, StatusMessage} from "./MsgTypes"
    import {login} from "../store/authSlice"


    //Returns true if server logged client in and false if not
    export const handleLoginResponse = (payload, dispatch) =>{
        if (MessageTypes.LOGIN_REQUEST_RESPONSE == payload.type)
            if (payload.data.status == StatusMessage.LOGGED_IN)
            {
                //Update user info
                dispatch(login(payload.data.info))
                return {success:true, worked:""};}
            else if (payload.data.status == StatusMessage.FAILED_LOG_IN)
                return {success:false, worked:payload.data.info};
            else
                console.log("Unknown response")
        else
            console.log("Unknown message type")

    }