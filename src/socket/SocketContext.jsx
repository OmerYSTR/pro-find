//#region imports
import {createContext, useContext, useState, useEffect} from 'react'
import { useDispatch } from 'react-redux'
import { MessageTypes } from './SocketMessageTypes.js'
import { 
    appointmentRecvd, 
    appointmentAddedForUser, 
    appointmentAddedForFreelancer, 
    appointmentRemovedForUser, 
    appointmentRemovedForFreelancer } 
from '../store/appointmentsSlice.js'
import {login, logout} from '../store/authSlice.js'
import { professionalRecvd,setFilter } from '../store/professionalsSlice.js'
import webSocketParser from './parseWebSocket.js'
//#endregion

const SocketContext = createContext(null)
let wsSingleton = null;
const getWebSocket = () =>{
    if (!wsSingleton){
        wsSingleton = new WebSocket('ws://127.0.0.1:1111');
        wsSingleton.onopen =() =>console.log("Socket Opened");
        wsSingleton.onclose=() =>console.log("Socket Closed");
    }
    return wsSingleton;
}

export const SocketProvider = ({children}) =>{
    const [socket, setSocket] = useState(null)
    const dispatch = useDispatch()


    useEffect(() =>{
        const ws = getWebSocket()
        setSocket(ws)
        const handleMessage = (event) => {
            try{
                //console.log(event.data)
                const parsed = webSocketParser(event.data)
                if (!parsed) return;
                const {type, data} = parsed;
                const payload = data
                console.log(type, payload)
                
                switch (type){
                    case MessageTypes.USER_INFO:
                        dispatch(login(payload));
                        break;
                    case MessageTypes.GET_APPOINTMENTS:
                        dispatch(appointmentRecvd(payload));
                        break;
                    case MessageTypes.NEW_APPOINTMENT_USER_RECEIVED:
                        dispatch(appointmentAddedForUser(payload));
                        break;
                    case MessageTypes.NEW_APPOINTMENT_FREELANCER_RECEIVED:
                        dispatch(appointmentAddedForFreelancer(payload));
                        break;
                    case MessageTypes.REMOVED_APPOINTMENT_USER:
                        dispatch(appointmentRemovedForUser(payload));
                        break;
                    case MessageTypes.REMOVED_APPOINTMENT_FREELANCER:
                        dispatch(appointmentRemovedForFreelancer(payload));
                        break;
                    case MessageTypes.PROFESSIONAL_LIST:
                        dispatch(professionalRecvd(payload));
                        break;
                    case MessageTypes.PROFESSIONAL_FILTER:
                        dispatch(setFilter(payload));
                        break;
                    default:
                        console.warn('Unknown message type: ', type);
                }
            }
            catch(err){console.error('Failed to parse message: ',err);}
        };

        ws.addEventListener("message", handleMessage);
        return () => ws.removeEventListener("message", handleMessage);

    },[dispatch])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )

}

export const useSocket = () => useContext(SocketContext)