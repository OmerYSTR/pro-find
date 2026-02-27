    import {MessageTypes, StatusMessage} from "./MsgTypes"
    import {login} from "../store/authSlice"


    //Returns true if server logged client in and false if not
    export const handleLoginResponse = (payload, dispatch) =>{
        if (MessageTypes.LOGIN_REQUEST_RESPONSE == payload.type)
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