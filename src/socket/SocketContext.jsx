//#region imports
import {createContext, useContext, useState, useEffect} from 'react'
import webSocketParser from './MsgParser.js'
import { useDispatch } from 'react-redux'
//#endregion

const SocketContext = createContext(null)
let wsSingleton = null;

const getWebSocket = (ip, port) =>{
    if (!wsSingleton){
        wsSingleton = new WebSocket(`wss://${ip}:${port}`);
        wsSingleton.onopen =() =>console.log("Socket Opened");
        wsSingleton.onclose=() =>console.log("Socket Closed");
    }
    return wsSingleton;
}

export const SocketProvider = ({children}) =>{
    const [socket, setSocket] = useState(null)
    const dispatch = useDispatch()


    useEffect(() =>{
        const IP = "omer.ystr";
        const PORT = "1111";
        const ws = getWebSocket(IP, PORT)
        setSocket(ws)
    },[])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )

}

export const useSocket = () => useContext(SocketContext)