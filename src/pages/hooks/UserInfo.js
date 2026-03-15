// hooks/useUserSync.js
import { useEffect } from "react";
import { UserInfoRequest } from "../../socket/RequestHandler";
import webSocketParser from "../../socket/MsgParser";
import { handleUserInfoResponse, handleProfileInfoResponse } from "../../socket/ResponseHandlers";
import { logout } from "../../store/authSlice";
import { MessageTypes } from "../../socket/MsgTypes";



export default function useUserSync(ws, token, dispatch, navigate, setViewedFreelancer) {
    useEffect(() => {
        if (!ws || !token) return;

        const sendRequest = () => UserInfoRequest(ws, token);

        if (ws.readyState === WebSocket.OPEN) {
            sendRequest();
        } else {
            ws.addEventListener("open", sendRequest, { once: true });
        }

        const handleMessage = (event) => {
            let info = webSocketParser(event.data);
            if (MessageTypes.GET_USER_INFO === info.type){
                const [status, msg] = handleUserInfoResponse(dispatch, info);
                if (!status) {
                    dispatch(logout());
                    navigate("/login");
                }}
            else if (MessageTypes.GET_PUBLIC_PROFILE_INFO === info.type){
                const [status, data] = handleProfileInfoResponse(info) 
                if (status){
                    setViewedFreelancer(data)
                }
            }
        };

        ws.addEventListener("message", handleMessage);

        return () => {
            ws.removeEventListener("open", sendRequest);
            ws.removeEventListener("message", handleMessage);
        };
    }, [ws, token, dispatch, navigate]);
}