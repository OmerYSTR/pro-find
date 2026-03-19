// hooks/useUserSync.js
import { useEffect } from "react";
import { UserInfoRequest, MarkReadNotificationsRequest } from "../../socket/RequestHandler";
import webSocketParser from "../../socket/MsgParser";
import { handleUserInfoResponse, handleProfileInfoResponse, handleUpdatedAppointmentsResponse, handleMarkedReadNotifications } from "../../socket/ResponseHandlers";
import { logout } from "../../store/authSlice";
import { MessageTypes } from "../../socket/MsgTypes";



export default function useUserSync(ws, token, dispatch, navigate, setViewedFreelancer) {
    useEffect(() => {

        if (!ws || !token) return;

        const sendRequest = () =>{ UserInfoRequest(ws, token);}


        const handleOpen = () => sendRequest()
        if (ws.readyState === WebSocket.OPEN) {

            sendRequest();
        } else {
            ws.addEventListener("open", handleOpen);
        }

        const handleMessage = (event) => {

            let info = webSocketParser(event.data);
            console.log("Recvd - ", info)
            if (MessageTypes.GET_USER_INFO === info.type){
                const [status, msg] = handleUserInfoResponse(dispatch, info);
                if (!status) {
                    dispatch(logout());
                    navigate("/login");
                }
                else{
                    const userId = info.data.user_id;
                    MarkReadNotificationsRequest(ws, userId, token)
                }}
            else if (MessageTypes.GET_PUBLIC_PROFILE_INFO === info.type){
                const [status, data] = handleProfileInfoResponse(info) 
                if (status){
                    setViewedFreelancer(data)
                }
            }
            else if(MessageTypes.UPDATE_APPOINTMENTS_STATUS === info.type){
                const [status, data] = handleUpdatedAppointmentsResponse(info)
                if (status){
                    UserInfoRequest(ws, token)
                }
                else{
                    console.log("Error occured")
                }
            }
            else if(MessageTypes.MARK_READ_NOTIFICATION === info.type){
                const [status, data] = handleMarkedReadNotifications(info)
                if (!status){
                    console.log("Didn't manage to mark notifications as read - ", data)
                }
            }
        };

        ws.addEventListener("message", handleMessage);

        return () => {
            ws.removeEventListener("open", handleOpen);
            ws.removeEventListener("message", handleMessage);
        };
    }, [ws, token, dispatch, navigate]);
}