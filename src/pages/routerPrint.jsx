import { Link } from "react-router-dom";

function Navbar() {
  const navStyle = {
    position:"fixed",
    bottom: "0",
    left:"0",
    height:"97%",
    display: "flex",
    flexDirection:"column",
    gap: "20px",
    backgroundColor:"#111827",
    padding:"15px 30px"
  };
  const linkStyle = {
    color: "White",
    textDecoration:"none"
  };

  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>🏠 Home Page</Link>
      <Link to="/schedule" style={linkStyle}>📅 My Schedule</Link>
      <Link to="/search" style={linkStyle}>🔍 Find Freelancers</Link>
    </nav>
  );
}

export default Navbar;