import { useLocation, useNavigate, Link } from "react-router-dom";
import './Navbar.css';

function Navbar() {

  return (
    <nav>
        <Link to="/home">Home</Link>
        <Link to="/upload">Upload</Link>
    </nav>
  );
}

export default Navbar;
