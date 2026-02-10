import './App.css'
import {Routes, Route} from "react-router-dom"
import LogIn from './pages/login'
import HomePage from './pages/homePage'
import ProtectedRoutes from './pages/protectedRoutes.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LogIn/>}/>
      <Route 
        path = '/*'
        element={
          <ProtectedRoutes>
            <Routes>
              <Route path='/' element={<HomePage/>}/>
            </Routes>
          </ProtectedRoutes>
        }


      />

    </Routes>
  )

}
