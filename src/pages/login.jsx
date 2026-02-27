//#region imports
import Navbar from "./routerPrint"
import "./login.css"
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
        ws.onmessage = (event) => {
            console.log(`Recvd - ${event.data}`)
            const info = webSocketParser(event.data)
            console.log(`type - ${info.type}\ndata - ${info.data}`)

            const loggedIn = handleLoginResponse(info, dispatch);
            setLoginWorked(loggedIn)
            if (loggedIn){
                navigate("/homePage")
            }
        }
    }, [ws, dispatch, navigate])
  
    
    const LoginClick = () =>{
        setAttempted(true)
        LoginRequest(username, password, ws)
        
    }



    return(
    <div className="main-container">
        <div className="main-box">

            <h2>Login</h2>

            <form>
                <input type="text" placeholder="email" required value={username} onChange = {(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" required value={password} onChange = {(e) => setPassword(e.target.value)}/>
            </form>   
            {!loginWorked && attempted &&(
            <p className="error">One of the credentials inserted is incorrect</p>
        )}

            <Link to="/signup"style={{ marginRight: "10px" }}>
            <button type="button">Sign up</button>
            </Link>
            
            <button type="button" onClick = {LoginClick} >Login</button>

        </div>
    </div>
)};