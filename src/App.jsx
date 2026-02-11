import './App.css'
import { Routes, Route } from "react-router-dom"
import LogIn from './pages/login.jsx'
import HomePage from './pages/homePage.jsx'
import ProtectedRoutes from './pages/protectedRoutes.jsx'
import SignUpPage from './pages/signUp.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUpPage />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    
    </Routes>
  )
}
