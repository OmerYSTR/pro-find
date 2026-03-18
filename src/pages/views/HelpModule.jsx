import { useState } from "react";
import { Info, Check, X, Briefcase, MapPin, AlignLeft, Calendar, Star, Clock, FileText, User} from "lucide-react"
import { UpdateAppointmentsStatusRequest } from "../../socket/RequestHandler";

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


export function PendingAppointments({ appointments = [], ws, token }) {
  const [decisions, setDecisions] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);
  
  const totalDecisions = Object.keys(decisions).length;
  const gridLayout = "grid grid-cols-[1fr_1.2fr_0.5fr_0.5fr_1fr_2fr_0.4fr_1fr]";

  const handleDecision = (appId, status) => {
    setDecisions((prev) => ({ ...prev, [appId]: status }));
  };

  const handleFinalSubmit = () => {
    UpdateAppointmentsStatusRequest(ws, decisions, token);
    setDecisions({})
  };


  return (
    <>
      <div className="w-full bg-slate-900 text-white rounded-xl shadow-2xl overflow-hidden mt-8 border border-slate-800">
        
        <div className={`${gridLayout} gap-4 bg-slate-800 p-4 font-bold border-b border-slate-700 text-[10px] uppercase tracking-wider`}>
          <div>Date</div>
          <div>Client</div>
          <div>Start</div>
          <div>End</div>
          <div>Address</div>
          <div>Details</div>
          <div className="text-center">Info</div>
          <div className="text-center">Action</div>
        </div>

        <div className="divide-y divide-slate-800">
          {appointments.map((app) => (
            <div key={app.id} className={`${gridLayout} gap-4 p-4 items-center transition-all ${
              decisions[app.id] === 'accepted' ? 'bg-emerald-900/10' : 
              decisions[app.id] === 'cancelled' ? 'bg-rose-900/10' : 'hover:bg-slate-800/30'
            }`}>
              <div className="text-slate-400 text-xs">{app.display_date}</div>
              <div className="font-semibold truncate text-sm">{app.person_name}</div>
              <div className="text-slate-300 text-xs">{app.start_time}</div>
              <div className="text-slate-300 text-xs">{app.end_time}</div>
              <div className="truncate text-xs text-slate-500" title={app.address}>{app.address}</div>
              <div className="text-sm text-slate-300 truncate" title={app.details}>{app.details}</div>
              
              <div className="flex justify-center">
                <button 
                  onClick={() => setSelectedApp(app)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                >
                  <Info size={18} />
                </button>
              </div>

              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => handleDecision(app.id, 'accepted')} 
                  className={`p-2 rounded-full transition-all ${decisions[app.id] === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-emerald-600 hover:text-white'}`}
                >
                  <Check size={16} />
                </button>
                <button 
                  onClick={() => handleDecision(app.id, 'cancelled')} 
                  className={`p-2 rounded-full transition-all ${decisions[app.id] === 'cancelled' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-rose-600 hover:text-white'}`}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {totalDecisions > 0 ? (
              <span>You have marked <b className="text-white">{totalDecisions}</b> appointments.</span>
            ) : (
              <span>Select appointments to accept or decline.</span>
            )}
          </div>
          
          <button
            onClick={handleFinalSubmit}
            disabled={totalDecisions === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all transform active:scale-95 ${
              totalDecisions > 0 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] text-white' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Confirm & Save Changes
          </button>
        </div>

      </div> 
      <AppointmentDetailModal 
        appointment={selectedApp} 
        onClose={() => setSelectedApp(null)} 
      />
    </>
  );
}


export function FreelancerInfo({ profession, serviceCities, description, years_experience, jobDuration, rating }){
    return (
        <div className="bg-slate-800/40 border border-slate-700 p-8 rounded-3xl shadow-2xl backdrop-blur-md animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">{profession}</h2>
                    <div className="flex items-center gap-2 mt-2 text-yellow-400">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold text-lg">{rating || "New"}</span>
                        <span className="text-slate-500 text-sm fon t-normal">Rating</span>
                    </div>
                </div>
                
                <div className="bg-blue-600/20 border border-blue-500/30 px-5 py-2 rounded-2xl">
                    <p className="text-blue-400 text-sm uppercase font-bold tracking-widest">Experience</p>
                    <p className="text-white text-xl font-bold">{years_experience} Years</p>
                </div>
            </div>

            <hr className="border-slate-700/50 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <FileText className="w-5 h-5" />
                        <h4 className="font-semibold uppercase text-xs tracking-wider">About Me</h4>
                    </div>
                    <p className="text-slate-300 leading-relaxed italic">
                        "{description}"
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-4 p-4 bg-slate-900/40 rounded-xl border border-slate-700/30">
                        <MapPin className="w-6 h-6 text-purple-500 mt-1" />
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Service Cities</p>
                            <p className="text-slate-200">{serviceCities || 'Remote'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-slate-900/40 rounded-xl border border-slate-700/30">
                        <Clock className="w-6 h-6 text-blue-500 mt-1" />
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Avg. Project Duration</p>
                            <p className="text-slate-200">{jobDuration}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function AppointmentDetailModal({ appointment, onClose }) {
  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="text-blue-400" size={20} />
            {appointment.person_name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
              <p className="text-slate-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                <Calendar size={12}/> Date
              </p>
              <p className="text-white font-medium">{appointment.display_date}</p>
            </div>
            <div className="flex-1 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
              <p className="text-slate-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                <Clock size={12}/> Time
              </p>
              <p className="text-white font-medium">{appointment.start_time} - {appointment.end_time}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-slate-500 text-xs uppercase font-bold flex items-center gap-1">
              <MapPin size={14} className="text-rose-500" /> Address
            </p>
            <p className="text-slate-200 leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
              {appointment.address}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-slate-500 text-xs uppercase font-bold flex items-center gap-1">
              <AlignLeft size={14} className="text-blue-500" /> Full Details
            </p>
            <div className="text-slate-300 leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {appointment.details || "No additional details provided."}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-800/30 border-t border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}