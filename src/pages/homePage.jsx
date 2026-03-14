import { useEffect, useState } from "react";
import { useSocket } from "../socket/SocketContext";
import { UserInfoRequest } from "../socket/RequestHandler";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "./routerPrint";
import webSocketParser from "../socket/MsgParser";
import { handleUserInfoResponse } from "../socket/ResponseHandlers";

export default function HomePage() {
    const ws = useSocket();
    const token = useSelector((state) => state.auth.userToken);
    const dispatch = useDispatch()




    useEffect(() => {
        if (!ws || !token) return;

        const sendRequest = () => UserInfoRequest(ws, token);

        if (ws.readyState === WebSocket.OPEN) {
            sendRequest();
        } else {
            ws.addEventListener("open", sendRequest, { once: true });
        }

        return () => ws.removeEventListener("open", sendRequest);
    }, [ws, token]);


    useEffect(() => {
        if (!ws) return;

        const handleMessage = (event) => {
            let info = webSocketParser(event.data)
            console.log("Recvd - ", info)
            handleUserInfoResponse(dispatch, info)
        };

        ws.addEventListener("message", handleMessage);

        return () => {
            ws.removeEventListener("message", handleMessage);
        };
    }, [ws]);

    return (
        <div className="flex fixed inset-0 bg-slate-900 w-full min-h-screen">
            <Navbar/>


            <div className="ml-60 pt-8 pl-4">
                <h1 className="text-5xl font-extrabold text-white tracking-wide">
                Account Home Page
                </h1>
            </div>
        </div>
    );
}