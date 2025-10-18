import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home.js";
import NotFound from "./NotFound.js";
import Navbar from "./Navbar.js";
import Movie from "./Movie.js";
import Search from "./Search.js";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={<Search />} />

        <Route path="/movie/:id" element={<Movie />} />
        
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
