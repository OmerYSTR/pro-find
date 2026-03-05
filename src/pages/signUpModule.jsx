import {Link} from "react-router-dom"
import Select from "react-select"


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
      className="absolute top-4 left-4 bg-white text-blue-500 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition"
    >
      ← Back to Login
    </Link>
  );
}


export function ErrorMessage({message}){
    return (
        <p className="text-red-500 font-bold text-base mt-1">
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
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-blue-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
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
        styles={{ container: (base) => ({ ...base, width: customWidth || '100%' }) }}
        classNamePrefix = 'react-select'
        menuPlacement = "auto"
        maxMenuHeight={200}
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
        styles={{ container: (base) => ({ ...base, width: customWidth || '100%' }) }}
        classNamePrefix = 'react-select'
        menuPlacement = "auto"
        maxMenuHeight={200}
        isMulti ={true}
      />
    </div>
  )
}
//#endregion


//#region page components
export function RolePopup({ onSelect }) {
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


export function EmailVerification(){
  console.log("Verifying email")
}
//#endregion

