import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "./routerPrint";
import { MapPin, Briefcase, Search, ChevronRight, Ellipse, User, Star, CreditCard, ArrowLeft} from "lucide-react";
import { GetAllJobs,GetCitiesByJob, GetMinimalFreelancerInfo, GetPublicProfileInfoRequest } from "../socket/RequestHandler";
import { useSocket } from "../socket/SocketContext";
import webSocketParser from "../socket/MsgParser";
import { MessageTypes, StatusMessage } from "../socket/MsgTypes";
import {handleJobsResponse, handleCitiesResponse, handleMinimalFreelancerInfoResponse} from "../socket/ResponseHandlers"
import LoadingScreen from "./views/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";

function SearchBar({ ws, token, handleSubmit }) {
    const navigate = useNavigate()
    const authUser = useSelector((state) => state.auth.userInfo);
    const dispatch = useDispatch()


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
                        <button onClick={() => handleSubmit(selectedCity, selectedJob)} className="relative w-full group overflow-hidden rounded-[3rem] p-[2px] transition-all hover:scale-[1.01] active:scale-[0.98]">
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


function FreelancersMenu({ws, token, goBack, city, job}){
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const authUser = useSelector((state) => state.auth.userInfo)
    const [gotFreelancersInfo, setGotFreelancersInfo] = useState(false)
    const [freelancersInfo, setFreelancersInfo] = useState(null)

    const hasRequested = useRef(false)

    const handleOnclick = (id) =>{
        GetPublicProfileInfoRequest(ws, id, token)
        navigate(`/profile/${id}`, { state: { freelancerId: id } });
    } 


    useEffect(() => {
        const handleMessage = (event) =>{
            if (!ws) return;

            const info = webSocketParser(event.data)
            if (info.type === MessageTypes.BROAD){
                if (StatusMessage.TOKEN_BAD in info.data){
                    alert("Invalid token, ending session. Log in to keep searching");
                    dispatch(logout())
                    navigate("/login")
                }
            }

            else if(info.type === MessageTypes.GET_MINIMAL_FREELANCER_INFO){
                const [status, msg] = handleMinimalFreelancerInfoResponse(info)
                if (status){
                    console.log(msg)
                    setFreelancersInfo(msg)
                    setGotFreelancersInfo(true);
                }
                else{
                    alert(msg)
                    goBack()
                }
            }
        }


        ws.addEventListener("message", handleMessage)
        
        if (!hasRequested.current){
            GetMinimalFreelancerInfo(ws, token, city, job)
            hasRequested.current = true
        }
        return () => ws.removeEventListener("message", handleMessage)

    }, [ws, token, city, job])

    if (!gotFreelancersInfo) return <LoadingScreen/>

    return (
        <div className="fixed inset-0 bg-[#020617] flex overflow-hidden font-sans">
            <Navbar role={authUser?.role} />

            <main className="flex-1 ml-60 h-full relative flex flex-col p-12 lg:p-20 overflow-y-auto">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full" />
                </div>

                <div className="w-full max-w-7xl z-10 mx-auto">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-400 font-black tracking-[0.2em] text-sm uppercase">
                                <span className="w-12 h-[2px] bg-blue-500"></span>
                                Professionals in your area
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-tight">
                                {job} <span className="text-slate-700">in</span> {city}
                            </h1>
                        </div>

                        <button 
                            onClick={goBack}
                            className="group flex items-center gap-4 bg-slate-900/50 hover:bg-blue-600 border border-slate-800 hover:border-blue-400 px-8 py-5 rounded-3xl text-white transition-all duration-300"
                        >
                            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                            <span className="font-bold text-lg uppercase tracking-wider">Change Search</span>
                        </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Object.entries(freelancersInfo).map(([pro_id, data]) => (
                            <div 
                                key={pro_id} 
                                className="group relative bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 rounded-[2.5rem] p-8 backdrop-blur-xl transition-all duration-500 hover:translate-y-[-8px] shadow-2xl"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-blue-400">
                                        <Star className="w-4 h-4 fill-blue-400" />
                                        <span className="font-black text-sm">{data.rating ? data.rating : "New"}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">Rate</div>
                                        <div className="text-3xl font-black text-white">${data.price}<span className="text-sm text-slate-500">/hr</span></div>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                                            <User className="text-slate-400 group-hover:text-blue-400 w-8 h-8" />
                                        </div>
                                        <div className="font-black text-xl text-white tracking-tight">Expert Professional</div>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed line-clamp-3 text-lg italic">
                                        "{data.description ? data.description : "No description"}"
                                    </p>
                                </div>

                                <button 
                                    onClick={() => {handleOnclick(pro_id)}}
                                    className="w-full bg-white hover:bg-blue-600 text-black hover:text-white py-6 rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-3 transition-all duration-300"
                                >
                                    <span>HIRE NOW</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {Object.keys(freelancersInfo).length === 0 && (
                        <div className="text-center py-40 border-2 border-dashed border-slate-800 rounded-[4rem]">
                            <p className="text-slate-500 text-2xl font-medium">No freelancers found for this criteria.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );  
}





export default function SearchPage({}) {
    const ws = useSocket()
    const token = useSelector((state) => state.auth.userToken)

    const [searching, setSearching] = useState(true)
    const [gotFreelancers, setGotFreelancers] = useState(false)

    const [searchFields, setSearchFields] = useState({city:null, job:null})

    const handleSearch = (city, job) =>{
        setSearchFields({city, job})
        setSearching(false)
    }

    return (
        <>
            {searching ? (
                <SearchBar ws={ws} token={token} handleSubmit={handleSearch} />
                ) : ( <FreelancersMenu ws={ws} token={token} goBack={() => setSearching(true)} city={searchFields.city} job={searchFields.job} />
                
                )}
        </>
    )
}