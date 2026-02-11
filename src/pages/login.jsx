import Navbar from "./routerPrint"
import "./login.css"
import {Link} from 'react-router-dom'

export default function LogIn(payload){
    return(
    <div className="main-container">
        <div className="main-box">
            <h2>Login</h2>
            <form>
                <input type="text" placeholder="Username" required/>
                <input type="password" placeholder="Password" required/>
            </form>   

            <Link to="/signup"style={{ marginRight: "10px" }}>
            <button type="button">Sign up</button>
            </Link>
            <button type="submit">Login</button>

        </div>
    </div>
)};