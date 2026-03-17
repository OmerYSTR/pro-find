import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { WelcomeBack, NotificationsView, UpcomingAppointmentsView } from "./HelpModule"



export default function UserView() {
    const username = useSelector((state) => state.auth.userInfo?.name)
    const notifications = useSelector((state) => state.auth.notifications || [])
    const appointments = useSelector((state) => state.appointment?.userAppointments || [])

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fadeIn space-y-8">
            <WelcomeBack username={username}/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border-l-4 border-purple-500 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Notifications</p>
                    <p className="text-3xl font-bold text-white mt-1">{notifications.length}</p>
                </div>
                <div className="bg-slate-800/50 border-l-4 border-blue-500 p-6 rounded-xl shadow-lg backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Scheduled Appointments</p>
                    <p className="text-3xl font-bold text-white mt-1">{appointments.length}</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 py-16 px-8 rounded-3xl border border-blue-500/20 flex flex-col items-center justify-center shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-8">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    <Link to="/search" className="flex items-center justify-center py-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-lg font-semibold border border-slate-600 shadow-lg hover:scale-105">
                        Find Freelancers
                    </Link>
                    <Link to="/schedule" className="flex items-center justify-center py-10 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-lg font-semibold border border-slate-600 shadow-lg hover:scale-105">
                        View Calendar
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <NotificationsView notifications={notifications}/>

                <UpcomingAppointmentsView appointments={appointments}/>            
            </div>
        </div>
    )
}