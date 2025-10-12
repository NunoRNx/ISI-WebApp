import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        let allResults = [];
        for (let page = 1; page <= 3; page++) {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en&page=${page}`
          );
          const data = await response.json();
          allResults = allResults.concat(data.results);
        }
        setMovies(allResults.slice(0, 50));
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = search.trim();
    if (query) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="page">
      {/* Search Bar Centrally Above Grid */}
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-box"
          placeholder="Pesquisar por título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="search-btn">Buscar</button>
      </form>

      {/* Title just above grid */}
      <h1 className="page-title">Filmes Populares</h1>

      {loading ? (
        <div className="loading">
          <p>A carregar...</p>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-card">
              <Link to={`/movie/${movie.id}`} className="movie-card">
                <div className="movie-poster">
                  <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                  <div className="movie-overlay"></div>
                </div>
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-year">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
