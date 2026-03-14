import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed left-0 top-0 h-full w-60 bg-slate-800 flex flex-col justify-between py-8 px-4 shadow-lg">

      <div className="flex flex-col gap-4">
        <Link
          to="/"
          className="text-gray-200 px-4 py-2 rounded-md hover:bg-slate-700 transition"
        >
          🏠 Home Page
        </Link>

        <Link
          to="/schedule"
          className="text-gray-200 px-4 py-2 rounded-md hover:bg-slate-700 transition"
        >
          📅 My Schedule
        </Link>

        <Link
          to="/search"
          className="text-gray-200 px-4 py-2 rounded-md hover:bg-slate-700 transition"
        >
          🔍 Find Freelancers
        </Link>
      </div>

    </nav>
  );
}

export default Navbar;