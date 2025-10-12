import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Search = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query.get('query') || '');

  useEffect(() => {
    if (!searchTerm) {
      setMovies([]);
      return;
    }

    setLoading(true);
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en&query=${encodeURIComponent(searchTerm)}&page=1&include_adult=false`)
      .then(res => res.json())
      .then(data => {
        setMovies(data.results || []);
        setLoading(false);
      });
  }, [searchTerm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="page">
      <h1>Pesquisar Filmes</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Digite o título do filme..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button type="submit">Pesquisar</button>
      </form>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="movies-grid">
          {movies.map(movie => (
            <Link key={movie.id} to={`/movie/${movie.id}`} className="movie-card">
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
              <h3>{movie.title}</h3>
              <p>{movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
