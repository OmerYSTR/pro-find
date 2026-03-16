import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

export default function UserView() {
    const username = useSelector((state) => state.auth.userInfo?.name)
    const notifications = useSelector((state) => state.auth.notifications || [])
    const appointments = useSelector((state) => state.appointment?.userAppointments || [])

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fadeIn space-y-8">
            <header>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Home Page
                </h1>
                <p className="text-lg text-slate-400 mt-2">
                    Welcome back <span className="text-blue-400 font-semibold">{username}</span>
                </p>
            </header>

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
                
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 flex flex-col h-[500px]">
                    <h3 className="text-xl font-semibold text-white mb-4 text-left">Recent Activity</h3>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                        {notifications.length > 0 ? (
                            notifications.map((note, idx) => (
                                <div key={idx} className="flex flex-col items-start text-left text-slate-300 text-sm py-3 border-b border-slate-700/50 last:border-0 hover:bg-slate-700/20 transition-colors rounded-lg px-2">
                                    <div className="flex items-center justify-between w-full mb-1">
                                        <div className="flex items-center">
                                            {!note.is_read ? (
                                                <>
                                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                                                <span className="text-blue-400 font-semibold text-xs uppercase tracking-wider">
                                                    From: {note.from_name}
                                                </span>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 font-semibold text-xs uppercase tracking-wider">
                                                    From: {note.from_name}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono italic">
                                            {note.created_at}
                                        </span>
                                    </div>
                                    <p className="ml-5 text-slate-200 leading-relaxed text-left">
                                        {note.message}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-start justify-center h-full">
                                <p className="text-slate-500 italic text-sm">No new activity found.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 flex flex-col h-[500px]">
                    <h3 className="text-xl font-semibold text-white mb-6 text-left">Upcoming Appointments</h3>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                        {appointments.length > 0 ? (
                            appointments.slice(0, 5).map((app, idx) => (
                                <div key={idx} className="bg-slate-700/30 p-4 rounded-xl text-slate-300 text-sm border border-slate-600/50 shadow-inner flex flex-col items-start">
                                    <div className="flex flex-col space-y-2 w-full">
                                        <p className="flex items-start justify-start">
                                            <span className="text-blue-400 font-semibold uppercase text-[10px] tracking-wider w-24 shrink-0 mt-1">Date:</span> 
                                            <span className="text-white font-medium">{app.display_date}</span>
                                        </p>

                                        <p className="flex items-start justify-start">
                                            <span className="text-blue-400 font-semibold uppercase text-[10px] tracking-wider w-24 shrink-0 mt-1">Start Time:</span> 
                                            <span className="text-white font-medium">{app.start_time}</span>
                                        </p>

                                        <p className="flex items-start justify-start min-w-0 w-full">
                                            <span className="text-blue-400 font-semibold uppercase text-[10px] tracking-wider w-24 shrink-0 mt-1">
                                                Description:
                                            </span> 
                                            <span 
                                                title={app.details}
                                                className="text-white font-medium break-words text-left flex-1 min-w-0, truncate"
                                            >
                                                {app.details}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-start justify-center h-full">
                                <p className="text-slate-500 italic text-sm">No upcoming appointments found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}