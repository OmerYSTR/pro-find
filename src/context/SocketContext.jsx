import {createContext, useContext, useState, useEffect} from 'react'


const SocketContext = createContext(null)

export const SocketProvider = ({children}) =>{
    const [socket, setSocket] = useState(null)

    useEffect(() =>{
        const ws = new WebSocket("ws://127.0.0.1:1111")
        setSocket(ws)
        ws.onopen =() =>console.log("Socket Opened")
        ws.onclose=() =>console.log("Socket Closed")

        return () =>ws.close()
    },[])

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )

}

export const useSocket = () => useContext(SocketContext)