import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

function Navbar({ role }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-60 bg-slate-800 flex flex-col py-8 px-4 shadow-lg">
      
      {/* Top Section */}
      <div className="flex flex-col gap-2">
        <Link
          to="/"
          className="text-gray-200 px-4 py-2 rounded-md hover:bg-slate-700 transition flex items-center gap-3 justify-start"
        >
          <span>🏠</span> <span>Home Page</span>
        </Link>

        <Link
          to="/schedule"
          className="text-gray-200 px-4 py-2 rounded-md hover:bg-slate-700 transition flex items-center gap-3 justify-start"
        >
          <span>📅</span> <span>My Schedule</span>
        </Link>

        {role === "User" && (
          <Link
            to="/search"
            className="text-gray-200 px-4 py-2 rounded-md hover:bg-slate-700 transition flex items-center gap-3 justify-start"
          >
            <span>🔍</span> <span>Find Freelancers</span>
          </Link>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-slate-700 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 justify-start text-red-500 font-semibold px-4 py-2 rounded-md hover:bg-red-950/30 transition duration-200"
        >
          <span className="text-xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>

    </nav>
  );
}

export default Navbar;