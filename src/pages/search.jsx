import { useState, useEffect, useRef, useContext } from "react";
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
        
            if (MessageTypes.BROAD == info.type){
                if (StatusMessage.TOKEN_BAD in info.data){
                    alert("Your session has ended, login again to get service")
                    dispatch(logout())
                    navigate('/login')
                }
            }
            else if (info.type == MessageTypes.GET_JOBS) {
                const [status, message] = handleJobsResponse(info);
                if (status) setAllJobTypes(message);
        
            } else if (info.type == MessageTypes.GET_CITIES_BY_JOB) {
                const [status, message] = handleCitiesResponse(info);
                if (status) setJobCitiesFromServer(message);
            }
        };

        const setup = () => {
            ws.addEventListener("message", handleMessage);
            GetAllJobs(ws, token);
        };

        if (ws.readyState == WebSocket.OPEN) setup();
        else ws.addEventListener("open", setup, { once: true });

        return () => {
            ws.removeEventListener("message", handleMessage);
        };
    }, [ws, token]);

    const resetSearch = () => {
        setSelectedJob(null)
        setSearchJob("")
        setSelectedCity(null)
        setSearchCity("")
        setJobCitiesFromServer([]);
    };

    const isLocked = selectedJob && selectedCity;
return (
    <div className="fixed inset-0 bg-[#020617] flex overflow-hidden font-sans antialiased text-slate-200">
        <Navbar role={authUser?.role} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <div className="absolute -top-24 -right-24 w-1/2 aspect-square bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-1/3 aspect-square bg-indigo-600/10 blur-[100px] rounded-full" />
        </div>

        <main className="flex-1 ml-60 h-full relative flex flex-col items-center justify-center p-8 lg:p-16 z-10">
            
            <div className="w-full max-w-5xl space-y-12">
                
                <header>
                    <h1 className="text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tight leading-[0.9]">
                        Hire <span className="text-blue-500">Quality</span><br />
                        <span className="opacity-10 italic">Freelancers</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
                    
                    <div className="relative group" ref={jobRef}>
                        <Briefcase className={`absolute left-7 top-1/2 -translate-y-1/2 w-7 h-7 z-20 transition-colors ${selectedJob ? 'text-blue-400' : 'text-slate-500'}`} />
                        
                        <input
                            type="text"
                            readOnly={!!selectedJob}
                            placeholder={selectedJob ? "" : "Service"}
                            className={`w-full bg-slate-900/40 border-2 text-white text-3xl py-10 pl-20 pr-32 rounded-3xl outline-none transition-all backdrop-blur-md
                                ${selectedJob ? 'border-blue-500/40' : 'border-slate-800 focus:border-blue-500 hover:border-slate-700'}`}
                            value={searchJob}
                            onFocus={() => !selectedJob && setIsJobOpen(true)}
                            onChange={(e) => setSearchJob(e.target.value)}
                        />
                        
                        {selectedJob && (
                            <button 
                                onClick={resetSearch}
                                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 px-5 py-2 rounded-xl text-xs font-bold tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors uppercase"
                            >
                                Change
                            </button>
                        )}

                        {isJobOpen && (
                            <div className="absolute z-50 w-full mt-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-80 overflow-y-auto ring-1 ring-white/5">
                                {allJobTypes.filter(j => j.toLowerCase().includes(searchJob.toLowerCase())).map(job => (
                                    <button 
                                        key={job}
                                        onClick={() => { setSelectedJob(job); setSearchJob(job); setIsJobOpen(false); GetCitiesByJob(ws, job, token); }}
                                        className="w-full text-left px-8 py-6 text-xl text-slate-300 hover:bg-blue-600 hover:text-white flex justify-between items-center transition-colors group/item"
                                    >
                                        {job} 
                                        <ChevronRight className="w-5 h-5 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={`relative transition-all duration-500 ${!selectedJob ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`} ref={cityRef}>
                        <MapPin className={`absolute left-7 top-1/2 -translate-y-1/2 w-7 h-7 z-20 ${selectedCity ? 'text-blue-400' : 'text-slate-500'}`} />
                        <input
                            type="text"
                            readOnly={!!selectedCity}
                            placeholder={selectedCity ? "" : "In which city?"}
                            className={`w-full bg-slate-900/40 border-2 text-white text-3xl py-10 pl-20 pr-32 rounded-3xl outline-none transition-all backdrop-blur-md
                                ${selectedCity ? 'border-blue-500/40' : 'border-slate-800 focus:border-blue-500 hover:border-slate-700'}`}
                            value={searchCity}
                            onFocus={() => !selectedCity && setIsCityOpen(true)}
                            onChange={(e) => setSearchCity(e.target.value)}
                        />

                        {selectedCity && (
                            <button 
                                onClick={() => { setSelectedCity(null); setSearchCity(""); }}
                                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 px-5 py-2 rounded-xl text-xs font-bold tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors uppercase"
                            >
                                Change
                            </button>
                        )}

                        {isCityOpen && (
                            <div className="absolute z-50 w-full mt-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-80 overflow-y-auto ring-1 ring-white/5">
                                {jobCitiesFromServer.filter(c => c.toLowerCase().includes(searchCity.toLowerCase())).map(city => (
                                    <button 
                                        key={city}
                                        onClick={() => { setSelectedCity(city); setSearchCity(city); setIsCityOpen(false); }}
                                        className="w-full text-left px-8 py-6 text-xl text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`transition-all duration-700 delay-100 ${isLocked ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}`}>
                    <button 
                        onClick={() => handleSubmit(selectedCity, selectedJob)} 
                        className="w-full relative group p-[1px] rounded-3xl overflow-hidden bg-slate-800 hover:bg-blue-500 transition-colors duration-300"
                    >
                        <div className="bg-white text-black py-10 rounded-[calc(1.5rem-1px)] font-black text-4xl flex items-center justify-center gap-6 group-hover:bg-transparent group-hover:text-white transition-all">
                            <Search className="w-10 h-10 stroke-[3px]" />
                            <span>SEARCH NOW</span>
                        </div>
                    </button>
                    
                    <p className="mt-6 text-center text-slate-500 text-base">
                        Searching for <span className="text-blue-400">{selectedJob}</span> in <span className="text-blue-400">{selectedCity}</span>
                    </p>
                </div>

            </div>
        </main>
    </div>
)
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
            if (info.type == MessageTypes.BROAD){
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
        <div className="fixed inset-0 bg-[#020617] flex overflow-hidden font-sans antialiased text-slate-200">
            <Navbar role={authUser?.role} />

            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 ml-60 h-full relative flex flex-col p-8 lg:p-16 overflow-y-auto scrollbar-hide">
                
                <div className="w-full max-w-6xl mx-auto z-10">
                    
                    <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-blue-500 font-bold tracking-widest text-xs uppercase">
                                <span className="w-8 h-px bg-blue-500/50"></span>
                                Available Professionals
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                {job} <br />
                                <span className="text-slate-600">in</span> {city}
                            </h1>
                        </div>

                        <button 
                            onClick={goBack}
                            className="group flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-blue-500 px-6 py-4 rounded-2xl text-slate-400 hover:text-white transition-all duration-300 shadow-xl"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="font-bold text-sm uppercase tracking-widest">Change Search</span>
                        </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {Object.entries(freelancersInfo).map(([pro_id, data]) => (
                            <div 
                                key={pro_id} 
                                className="group relative bg-slate-900/30 border border-slate-800 hover:border-blue-600/40 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
                                        <Star className="w-3.5 h-3.5 fill-blue-400" />
                                        <span className="font-black text-xs uppercase tracking-tighter">
                                            {data.rating ? `${data.rating} Rating` : "New"}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hourly Rate</span>
                                        <span className="text-3xl font-black text-white tracking-tight">${data.price}</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 mb-12">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform duration-500">
                                            <User className="text-slate-500 group-hover:text-blue-400 w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-white group-hover:text-blue-400 transition-colors">Verified Professional</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Pro-Find Member</p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-slate-400 leading-relaxed text-base italic line-clamp-4 pt-2">
                                        {data.description ? `"${data.description}"` : "This professional hasn't provided a bio yet, but their credentials meet our high platform standards."}
                                    </p>
                                </div>

                                <button 
                                    onClick={() => handleOnclick(pro_id)}
                                    className="w-full bg-white text-black py-5 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 active:scale-95"
                                >
                                    <span>VIEW PROFILE</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {Object.keys(freelancersInfo).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-800 rounded-[3rem] bg-slate-900/10">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <Search className="text-slate-500 w-8 h-8" />
                            </div>
                            <h3 className="text-white text-2xl font-black tracking-tight mb-2">No matches found</h3>
                            <p className="text-slate-500 text-lg max-w-sm text-center">
                                Try broadening your search criteria or checking a neighboring city.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    ) 
}





export default function SearchPage({}) {
    const ws = useSocket()
    const token = useSelector((state) => state.auth.userToken)

    const [serching, setSearching] = useState(true)
    const [gotFreelancers, setGotFreelancers] = useState(false)

    const [serchFields, setSearchFields] = useState({city:null, job:null})

    const handleSearch = (city, job) =>{
        setSearchFields({city, job})
        setSearching(false)
    }

    return (
        <>
            {serching ? (
                <SearchBar ws={ws} token={token} handleSubmit={handleSearch} />
                ) : ( <FreelancersMenu ws={ws} token={token} goBack={() => setSearching(true)} city={serchFields.city} job={serchFields.job} />
                
                )}
        </>
    )
}