import Navbar from "./routerPrint"
import "./login.css"
import {Link} from 'react-router-dom'
import {useState} from 'react'
import {LoginRequest} from '../socket/RequestHandler'
import {useSocket} from "../socket/SocketContext"
export default function LogIn(payload){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const ws = useSocket();
    
    const LoginClick = () =>{
        LoginRequest(username, password, ws)
    }

    return(
    <div className="main-container">
        <div className="main-box">

            <h2>Login</h2>

            <form>
                <input type="text" placeholder="Username" required value={username} onChange = {(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" required value={password} onChange = {(e) => setPassword(e.target.value)}/>
            </form>   


            <Link to="/signup"style={{ marginRight: "10px" }}>
            <button type="button">Sign up</button>
            </Link>
            
            <button type="submit" onClick = {LoginClick} >Login</button>

        </div>
    </div>
)};