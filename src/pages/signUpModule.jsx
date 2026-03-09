import {Link} from "react-router-dom"
import Select from "react-select"
import {useRef, useState, useEffect} from "react"
import { StatusMessage } from "../socket/MsgTypes";
import {useNavigate} from 'react-router-dom'
import {VerificationRequest} from "../socket/RequestHandler"

//#region lists

export const freelancerProfessions = async () => {
  try {
    const response = await fetch("/professional.txt");
    const text = await response.text();
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Error loading professions:", error);
    return [];
  }
};

export const israeliLocalities = async () => {
  try {
    const response = await fetch("/cities.txt");
    const text = await response.text();
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean); 
  } catch (error) {
    console.error("Error loading cities:", error);
    return [];
  }
};
//#endregion


//#region Popups and buttons (HTML code)
export function BackToLogin()
{
  return(
    <Link
      to="/login"
      className="absolute top-4 left-4 bg-slate-900 text-blue-500 px-4 py-2 rounded-lg shadow hover:bg-slate-600 transition"
    >
      ← Back to Login
    </Link>
  );
}


export function ErrorMessage({message}){
    return (
        <p className="text-red-600 font-bold text-base mt-1">
            {message}
        </p>
    )
}


export function InputField({ label, type="text", name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col text-left">
      {label && <label className="mb-1 font-medium">{label}</label>}
      <input
        type={type}
        required
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="border text-gray-300 bg-slate-700 border-blue-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
      />
    </div>
  );
}


export function SingleChoiceDropDownMenu({label, name, options, value, onChange, customWidth, placeholder = "Select an option"}){
  let orderedOptions;
  try{
    orderedOptions = options.slice().sort((a,b) => a.localeCompare(b))
  } catch(error){
    orderedOptions = options
  }

  const formattedOptions = orderedOptions.map(option => ({value:option, label:option}));
  
  return (
    <div className="flex flex-col text-left">
      {label && <label className="mb-1 font-medium">{label}</label>}
      <Select
        options = {formattedOptions}
        value = {value ? {value:value, label:value}:null}
        onChange ={(selected) => onChange(selected.value)}
        placeholder={placeholder}
        classNamePrefix = 'react-select'
        menuPlacement = "auto"
        maxMenuHeight={200}
        styles={{
                container: (base) => ({ ...base, width: customWidth || '100%' }),
                control: (base, state) => ({
                  ...base,
                  backgroundColor: '#374151',
                  borderColor: '#60a5fa',
                  boxShadow: state.isFocused ? '0 0 0 2px #60a5fa' : 'none',
                  color: '#ffffff',
                  '&:hover': { borderColor: '#3b82f6' },
                }),
                menu: (base) => ({ ...base, backgroundColor: '#374151', color: '#ffffff' }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#1e293b' : '#374151',
                  color: '#ffffff',
                }),
                singleValue: (base) => ({ ...base, color: '#ffffff' }),
                placeholder: (base) => ({ ...base, color: '#cbd5e1' }),
                input: (base) => ({ ...base, color: '#d1d5db' })
              }}
      />
    </div>
  )
}


export function MultiChoiceDropDownMenu({label, name, options, value, onChange, customWidth, placeholder = "Select options"}){
  const sortedOptions = options.slice().sort((a,b) => (a.localeCompare(b)))
  
  const orderedOptions = sortedOptions.map(v => ({value:v, label:v}))
  const formattedValue = value?.map(v => ({value:v ,label:v})) || []
  
  return (
    <div className="flex flex-col text-left">
      {label && <label className="mb-1 font-medium">{label}</label>}
      <Select
        options = {orderedOptions}
        value = {formattedValue}
        onChange ={(selected) => {const selectedValue = selected ? selected.map(s => s.value) : []; onChange(selectedValue)}}
        placeholder={placeholder}
        classNamePrefix = 'react-select'
        menuPlacement = "auto"
        maxMenuHeight={200}
        isMulti ={true}
        styles={{
                container: (base) => ({ ...base, width: customWidth || '100%' }),
                control: (base, state) => ({
                  ...base,
                  backgroundColor: '#374151',
                  borderColor: '#60a5fa', 
                  boxShadow: state.isFocused
                    ? '0 0 0 2px #60a5fa'
                    : 'none',
                  color: '#ffffff',
                  '&:hover': {
                    borderColor: '#3b82f6',
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#374151',
                  color: '#ffffff',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? '#1e293b' : '#374151',
                  color: '#ffffff',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: '#ffffff',
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: '#ffffff',
                  ':hover': {
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                  },
                }),
                singleValue: (base) => ({ ...base, color: '#ffffff' }),
                placeholder: (base) => ({ ...base, color: '#cbd5e1' }),
              }}
      />
    </div>
  )
}
//#endregion


//#region page components
export function RolePopup({ onSelect }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 w-full min-h-screen">
      <BackToLogin/>

      <div className="bg-slate-700 p-8 rounded-xl shadow-lg w-80 text-center">
        <h2 className="text-lg font-semibold text-gray-300 mb-6">
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

export function EmailVerification({ verificationCode, setVerificationCode, handleVerificationCodeSubmit, serverError }) {
  const navigate = useNavigate()
  const inputsRef = useRef([])
  const [error, setError] = useState("") 

  const handleChange = (value, index) => {
    const codeArray = verificationCode.split("")
    codeArray[index] = value
    const newCode = codeArray.join("")
    setVerificationCode(newCode)

    if (value && index < 5) {
      inputsRef.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const codeArray = verificationCode.split("")
      codeArray[index] = ""
      setVerificationCode(codeArray.join(""))

      if (index > 0) {
        inputsRef.current[index - 1].focus()
      }
    }
  }

  const handleSubmit = () => {
    if (verificationCode.length < 6) {
      setError("Bad format: 6 digits required")
      return
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      setError("Bad format: Only numbers allowed")
      return
    }

    setError("")
    handleVerificationCodeSubmit()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 w-full min-h-screen p-4">
      
      <div className="bg-slate-700 p-10 rounded-xl shadow-lg w-full max-w-md text-center">

        <h2 className="text-4xl font-semibold text-gray-300  mb-2">
          Insert Verification Code
        </h2>

        <p className="text-gray-400 mb-6">
          A verification code was sent to your email.
        </p>

        <div className="flex justify-center gap-4 mb-6">
          {[0,1,2,3,4,5].map((i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              maxLength="1"
              value={verificationCode[i] || ""}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-14 h-16 text-center text-white text-3xl border-b-4 border-blue-400 focus:border-blue-500 outline-none rounded-sm flex items-center justify-center"
            />
          ))}
        </div>

        {error && <ErrorMessage message={error} />}


        {serverError && <ErrorMessage message={serverError}/>}


        <button
          onClick={handleSubmit}
          className="mt-6 bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded transition text-xl w-60 h-15"
        >
          Submit
        </button>

      </div>

    </div>
  )
}
//#endregion

