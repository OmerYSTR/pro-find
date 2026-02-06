//#region imports
import {createContext, useContext, useState, useEffect} from 'react'
import { handleCase } from './MessageHandler.js'
import webSocketParser from './parseWebSocket.js'
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
        const ws = getWebSocket("127.0.0.1", "1111")
        setSocket(ws)

        const handleMessage = (event) => {
            try{
                const parsed = webSocketParser(event.data)

                if (!parsed) return;
                

                const {type, data} = parsed;
                const payload = data;
                console.log(`Type of message:${type}\nPayload of message:`,payload);
                
                handleCase(type, payload, dispatch);
              
            } catch(err){console.error('Failed to parse message: ',err);}
        };

        ws.addEventListener("message", handleMessage);
        return () => ws.removeEventListener("message", handleMessage);

    },[])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )

}

export const useSocket = () => useContext(SocketContext)