import Navbar from "./routerPrint"
import "./login.css"
import {Link, useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'
import {LoginRequest} from '../socket/RequestHandler'
import {useSocket} from "../socket/SocketContext"
import { handleLoginResponse } from "../socket/ResponseHandlers"
import { useDispatch } from "react-redux"


export default function LogIn(payload){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginWorked, setLoginWorked] = useState({success:false, error:null})
    const ws = useSocket();
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() =>{
        ws.onmessage = (event) => {
            const {worked, status} = handleLoginResponse(event.data.payload, dispatch);
            setLoginWorked({success:worked, error:status})
            if (worked){
                navigate("/homePage")
            }
        }
    }, [ws])

    
    const LoginClick = () =>{
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
            {loginWorked.error && (
            <p className="error">{loginWorked.error}</p>
        )}

            <Link to="/signup"style={{ marginRight: "10px" }}>
            <button type="button">Sign up</button>
            </Link>
            
            <button type="submit" onClick = {LoginClick} >Login</button>

        </div>
    </div>
)};