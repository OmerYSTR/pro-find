import {Link} from "react-router-dom"
import Select from "react-select"


//#region lists
export const freelancerProfessions = [
  // Tech & Development
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Web Developer",
  "Mobile App Developer (iOS)",
  "Mobile App Developer (Android)",
  "Cross-Platform Developer",
  "Software Engineer",
  "Game Developer",
  "Unity Developer",
  "Unreal Engine Developer",
  "Blockchain Developer",
  "Smart Contract Developer",
  "AI Engineer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Data Analyst",
  "DevOps Engineer",
  "Cloud Engineer",
  "AWS Specialist",
  "Cybersecurity Specialist",
  "Penetration Tester",
  "Ethical Hacker",
  "Network Engineer",
  "Database Administrator",
  "QA Tester",
  "Automation Tester",
  "Embedded Systems Developer",
  "IoT Developer",
  "AR/VR Developer",
  "Technical Support Specialist",

  // Design & Creative
  "Graphic Designer",
  "UI Designer",
  "UX Designer",
  "Product Designer",
  "Web Designer",
  "Logo Designer",
  "Brand Designer",
  "Illustrator",
  "Concept Artist",
  "3D Modeler",
  "3D Animator",
  "Motion Graphics Designer",
  "Video Editor",
  "Video Producer",
  "Photographer",
  "Photo Editor",
  "Filmmaker",
  "Sound Designer",
  "Music Producer",
  "Audio Engineer",
  "Voice Over Artist",

  // Writing & Content
  "Copywriter",
  "Content Writer",
  "Technical Writer",
  "Ghostwriter",
  "Blogger",
  "SEO Writer",
  "Scriptwriter",
  "Screenwriter",
  "Journalist",
  "Editor",
  "Proofreader",
  "Translator",
  "Subtitler",
  "Resume Writer",
  "Grant Writer",
  "Academic Writer",

  // Marketing & Sales
  "Digital Marketer",
  "Social Media Manager",
  "Social Media Strategist",
  "PPC Specialist",
  "Google Ads Specialist",
  "Facebook Ads Specialist",
  "SEO Specialist",
  "Email Marketing Specialist",
  "Affiliate Marketer",
  "Marketing Consultant",
  "Brand Strategist",
  "Sales Consultant",
  "Lead Generation Specialist",
  "CRM Specialist",

  // Business & Finance
  "Business Consultant",
  "Startup Consultant",
  "Financial Analyst",
  "Accountant",
  "Bookkeeper",
  "Tax Consultant",
  "Virtual CFO",
  "Investment Analyst",
  "Business Analyst",
  "Operations Consultant",
  "Project Manager",
  "Product Manager",

  // Admin & Virtual Assistance
  "Virtual Assistant",
  "Executive Assistant",
  "Data Entry Specialist",
  "Customer Support Representative",
  "Chat Support Agent",
  "Appointment Setter",
  "Recruiter",
  "HR Consultant",

  // Education & Coaching
  "Online Tutor",
  "Math Tutor",
  "Programming Tutor",
  "Language Tutor",
  "Test Prep Tutor",
  "Career Coach",
  "Life Coach",
  "Fitness Coach",
  "Business Coach",
  "Music Teacher",
  "Art Teacher",

  // Health & Wellness
  "Personal Trainer",
  "Nutritionist",
  "Diet Coach",
  "Yoga Instructor",
  "Meditation Instructor",
  "Wellness Coach",

  // Engineering & Technical Services
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Architect",
  "Interior Designer",
  "CAD Designer",
  "Industrial Designer",
  "Surveyor",

  // E-Commerce & Operations
  "Shopify Developer",
  "Amazon FBA Specialist",
  "Dropshipping Expert",
  "Product Research Specialist",
  "Supply Chain Consultant",
  "Logistics Consultant",

  // Entertainment & Events
  "DJ",
  "Event Planner",
  "Wedding Planner",
  "MC / Host",
  "Actor",
  "Dancer",

  // Legal
  "Legal Consultant",
  "Contract Specialist",
  "Paralegal",
  "Compliance Consultant",

  // Specialized / Niche
  "No-Code Developer",
  "Webflow Developer",
  "Bubble Developer",
  "Zapier Automation Specialist",
  "Notion Consultant",
  "Airtable Consultant",
  "Technical Recruiter",
  "Community Manager",
  "Discord Manager",
  "YouTube Editor",
  "Podcast Editor",
  "Podcast Producer",
  "Stream Overlay Designer",
  "Esports Coach",

  // Other / Miscellaneous Professions
  "Barber",
  "Hair Stylist",
  "Makeup Artist",
  "Comedian",
  "Magician",
  "Tattoo Artist",
  "Masseuse / Masseur",
  "Personal Shopper",
  "House Cleaner",
  "Plumber",
  "Electrician",
  "Carpenter",
  "Mechanic",
  "Dog Walker",
  "Pet Groomer",
  "Babysitter",
  "Life Guard",
  "Tour Guide",
  "Chef / Personal Chef",
  "Baker",
  "Caterer",
  "Florist",
  "Painter (Artist)",
  "Handyman",
  "Tailor / Seamstress",
  "Fitness Instructor",
  "DJ / Musician",
  "Voice Coach",
  "Stand-up Comedian",
  "Photobooth Operator",
  "Event Host",
  "Street Performer",
  "Driving Instructor",
  "Language Tutor",
  "Photography Instructor",
  "Artisan / Craftsman"
];

