import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Navbar from "./routerPrint";
import { MapPin, Briefcase, Search, ChevronRight } from "lucide-react";
import { GetAllJobs,GetCitiesByJob } from "../socket/RequestHandler";
import { useSocket } from "../socket/SocketContext";
import webSocketParser from "../socket/MsgParser";
import { MessageTypes, StatusMessage } from "../socket/MsgTypes";
import {handleJobsResponse, handleCitiesResponse} from "../socket/ResponseHandlers"



function SearchBar({ ws, token }) {
    const authUser = useSelector((state) => state.auth.userInfo);
    
    const [allJobTypes, setAllJobTypes] = useState([]);
    const [jobCitiesFromServer, setJobCitiesFromServer] = useState([]);

    const [searchJob, setSearchJob] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [isJobOpen, setIsJobOpen] = useState(false);
    
    const [searchCity, setSearchCity] = useState("");
    const [selectedCity, setSelectedCity] = useState(null);
    const [isCityOpen, setIsCityOpen] = useState(false);

    const jobRef = useRef(null);
    const cityRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (jobRef.current && !jobRef.current.contains(event.target)) setIsJobOpen(false);
            if (cityRef.current && !cityRef.current.contains(event.target)) setIsCityOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!ws) return;
        const handleMessage = (event) => {
            let info = webSocketParser(event.data);
        
            if (MessageTypes.BROAD === info.type){
                if (StatusMessage.TOKEN_BAD in info.data){
                    alert("Your session has ended, login again to get service")
                    dispatch(logout())
                    navigate('/login')
                }
            }
            else if (info.type === MessageTypes.GET_JOBS) {
                const [status, message] = handleJobsResponse(info);
                if (status) setAllJobTypes(message);
        
            } else if (info.type === MessageTypes.GET_CITIES_BY_JOB) {
                const [status, message] = handleCitiesResponse(info);
                if (status) setJobCitiesFromServer(message);
            }
        };

        const setup = () => {
            ws.addEventListener("message", handleMessage);
            GetAllJobs(ws, token);
        };

        if (ws.readyState === WebSocket.OPEN) setup();
        else ws.addEventListener("open", setup, { once: true });

        return () => {
            ws.removeEventListener("message", handleMessage);
        };
    }, [ws, token]);

    const resetSearch = () => {
        setSelectedJob(null);
        setSearchJob("");
        setSelectedCity(null);
        setSearchCity("");
        setJobCitiesFromServer([]);
    };

    const isLocked = selectedJob && selectedCity;

    return (
        <div className="fixed inset-0 bg-[#020617] flex overflow-hidden font-sans">
            <Navbar role={authUser?.role} />

            <main className="flex-1 ml-60 h-full relative flex flex-col items-center justify-center p-12 lg:p-24">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 blur-[130px] rounded-full" />
                </div>

                <div className="w-full max-w-6xl z-10 space-y-3">
                    <header className="space-y-4">
                        <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none">
                            Hire <span className="text-blue-500">Quality</span><br />
                            <span className="opacity-10 italic">Freelancers</span>
                        </h1>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">      
                        <div className="relative" ref={jobRef}>
                            <div className={`relative transition-all duration-300 ${selectedJob ? 'scale-[1.02]' : ''}`}>
                                <Briefcase className={`absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 z-20 ${selectedJob ? 'text-blue-400' : 'text-slate-500'}`} />
                                
                                <input
                                    type="text"
                                    readOnly={!!selectedJob}
                                    placeholder={selectedJob ? "" : "Service"}
                                    className={`w-full bg-slate-900/60 border-2 text-white text-3xl py-11 pl-20 pr-36 rounded-[2.5rem] outline-none transition-all backdrop-blur-xl shadow-2xl 
                                        ${selectedJob ? 'border-blue-500/50 shadow-blue-500/10' : 'border-slate-800 focus:border-blue-500 hover:border-slate-700'}`}
                                    value={searchJob}
                                    onFocus={() => !selectedJob && setIsJobOpen(true)}
                                    onChange={(e) => setSearchJob(e.target.value)}
                                />
                                
                                {selectedJob && (
                                    <button 
                                        onClick={resetSearch}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-6 py-3 rounded-2xl text-sm font-black tracking-widest transition-all uppercase"
                                    >
                                        Change
                                    </button>
                                )}

                                {isJobOpen && (
                                    <div className="absolute z-50 w-full mt-4 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-3xl max-h-[40vh] overflow-y-auto backdrop-blur-2xl ring-1 ring-white/10">
                                        {allJobTypes.filter(j => j.toLowerCase().includes(searchJob.toLowerCase())).map(job => (
                                            <button 
                                                key={job}
                                                onClick={() => { setSelectedJob(job); setSearchJob(job); setIsJobOpen(false); GetCitiesByJob(ws, job, token); }}
                                                className="w-full text-left px-10 py-8 text-2xl text-slate-300 hover:bg-blue-600 hover:text-white flex justify-between items-center border-b border-slate-800/50 last:border-0 transition-colors"
                                            >
                                                {job} <ChevronRight className="w-6 h-6 opacity-30" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`relative transition-all duration-700 ${!selectedJob ? 'opacity-100 blur-sm pointer-events-none scale-95' : 'opacity-100 scale-100'}`} ref={cityRef}>
                            <div className="relative">
                                <MapPin className={`absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 z-20 ${selectedCity ? 'text-blue-400' : 'text-slate-500'}`} />
                                <input
                                    type="text"
                                    readOnly={!!selectedCity}
                                    placeholder={selectedCity ? "" : "In which city?"}
                                    className={`w-full bg-slate-900/60 border-2 text-white text-3xl py-11 pl-20 pr-36 rounded-[2.5rem] outline-none transition-all backdrop-blur-xl shadow-2xl
                                        ${selectedCity ? 'border-blue-500/50 shadow-blue-500/10' : 'border-slate-800 focus:border-blue-500 hover:border-slate-700'}`}
                                    value={searchCity}
                                    onFocus={() => !selectedCity && setIsCityOpen(true)}
                                    onChange={(e) => setSearchCity(e.target.value)}
                                />

                                {selectedCity && (
                                    <button 
                                        onClick={() => { setSelectedCity(null); setSearchCity(""); }}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-6 py-3 rounded-2xl text-sm font-black tracking-widest transition-all uppercase"
                                    >
                                        Change
                                    </button>
                                )}

                                {isCityOpen && (
                                    <div className="absolute z-50 w-full mt-4 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-3xl max-h-[40vh] overflow-y-auto backdrop-blur-2xl ring-1 ring-white/10">
                                        {jobCitiesFromServer.filter(c => c.toLowerCase().includes(searchCity.toLowerCase())).map(city => (
                                            <button 
                                                key={city}
                                                onClick={() => { setSelectedCity(city); setSearchCity(city); setIsCityOpen(false); }}
                                                className="w-full text-left px-10 py-8 text-2xl text-slate-300 hover:bg-blue-600 hover:text-white border-b border-slate-800/50 last:border-0 transition-colors"
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={`pt-10 transition-all duration-1000 ${isLocked ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
                        <button className="relative w-full group overflow-hidden rounded-[3rem] p-[2px] transition-all hover:scale-[1.01] active:scale-[0.98]">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-400 to-blue-600 animate-gradient-x" />
                            
                            <div className="relative bg-white text-black py-12 rounded-[2.9rem] font-black text-5xl flex items-center justify-center gap-8 group-hover:bg-transparent group-hover:text-white transition-all duration-500">
                                <Search className="w-14 h-14 stroke-[4px] group-hover:rotate-12 transition-transform duration-500" />
                                <span>SEARCH NOW</span>
                            </div>
                        </button>
                        
                        <p className="mt-10 text-center text-slate-500 text-lg">
                            Searching for <span className="text-white font-bold">{selectedJob}</span> in <span className="text-white font-bold">{selectedCity}</span>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}




export default function SearchPage({}) {
    const ws = useSocket()
    const token = useSelector((state) => state.auth.userToken)
    return (
        <>
            <SearchBar ws={ws} token={token}/>
        </>
    )
}