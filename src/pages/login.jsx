//#region imports
import {Link, useNavigate} from 'react-router-dom'
import {useState, useEffect} from 'react'
import {LoginRequest, ForgotPasswordVerificationCodeRequest, ForgotPasswordAuthenticationRequest, ChangePasswordRequest} from '../socket/RequestHandler'
import {useSocket} from "../socket/SocketContext"
import { handleLoginResponse, handleChangePasswordResponse, handleForgotPasswordVerificationCodeResponse, handleForgotPasswordVerifyCodeResponse } from "../socket/ResponseHandlers"
import { useDispatch } from "react-redux"
import webSocketParser from "../socket/MsgParser"
import {InputField, ErrorMessage, EmailVerification} from "./signUpModule"
import { MessageTypes } from '../socket/MsgTypes'
//#endregion


function ForgotPassword({goBack, ws, email, setEmail, errorMessage}){

    const [attempted, setAttempted] = useState(false)


    return(
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900 w-full min-h-screen">
            <div className="bg-slate-700 p-10 rounded-xl shadow-md w-96 text-center">
                <h2 className="text-2xl font-bold text-gray-300 mb-4">
                    Forgot Password
                </h2>
                <p className="text-gray-300 text-sm mb-6">
                    Enter your email and we will send a verification code so you can reset your password.
                </p>
                <form className="flex flex-col items-center space-y-4" onSubmit={(e)=>{e.preventDefault();setAttempted(true); ForgotPasswordVerificationCodeRequest(ws, email);}}
                >
                    <div className="w-full">
                        <InputField type="email" name="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email"/>
                    </div>

                    {errorMessage && <ErrorMessage message={errorMessage}/>}
                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                        Send Reset Email
                    </button>
                </form>

                <button
                    type = "button"
                    className="w-full p-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    onClick={goBack}
                >
                    Back to login
                </button>

            </div>
        </div>
    )
}


function ChangePassword({changePasswordRequest, password, setPassword }) {
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        else
            changePasswordRequest()
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900 w-full min-h-screen">
            <div className="bg-slate-700 p-10 rounded-xl shadow-md w-96 text-center">
                <h2 className="text-2xl font-bold text-gray-300 mb-4">
                    Change Password
                </h2>
                <p className="text-gray-300 text-sm mb-6">
                    Enter your new password and confirm it.
                </p>

                <form className="flex flex-col items-center space-y-4" onSubmit={handleSubmit}>
                    <div className="w-full">
                        <InputField
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                        />
                    </div>

                    <div className="w-full">
                        <InputField type="password" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password"/>
                    </div>

                    {errorMessage && <ErrorMessage message={errorMessage} />}

                    <button
                        type="submit"
                        className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
}


    export default function LogIn(payload){
    const ws = useSocket();
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const [attempted, setAttempted] = useState(false)
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginWorked, setLoginWorked] = useState(false)

    const [forgotPassword, setForgotPassword] = useState(false)
    
    const [verificationCode, setVerificationCode] = useState("")

    const [email, setEmail] = useState("")

    const [serverError, setServerError] = useState("")

    const [showVerification, setShowVerification] = useState(false)
    
    const [showChangePass, setShowChangePass] = useState(false)

    const [pass, setPass] = useState("")

    const handleVerificationCodeSubmit = () =>
    {
        ForgotPasswordAuthenticationRequest(ws, email, verificationCode)
    }

    const handleChangePassword = () =>{
        ChangePasswordRequest(ws, email, pass);
    }
    
    useEffect(() =>{
        if (!ws) return;
        ws.onmessage = (event) => {
            setServerError("")
            console.log(`Recvd - ${event.data}`)
            const info = webSocketParser(event.data)
            console.log(`type - ${info.type}\ndata - ${info.data}`)
            if (info.type == MessageTypes.LOGIN){
                setAttempted(true)
                const loggedIn = handleLoginResponse(info, dispatch);
                setLoginWorked(loggedIn)
                if (loggedIn){
                    navigate("/")
                }}

            else if(info.type == MessageTypes.FORGOT_PASSWORD_REQUEST){
                const veri_sent = handleForgotPasswordVerificationCodeResponse(info)
                if (veri_sent){setShowVerification(true); setForgotPassword(false);
                }else setServerError("Error in verifying your email")}

            else if(info.type == MessageTypes.FORGOT_PASSWORD_AUTHENTICATION){
                const veri_sent = handleForgotPasswordVerifyCodeResponse(info)
                if (veri_sent){setShowVerification(false); setShowChangePass(true)}
                else setServerError("Error verifying email")
            }

            else if (info.type ==MessageTypes.CHANGE_PASS){
                const pass_accepted = handleChangePasswordResponse(info)
                if (pass_accepted){
                    navigate("/")
                }
                else setServerError("Error verifying password")
            }
        }

    }, [ws, dispatch, navigate])


    if (forgotPassword){
        return <ForgotPassword errorMessage={serverError} goBack={() => setForgotPassword(false)} ws={ws} email={email} setEmail={(email) => setEmail(email)} />
    }

    if (showVerification)
        return <EmailVerification verificationCode={verificationCode} setVerificationCode={setVerificationCode} handleVerificationCodeSubmit={handleVerificationCodeSubmit} serverError={serverError} />

    if (showChangePass)
        return <ChangePassword changePasswordRequest={handleChangePassword} password={pass} setPassword={setPass} />
    return(
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900 w-full min-h-screen">
        <div className="bg-slate-700 p-10 rounded-xl shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Login</h2>

        <form className="flex flex-col items-center space-y-4"   onSubmit={(e) => {
            e.preventDefault();
            setAttempted(true);
            LoginRequest(username, password, ws);
        }}>
            <div className='w-full'>    
                <InputField type={"email"} name={"email"} value={username} onChange={(e) => setUsername(e.target.value)} placeholder={"Email"} />
            </div>
            
            <div className='w-full'>    
                <InputField type={"password"} name={"password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={"Password"} />
            </div>
            
            {!loginWorked && attempted && (
                <ErrorMessage message={"One or more of the credentials is incorrect"} />
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
                
        <button
            type="button"
            onClick={() => setForgotPassword(true)}
            className="mt-3 text-blue-600 hover:underline text-sm"
        >
            Forgot Password?
        </button>

    </div>
    </div>
)};