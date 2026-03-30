import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
    const location = useLocation();
    
    const authUser = useSelector((state) => state.auth.userInfo);
    const token = useSelector((state) => state.auth.userToken);

    const { id } = useParams(); 

    const [targetId, setTargetId] = useState(id || location.state?.freelancerId ||null)

    const [appointmentTimes, setAppointmentTimes] = useState(null)

    const [viewedFreelancer, setViewedFreelancer] = useState(null)

    useUserSync(ws, token, dispatch, navigate, setViewedFreelancer, setAppointmentTimes, targetId, isPublic || (targetId != null));

    const isLoaded = authUser && Object.keys(authUser).length > 0;
    
    useEffect(() =>{
        const currentUserId = id || location.state?.freelancerId ||null
        if (currentUserId == null){
            setViewedFreelancer(null)
            setAppointmentTimes(null)
            return
        }
    }, [id,location.state])


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