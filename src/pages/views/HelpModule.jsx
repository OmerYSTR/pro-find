import { useState } from "react";
import { Check, X } from "lucide-react"


export function WelcomeBack({ username }){
    return (<>
            <header>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                    Home Page
                </h1>
                <p className="text-lg text-slate-400 mt-2">
                    Welcome back <span className="text-blue-400 font-semibold">{username}</span>
                </p>
            </header>
    </>)
}


export function NotificationsView({ notifications }){
    return (
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
    </div>)
}


export function UpcomingAppointmentsView({ appointments }){
    return (
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
    </div>)
}


export function PendingAppointments({ appointments = [] }){
  const [decisions, setDecisions] = useState({});

  const handleDecision = (index, status) => {
    setDecisions((prev) => ({
      ...prev,
      [index]: status,
    }));
  };

  const handleFinalConfirm = () => {
    const acceptedAppointments = appointments.filter((_, i) => decisions[i] === 'accepted');
    const cancelledAppointments = appointments.filter((_, i) => decisions[i] === 'cancelled');

    console.log("Saving Accepted:", acceptedAppointments);
    console.log("Saving Cancelled:", cancelledAppointments);
    
    //Need to call here two different messages to the Server
  };

  return (
    <div className="w-full bg-slate-900 text-white rounded-xl shadow-2xl overflow-hidden mt-8">
      <div className="grid grid-cols-7 gap-4 bg-slate-800 p-4 font-bold border-b border-slate-700 text-sm uppercase tracking-wider">
        <div>Date</div>
        <div>Client Name</div>
        <div>Start Time</div>
        <div>End Time</div>
        <div>Address</div>
        <div>Details</div>
        <div className="text-center">Accept</div>
      </div>

      <div className="divide-y divide-slate-800">
        {appointments.map((app, index) => (
          <div 
            key={index} 
            className={`grid grid-cols-7 gap-4 p-4 items-center transition-colors ${
              decisions[index] === 'accepted' ? 'bg-emerald-900/20' : 
              decisions[index] === 'cancelled' ? 'bg-rose-900/20' : 'hover:bg-slate-800/30'
            }`}
          >
            <div className="text-slate-300">{app.display_date}</div>
            <div className="font-medium">{app.person_name}</div>
            <div className="text-slate-400">{app.start_time}</div>
            <div className="text-slate-400">{app.end_time}</div>
            <div className="truncate text-sm" title={app.address}>{app.address}</div>
            <div className="truncate text-sm text-slate-400 italic" title={app.details}>{app.details}</div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDecision(index, 'accepted')}
                className={`p-2 rounded-full transition-all ${
                  decisions[index] === 'accepted' 
                  ? 'bg-emerald-500 text-white scale-110' 
                  : 'bg-slate-700 text-slate-400 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => handleDecision(index, 'cancelled')}
                className={`p-2 rounded-full transition-all ${
                  decisions[index] === 'cancelled' 
                  ? 'bg-rose-500 text-white scale-110' 
                  : 'bg-slate-700 text-slate-400 hover:bg-rose-600 hover:text-white'
                }`}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}

        {appointments.length === 0 && (
          <div className="p-8 text-center text-slate-500">No pending appointments found.</div>
        )}
      </div>

      <div className="p-6 bg-slate-800/50 flex justify-end">
        <button
          onClick={handleFinalConfirm}
          disabled={Object.keys(decisions).length === 0}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all transform active:scale-95"
        >
          Confirm Decisions
        </button>
      </div>
    </div>
  );
};