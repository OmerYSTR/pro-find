// hooks/useUserSync.js
import { useEffect } from "react";
import { UserInfoRequest, MarkReadNotificationsRequest, GetPublicProfileInfoRequest } from "../../socket/RequestHandler";
import webSocketParser from "../../socket/MsgParser";
import { handleUserInfoResponse, handleProfileInfoResponse, handleUpdatedAppointmentsResponse, handleMarkedReadNotifications, handleAppointmentTimes, handleAppointmentMadeResponse } from "../../socket/ResponseHandlers";
import { logout } from "../../store/authSlice";
import { MessageTypes, StatusMessage } from "../../socket/MsgTypes";

export default function useUserSync(ws, token, dispatch, navigate, setViewedFreelancer, setAppointmentTimes, target_id, isPublic=false) {
    useEffect(() => {

        if (!ws || !token) return;
        const sendRequest = () =>{ if (!isPublic) {UserInfoRequest(ws, token);} if (target_id){ GetPublicProfileInfoRequest(ws, target_id, token)}}


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
                }
            }
           
            else if (MessageTypes.GET_PUBLIC_PROFILE_INFO === info.type){
                const [status, data] = handleProfileInfoResponse(info) 
                if (status){
                    setViewedFreelancer(data)
                }
                else{
                    alert(data)
                    navigate("/search")
                }
            }
           
            else if(MessageTypes.UPDATE_APPOINTMENTS_STATUS === info.type){
                const [status, data] = handleUpdatedAppointmentsResponse(info)
                if (status){
                    UserInfoRequest(ws, token)
                }
                else{
                    console.log("Error occured ", data)
                    UserInfoRequest(ws, token)
                }
            }
            
            else if(MessageTypes.MARK_READ_NOTIFICATION === info.type){
                const [status, data] = handleMarkedReadNotifications(info)
                if (!status){
                    console.log("Didn't manage to mark notifications as read - ", data)
                }
            }

            else if(MessageTypes.GET_APPOINTMENT_TIMES === info.type){
                const [status, msg] = handleAppointmentTimes(info)
                if (status){
                    setAppointmentTimes(msg)
                    console.log(msg)
                }
                else
                    setAppointmentTimes(null)
            }

            else if (MessageTypes.MAKE_APPOINTMENT === info.type) {
                const [status, msg] = handleAppointmentMadeResponse(info);
                if (status) {
                    setAppointmentTimes(null)
                    alert("Success!");
                    navigate("/search"); 
                } else {
                    alert("Error: " + msg);
                }
            }

            else if (MessageTypes.BROAD === info.type){
                if (StatusMessage.TOKEN_BAD in info.data){
                    alert("Your session has ended, login again to get service")
                    dispatch(logout())
                    navigate('/login')
                }
            }
        };

        ws.addEventListener("message", handleMessage);

        return () => {
            ws.removeEventListener("open", handleOpen);
            ws.removeEventListener("message", handleMessage);
        };
    }, [ws, token, target_id, isPublic]);
}