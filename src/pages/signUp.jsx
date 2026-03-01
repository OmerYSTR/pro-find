import { useState } from "react";
import { Link } from "react-router-dom";


function BackToLogin()
{
  return(
    <Link
      to="/login"
      className="absolute top-4 left-4 bg-white text-blue-500 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition"
    >
      ← Back to Login
    </Link>
  );
}



function RolePopup({ onSelect }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-yellow-100 w-full min-h-screen">
      <BackToLogin/>

      <div className="bg-white p-8 rounded-xl shadow-lg w-80 text-center">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Hey! Please pick how you would like to be presented in Pro-Find
        </h2>

        <div className="flex justify-between">
          <button
            className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-2 rounded mr-2 transition"
            onClick={() => onSelect("User")}
          >
            User
          </button>
          <button
            className="flex-1 bg-blue-400 hover:bg-blue-500 text-white py-2 rounded ml-2 transition"
            onClick={() => onSelect("Freelancer")}
          >
            Freelancer
          </button>
        </div>
      </div>
    </div>
  );
}

function UserSignUp({ userInfo, setUserInfo }){
  const [passwordEntered, setPasswordEntered] = useState("")
  const [passwordEntered2, setPasswordEntered2] = useState("")
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  
  
  const handleChange = (e) =>{
    const {name, value} = e.target;
    setUserInfo({
      ...userInfo,
      [name]:value
    }
    )
  }


  const handleSubmit = (e) =>{
    e.preventDefault()
    if(passwordEntered2!==passwordEntered){
      setPasswordMismatch(true)
      setPasswordEntered2("");}
    else{
      setPasswordMismatch(false)
      setUserInfo({...userInfo, password:passwordEntered})
      console.log(`User name - ${userInfo.name}\nUser email - ${userInfo.email}\nUser password - ${passwordEntered}`)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-yellow-100 w-full min-h-screen">
      <BackToLogin/>
      <div className="bg-white p-12 rounded-xl shadow-lg w-110 text-center">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input 
            type = "text"
            name = "name"
            placeholder="Username"
            value = {userInfo.name || ""}
            onChange={handleChange}
            className="border border-blue-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400">
          </input>
          
          <input
            type = "text"
            name = "email"
            placeholder="Email"
            value = {userInfo.email || ""}
            onChange={handleChange}
            className="border border-blue-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400">
          </input>

          <input 
            type = "password"
            name = "password"
            placeholder="Password"
            value = {passwordEntered || ""}
            onChange={(e) => {setPasswordEntered(e.target.value)}}
            className="border border-blue-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400">
          </input>

            <input 
            type = "password"
            name = "password2"
            placeholder="Re-enter Password"
            value = {passwordEntered2 || ""}
            onChange={(e) => setPasswordEntered2(e.target.value)}
            className="border border-blue-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400">
          </input>
       
          {passwordMismatch && (
            <p className="text-red-500 font-bold text-base mt-1">
              Passwords do not match!
            </p>
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



function FreelancerSignUp({ freelancerInfo }){

}




export default function SignUpPage() {
  const [role, setRole] = useState(null);
  const [userInfo, setUserInfo] = useState(
    {
      name:"",
      email:"",
      password:""
  });
  const [freeLancerInfo, setFreeLancerInfo] = useState({});


  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    console.log("Selected role:", selectedRole);
  };

  const handleUserInfo = (userInformation) =>{
    setUserInfo(userInformation);
    console.log(`User information => ${userInformation}`);
  };

  const handleFreelancerInfo = (freelancerInformation) =>{
    setFreeLancerInfo(freeLancerInformation);
    console.log(`Freelancer information => ${freelancerInformation}`);
  };


  return (
    <>
        {!role ? (
        <RolePopup onSelect={ handleRoleSelect } />
        ) : role === "User" ? (
          <>
            <UserSignUp userInfo={userInfo} setUserInfo={handleUserInfo}/>
          </>
            ) 
            : (
            <FreelancerSignUp freelancerInfo={handleFreelancerInfo}/>
            )}
    </>
    )
  
}