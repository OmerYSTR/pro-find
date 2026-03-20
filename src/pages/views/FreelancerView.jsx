import { WelcomeBack, WelcomeTo, NotificationsView, UpcomingAppointmentsView, PendingAppointments, FreelancerInfo, AppointmentBooking } from "./ViewModule"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { useRef, useState, useEffect } from "react"
import { useSocket } from "../../socket/SocketContext"
import { Calendar } from "lucide-react"
import { BookAppointment } from "../../socket/RequestHandler"

function FreelancerPublic({ user, ws, token }){
    const mockAvailability = {
    "2026-03-20": ["14:00", "15:30", "16:00", "17:00"],
    
    "2026-03-21": [
        "08:00", "09:00", "10:00", "11:00", 
        "13:00", "14:00", "15:00", "16:00"
    ],
    
    "2026-03-23": ["12:00", "13:00"],
    
    "2026-03-24": ["18:00", "19:00", "20:00"],
    
    "2026-03-25": ["09:30", "10:30", "14:30", "15:30"]
    };
    const profId = user.id
    const username = user.username
    const job = user.job 
    const cities = user.cities
    const description = user.description
    const years = user.years
    const jobDuration = user.job_duration
    const rating = user.rating
    const price = user.price

    const [makeAppointment, setMakeAppointment] = useState(false)

    const [app, setApp] = useState(null)
   
    useEffect(() => {
        if (!app) {return;}
        else{BookAppointment(ws, app, token);}
    }, [app])


    return (<>

            { !makeAppointment ? (
                    <div  className="p-8 max-w-6xl mx-auto animate-fadeIn space-y-8">
                        <WelcomeTo username={username}/>

                        <FreelancerInfo profession={job} serviceCities={cities}  description={description} years_experience={years} jobDuration={jobDuration} rating={rating} pricePerHour={price} />
                    
                    
                        <button
                        onClick={() => setMakeAppointment(true)} 
                        className="mt-8 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 
                        hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all 
                        duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group">
                            <Calendar className="w-5 h-5 group-hover:animate-pulse" />
                            <span>Make Appointment</span>
                        </button>
                    </div>
                ) : (
                    <AppointmentBooking 
                    availability={mockAvailability} 
                    jobDuration={jobDuration} 
                    onConfirm={(app) => setApp(app)} 
                    onCancel={() => setMakeAppointment(false)}
                    price={price}/>
                )   
            }   
        </>
    )
}



function FreelancerPrivate({ws, token}){
    const acceptAppointmentsRef = useRef(null);
    const scrollToRef = () =>(acceptAppointmentsRef.current?.scrollIntoView({behavior:"smooth"}))


    const userInfo = useSelector((state) => state.auth.userInfo)

    const username = useSelector((state) => state.auth.userInfo?.name)
    const notifications = useSelector((state) => state.auth.notifications || [])
    const appointments = useSelector((state) => state.appointment?.freelancerAppointments || [])

    const confirmedAppointments = appointments.filter((app) => app.status === "Confirmed")
    const pendingAppointments = appointments.filter((app) => app.status === "Requested")
    
    return (
        <div className="p-8 max-w-6xl mx-auto animate-fadeIn space-y-8">
            <WelcomeBack username={username}/>


            <FreelancerInfo profession={userInfo?.job} serviceCities={userInfo?.cities} description={userInfo?.description} years_experience={userInfo?.years} jobDuration={userInfo?.job_duration} rating={userInfo?.rating} pricePerHour={userInfo?.hour_price} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border-l-4 border-purple-500 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Notifications</p>
                    <p className="text-3xl font-bold text-white mt-1">{notifications.length}</p>
                </div>

                <div className="bg-slate-800/50 border-l-4 border-blue-500 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Scheduled Appointments</p>
                    <p className="text-3xl font-bold text-white mt-1">
                    {confirmedAppointments.length}
                    </p>
                </div>

                <div className="bg-slate-800/50 border-l-4 border-emerald-500 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Pending Appointments</p>
                    <p className="text-3xl font-bold text-white mt-1">
                    {pendingAppointments.length}
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 py-16 px-8 rounded-3xl border border-blue-500/20 flex flex-col items-center justify-center shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-8">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    <button onClick={scrollToRef} className="flex items-center justify-center py-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-lg font-semibold border border-slate-600 shadow-lg hover:scale-105">
                        Accept Pending appointments
                    </button>
                    <Link to="/schedule" className="flex items-center justify-center py-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-lg font-semibold border border-slate-600 shadow-lg hover:scale-105">
                        View Calendar
                    </Link>
                </div>
            </div>
 
 
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <NotificationsView notifications={notifications} />

                <UpcomingAppointmentsView appointments={confirmedAppointments}/>
            </div>
            
            <div ref={acceptAppointmentsRef}>
                <PendingAppointments appointments={pendingAppointments} ws={ws} token={token}/>
            </div>
            


        </div>


        

    )
}




export default function FreelancerView({ user, isPublic}){
    const ws = useSocket()
    const token = useSelector((state) => state.auth.userToken)

    return (
        <>
            {isPublic ? (
                <FreelancerPublic user={user} ws={ws} token={token}/>
            ): (
                <FreelancerPrivate ws={ws} token={token}/>
            )
            }
        </>
    )
}