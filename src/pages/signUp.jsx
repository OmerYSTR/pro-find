import { useState } from "react";

function RolePopup({ onSelect }) {

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-yellow-100 w-full min-h-screen">
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

function userSignUp(){
    
}

function freelancerSignUp(){

}


export default function SignUpPage() {
  const [role, setRole] = useState(null);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    console.log("Selected role:", selectedRole);
  };

    return (
    <>
        {!role ? (
        <RolePopup onSelect={handleRoleSelect} />
        ) 
        : role === "User" ? (
            <h2 className="text-lg font-semibold">User Sign Up Form</h2>
            ) 
            : (
            <h2 className="text-lg font-semibold">Freelancer Sign Up Form</h2>
            )}
    </>
    );
}