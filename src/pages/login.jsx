//#region imports
import {Link, useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'
import {LoginRequest} from '../socket/RequestHandler'
import {useSocket} from "../socket/SocketContext"
import { handleLoginResponse } from "../socket/ResponseHandlers"
import { useDispatch } from "react-redux"
import webSocketParser from "../socket/MsgParser"
//#endregion


export default function LogIn(payload){
    const ws = useSocket();
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [attempted, setAttempted] = useState(false)
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginWorked, setLoginWorked] = useState(false)


    useEffect(() =>{
        if (!ws) return;
        ws.onmessage = (event) => {
            console.log(`Recvd - ${event.data}`)
            const info = webSocketParser(event.data)
            console.log(`type - ${info.type}\ndata - ${info.data}`)

            const loggedIn = handleLoginResponse(info, dispatch);
            setLoginWorked(loggedIn)
            if (loggedIn){
                navigate("/")
            }
        }
    }, [ws, dispatch, navigate])
  
    
    const LoginClick = () =>{
        setAttempted(true)
        LoginRequest(username, password, ws)
        
    }



    return(
        <div className="fixed inset-0 flex items-center justify-center bg-yellow-100 w-full min-h-screen">
        <div className="bg-white p-10 rounded-xl shadow-md w-90 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Login</h2>

        <form className="flex flex-col items-center"   onSubmit={(e) => {
            e.preventDefault();
            setAttempted(true);
            LoginRequest(username, password, ws);
        }}>
            <input
                type="email"
                placeholder="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 mb-3 border border-gray-300 rounded-md"
            />
            <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-3 border border-gray-300 rounded-md"
            />

            {!loginWorked && attempted && (
            <p className="text-red-500 text-sm text-left mb-3">
                One of the credentials inserted is incorrect
            </p>
            )}

            <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
            Login
            </button>
        </form>
        
        <Link to="/signup" className="block mt-3 text-blue-600 hover:underline">
        Sign up
        </Link>
    </div>
    </div>
)};