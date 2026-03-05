import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BackToLogin, freelancerProfessions, RolePopup, InputField, ErrorMessage, SingleChoiceDropDownMenu, MultiChoiceDropDownMenu, israeliLocalities, EmailVerification} from "./signUpModule";
import {useSocket} from "../socket/SocketContext"
import { SignUpRequest } from "../socket/RequestHandler";
import webSocketParser from "../socket/MsgParser";
import { handleSignUpResponse } from "../socket/ResponseHandlers";

function UserSignUp({ userInfo, setUserInfo, onSubmit, serverError }){
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [infoEntered, setInfoEntered] = useState(true)
  
  const handleChange = (e) =>{
    const {name, value} = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]:value
    })
    )
  }


  const handleSubmit = (e) =>{
    console.log(`User name - ${userInfo.name}\nUser email - ${userInfo.email}\nUser password - ${userInfo.password}`)
    e.preventDefault()
    const hasEmptyFields = Object.values(userInfo).some(value => !value)
    if (!hasEmptyFields && confirmPassword !== ""){
      setInfoEntered(true)
      
      if(userInfo.password!==confirmPassword){
        setPasswordMismatch(true)
        setConfirmPassword("");}
      
        else{
        setPasswordMismatch(false)  
        onSubmit()
      }}
    
      else{
      setPasswordMismatch(false)
      setInfoEntered(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-yellow-100 w-full min-h-screen">
      <BackToLogin/>
      <div className="bg-white p-12 rounded-xl shadow-lg w-120 text-center">
        <h1 className="text-2xl font-bold mb-4">
            Please enter your information below
        </h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <InputField name={"name"} value={userInfo.name} onChange={handleChange} placeholder={"Username"}/>
          
          <InputField name={"email"} value={userInfo.email} onChange={handleChange} placeholder={"Email"} type={"email"}/>

          <InputField name={"password"} value={userInfo.password} onChange={handleChange} placeholder={"password"} type={"password"} />

          <InputField name={"password2"} value={confirmPassword} onChange ={(e) => setConfirmPassword(e.target.value)} placeholder={"Confirm password"} type={"password"} />
          
          {passwordMismatch && (
            <ErrorMessage message={"Passwords do not match"}/>
          )}

          {!infoEntered && (
            <ErrorMessage message={"Not all fields were filled"}/>
          )}

          {serverError && (
            <ErrorMessage message={serverError}/>
          )}

          <button
            type="submit"
            className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg shadow-md mt-2 transition-all"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}



function FreelancerSignUp({ freelancerInfo, setFreeLancerInfo, onSubmit, serverError}){
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [infoEntered, setInfoEntered] = useState(true);
  
  
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("")
  const [endHour, setEndHour] = useState("")
  const [endMinute, setEndMinute] = useState("")

  const [jobDurationHour, setJobDurationHour] = useState("")
  const [jobDurationMinute, setJobDurationMinute] = useState("")

  const [professions, setProfessions] = useState([]);
  const [cities, setCities] = useState([]);

  let widthForBigDropDowns = "480px";
  let widthForSmallDropDowns = "90px";
  let timeWidth = '50px';


  useEffect(() => {
    if (startHour!=="" && startMinute !==""){
      setFreeLancerInfo(prev => ({
        ...prev,
        startWorking:`${startHour}:${startMinute}`
      }));
    }
  }, [startHour, startMinute])

  useEffect(() => {
    if (endHour!=="" && endMinute !==""){
      setFreeLancerInfo(prev => ({
        ...prev,
        finishWorking:`${endHour}:${endMinute}`
      }));
    }
  }, [endHour, endMinute])

  useEffect(() => {
    if (jobDurationHour!=="" && jobDurationMinute!=="")
    {
      setFreeLancerInfo(prev => ({
        ...prev, jobDuration: `${jobDurationHour}:${jobDurationMinute}`
      }))
    }
  }, [jobDurationHour, jobDurationMinute])

 useEffect(() => {
    const loadProfessions = async () => {
      const profs = await freelancerProfessions();
      setProfessions(profs);
    };
    loadProfessions();

    const loadCities = async () => {
      const cityList = await israeliLocalities();
      setCities(cityList);
    };
    loadCities();
  }, []);

  const handleChange = (e) =>{
      const {name, value} = e.target;
      setFreeLancerInfo(prev =>({
        ...prev,
        [name]:value
      })
      )
    }


    const handleSubmit = (e) =>{
      console.log(`
User name - ${freelancerInfo.name}
User email - ${freelancerInfo.email}
User password - ${freelancerInfo.password}
Profession - ${freelancerInfo.profession}
Cities - ${freelancerInfo.cities}
Years of expertee - ${freelancerInfo.years}
Working hours - ${freelancerInfo.startWorking}-${freelancerInfo.finishWorking}
Avg job duration - ${freelancerInfo.jobDuration}
Self description - ${freelancerInfo.description }
        `)
      
      e.preventDefault()
      const hasEmptyFields = Object.entries(freelancerInfo).some(([key, value]) => {
        if (Array.isArray(value)) return value.length === 0;          
        if (typeof value === "string") return value.trim() === "";  
        if (typeof value === "number") return value === 0;          
        return !value;                                              
      });
      
      if (!hasEmptyFields && confirmPassword !==""){
        setInfoEntered(true)
        if(freelancerInfo.password!==confirmPassword){
          setPasswordMismatch(true)
          setConfirmPassword("");}
        else{
          setPasswordMismatch(false)  
          onSubmit()
        }}
      else{
        setPasswordMismatch(false)
        setInfoEntered(false)
    }

    
    }

    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-yellow-100 w-full min-h-screen">
        <BackToLogin/>
        <div className="bg-white p-8 rounded-xl shadow-lg w-140 max-h-[90vh] overflow-y-auto text-center scrollbar-hide">
         <h1 className="text-xl font-bold mb-4">
            Please enter your information below
          </h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <InputField name={"name"} value={freelancerInfo.name} onChange={handleChange} placeholder={"Username"}/>
            
            <InputField name={"email"} value={freelancerInfo.email} onChange={handleChange} placeholder={"Email"} type={"email"}/>

            <InputField name={"password"} value={freelancerInfo.password} onChange={handleChange} placeholder={"password"} type={"password"} />

            <InputField name={"password2"} value={confirmPassword} onChange ={(e) => setConfirmPassword(e.target.value)} placeholder={"Confirm password"} type={"password"} />
            <SingleChoiceDropDownMenu 
            placeholder ={"Profession"}  
            name={"profession"} 
            options={professions} 
            value={freelancerInfo.profession} 
            onChange={(professionPicked) => setFreeLancerInfo(prev => ({...prev,profession:professionPicked}))} 
            customWidth ={widthForBigDropDowns}
            />

            <MultiChoiceDropDownMenu
            name={"cities"}
            options={cities}
            value={freelancerInfo.cities}
            onChange={(selectedCities) => setFreeLancerInfo(prev =>({...prev, cities:selectedCities}))}
            placeholder="Select your areas"
            customWidth={widthForBigDropDowns}
            />

            <SingleChoiceDropDownMenu
              name={"years"}
              options={Array.from({length:41}, (_, i) =>i)}
              value ={freelancerInfo.years}
              onChange={(yearsPicked) => setFreeLancerInfo(prev => ({...prev, years:yearsPicked}))}
              placeholder="Select years of expertee"
              customWidth={widthForBigDropDowns}
            />


            <div className="flex items-center gap-2">
              <span className="text-m font-bold w-50">Start time</span>
              <SingleChoiceDropDownMenu
                name={"startTime"}
                options={Array.from({length:24}, (_,i)=>String(i).padStart(2,"0"))}
                value={startHour}
                onChange={(startHourPicked) => setStartHour(startHourPicked)}
                customWidth={widthForSmallDropDowns}
                placeholder=""
              />
              
              <span className="text-2xl font-bold">:</span>
              
              <SingleChoiceDropDownMenu
                name={"startMinute"}
                options={Array.from({length:60}, (_,i)=>String(i).padStart(2,"0"))}
                value={startMinute}
                onChange={(startMinutePicked) => setStartMinute(startMinutePicked)}
                customWidth={widthForSmallDropDowns}
                placeholder=""
              />
            </div>


            <div className="flex items-center gap-2">
              <span className="text-m font-bold w-50">End time</span>
              <SingleChoiceDropDownMenu
                name={"endTime"}
                options={Array.from({length:24}, (_,i)=>String(i).padStart(2,"0"))}
                value={endHour}
                onChange={(endHourPicked) => setEndHour(endHourPicked)}
                customWidth={widthForSmallDropDowns}
                placeholder=""
              />
              
              <span className="text-2xl font-bold">:</span>
              
              <SingleChoiceDropDownMenu
                name={"endMinute"}
                options={Array.from({length:60}, (_,i)=>String(i).padStart(2,"0"))}
                value={endMinute}
                onChange={(endMinutePicked) => setEndMinute(endMinutePicked)}
                customWidth={widthForSmallDropDowns}
                placeholder=""
              />
            </div>


            <div className="flex items-center gap-2">
              <span className="text-m font-bold w-50">Job duration time</span>
              <SingleChoiceDropDownMenu
                name={"jobStart"}
                options={Array.from({length:24}, (_,i)=>String(i).padStart(2,"0"))}
                value={jobDurationHour}
                onChange={(jobDurationHourPicked) => setJobDurationHour(jobDurationHourPicked)}
                customWidth={widthForSmallDropDowns}
                placeholder=""
              />
              
              <span className="text-2xl font-bold">:</span>
              
              <SingleChoiceDropDownMenu
                name={"jobEnd"}
                options={Array.from({length:60}, (_,i)=>String(i).padStart(2,"0"))}
                value={jobDurationMinute}
                onChange={(jobDurationMinutePicked) => setJobDurationMinute(jobDurationMinutePicked)}
                customWidth={widthForSmallDropDowns}
                placeholder=""
              />
            </div>


            <InputField name={"description"} value={freelancerInfo.description} onChange={handleChange} placeholder={"Description"}/>

              {passwordMismatch && (
                <ErrorMessage message={"Passwords do not match"}/>
              )}

              {!infoEntered && (
                <ErrorMessage message={"Not all fields were entered"}/>
              )}

              {serverError && (
                <ErrorMessage message={serverError}/>
              )}

              <button
                type="submit"
                className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg shadow-md mt-2 transition-all"
              >
                Sign Up
              </button>
          </form>
        </div>
      </div>
    );
}





export default function SignUpPage() {
  const ws = useSocket()

  const [role, setRole] = useState(null);
  const [userInfo, setUserInfo] = useState({ name:"", email:"", password:""});
  const [freelancerInfo, setFreelancerInfo] = useState({
      name:"",
      email:"",
      password:"",
      profession:"",
      cities: [],
      years: 0,
      startWorking: "",
      finishWorking:"",
      jobDuration:0,
      description: ""
  });

  const [serverError, setServerError] = useState("");

  const handleSubmit = () => {
    setServerError("")
    if (role === "User")
      SignUpRequest(ws, userInfo, role);
    else
      SignUpRequest(ws, freelancerInfo, role);
  }

  useEffect(() =>{
    if (!ws) return;
    ws.onmessage = (event) =>{
      console.log(`Recvd - ${event.data}`)
      const info = webSocketParser(event.data)
      const [infoGood, errorMessage]= handleSignUpResponse(info)
      if (infoGood){
        setServerError("")
        EmailVerification()
      }
      else{
        setServerError(errorMessage)
      }

    }
  }
)


  return (
    <>
        {!role ? (
        <RolePopup onSelect={ setRole } />
        ) : role === "User" ? (
            <UserSignUp userInfo={userInfo} setUserInfo={setUserInfo} serverError={serverError} onSubmit={handleSubmit}/>
            ) 
            : (
            <FreelancerSignUp freelancerInfo={freelancerInfo} setFreeLancerInfo={setFreelancerInfo} serverError={serverError} onSubmit={handleSubmit}/>
            )}
    </>
    )
  
}