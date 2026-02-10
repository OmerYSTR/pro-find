import { useSelector} from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoutes({children}){
    const isLoggedIn = useSelector((state) => state.auth.loggedIn);

    if (!isLoggedIn){return <Navigate to="/login" replace/>;}

    return children;
}