export const israeliLocalities = [
 "Acre",
  "Afula",
  "Arad",
  "Ashdod",
  "Ashkelon",
  "Be'er Sheva",
  "Bat Yam",
  "Beit Shemesh",
  "Bnei Brak",
  "Caesarea",
  "Dimona",
  "Eilat",
  "El'ad",
  "Givatayim",
  "Hadera",
  "Haifa",
  "Herzliya",
  "Holon",
  "Hod HaSharon",
  "Jerusalem",
  "Karmiel",
  "Kfar Saba",
  "Kiryat Ata",
  "Kiryat Bialik",
  "Kiryat Gat",
  "Kiryat Motzkin",
  "Kiryat Ono",
  "Kiryat Shemona",
  "Lod",
  "Modi'in-Maccabim-Reut",
  "Nahariya",
  "Nazareth",
  "Netanya",
  "Ness Ziona",
  "Nof HaGalil",
  "Petah Tikva",
  "Ramla",
  "Ramat Gan",
  "Ramat HaSharon",
  "Ra'anana",
  "Rehovot",
  "Rishon LeZion",
  "Safed",
  "Sderot",
  "Tiberias",
  "Umm al-Fahm",
  "Yavne",
  "Yehud-Monosson",
  "Yokneam Illit",
  "Abu Ghosh",
  "Abu Sinan",
  "Akbara",
  "Alfei Menashe",
  "Alkanah",
  "Afula Illit",
  "Ain al-Asad",
  "Ar'ara",
  "Azor",
  "Basma",
  "Basmah Tivon",
  "Beit Aryeh-Ofarim",
  "Beit Dagan",
  "Beit El",
  "Beit HaEmek",
  "Beit Hillel",
  "Beit She'an Illit",
  "Beit Shemesh (Local Council area)",
  "Ben Shemen",
  "Bnei Ayish",
  "Bnei Atarot",
  "Bu’eine Nujeidat",
  "Buq’ata",
  "Daburiyya",
  "Deir Hanna",
  "Ein Mahil",
  "Ein Naqquba",
  "Ein Qiniyye",
  "Fassuta",
  "Ganei Tikva",
  "Gedera",
  "Givat Hen",
  "Givat Shmuel",
  "Harish",
  "Hodaya",
  "Iksal",
  "Immanuel",
  "Jatt",
  "Julis",
  "Kafr Kanna",
  "Kafr Manda",
  "Kafr Qara",
  "Kfar Blum",
  "Kfar Yona",
  "Kfar Yasif",
  "Kfar Vradim",
  "Kiryat Ekron",
  "Kiryat Ono",
  "Kiryat Tiv’on",
  "Kokhav Ya’ir",
  "Kuseife",
  "Lehavim",
  "Mazkeret Batya",
  "Mevaseret Zion",
  "Metula",
  "Migdal HaEmek",
  "Mishmar HaShiv’a",
  "Neve Shalom",
  "Nof Ayalon",
  "Otzem",
  "Or Akiva",
  "Pardes Hanna-Karkur",
  "Poria Illit",
  "Rosh Pinna",
  "Sde Warburg",
  "Shoham",
  "Tayibe",
  "Tzoran-Kadima",
  "Yagur",
  "Yesud HaMa’ala",
  "Zikhron Ya’akov"
];
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


function EmailVerification(){


}
//#endregion


