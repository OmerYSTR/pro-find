import {useState, useEffect} from 'react'
import { useSocket } from '../socket/SocketContext'
import { UserInfoRequest } from '../socket/RequestHandler'
import { useSelector } from 'react-redux'


export default function HomePage(){
    const ws = useSocket()
    const token = useSelector((state) => state.auth.userToken)



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

        const handleMessage = (event) =>{
            console.log(`Recvd - ${event.data}`)
        }

        ws.addEventListener("message", handleMessage)

        return () =>{
            ws.removeEventListener("message", handleMessage)
        }
    }, [ws]);


    return (
        <div>HomePage</div>
    )
}