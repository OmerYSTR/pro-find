import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useSocket } from "../socket/SocketContext";

import LoadingScreen from "./views/LoadingScreen";
import Navbar from "./routerPrint";
import FreelancerView from "./views/FreelancerView";
import UserView from "./views/UserView";
import useUserSync from "./hooks/UserInfo";


export default function HomePage({isPublic=false}) {
    const ws = useSocket();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const authUser = useSelector((state) => state.auth.userInfo);
    const token = useSelector((state) => state.auth.userToken);

    const [appointmentTimes, setAppointmentTimes] = useState(null)

    const [viewedFreelancer, setViewedFreelancer] = useState({
        "id":11,
        "username":"Omer Yaffet Stern",
        "job":"Cyber Security Analyst",
        "cities":"Kfar Saba, Ra'anana",
        "description":"Hey, I am Omer and I am an intermediate Cyber Security analyst\nI take a small fee and do a whole lotta work",
        "years": 4,
        "job_duration":"2h",
        "rating":4.7,
        "price":100,
    });

    useUserSync(ws, token, dispatch, navigate, setViewedFreelancer, setAppointmentTimes, isPublic);

    const isLoaded = authUser && Object.keys(authUser).length > 0;
    
    if (!isLoaded) return <LoadingScreen />;
    
    const renderContent = () => {
        if (authUser.role === "User" && viewedFreelancer) {
            return (
                <FreelancerView 
                    user={viewedFreelancer} 
                    isPublic={true} 
                    appointmentTimes = {appointmentTimes}
                />
            );
        }

        if (authUser.role === "User") {
            return (
                <UserView/>
            );
        }

        return <FreelancerView user={authUser} isPublic={false} />;
    };

    return (
        <div className="flex fixed inset-0 bg-slate-900 w-full min-h-screen">
            <Navbar role={authUser.role}/>
            
            <div className="ml-60 pt-8 pl-4 w-full overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}