import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <img
        src="/logo.png"
        alt="SubVault Logo"
        className="navbar-logo"
        onClick={() => navigate("/home")}
        style={{ cursor: "pointer" }}
      />
    </nav>
  );
}

export default Navbar;
