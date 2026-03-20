import './App.css';
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LogIn from './pages/login.jsx';
import HomePage from './pages/homePage.jsx';
import ProtectedRoutes from './pages/protectedRoutes.jsx';
import SignUpPage from './pages/signUp.jsx';
import Search from './pages/search.jsx';
import Schedule from './pages/schedule.jsx';
import RouteTracker from './RouteTracker.jsx';
import { useSelector } from 'react-redux';


export default function App() {
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state) => state.auth.loggedIn)

  useEffect(() => {
    const lastRoute = localStorage.getItem("lastRoute");
    
    const isGuestPage = lastRoute === "/login" || lastRoute === "/signup";

    if (isLoggedIn && lastRoute && !isGuestPage) {
      navigate(lastRoute, { replace: true });
    } else if (isLoggedIn && (isGuestPage || !lastRoute)) {
      navigate("/", { replace: true });
    }
  }, [navigate, isLoggedIn]);


  return (
    <>
      <RouteTracker />
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<HomePage isPublic={false}/>} />
          <Route path="/search" element={<Search/>}/>
          <Route path="/schedule" element={<Schedule/>} />
        </Route>
      </Routes>
    </>
  );
}
