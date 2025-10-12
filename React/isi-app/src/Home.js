import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate(); // hook para navegação

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          'https://api.themoviedb.org/3/movie/popular?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en&page=1'
        );
        const data = await response.json();
        setMovies(data.results);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Função para tratar o envio do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    const query = search.trim();
    if (query) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Filmes Populares</h1>

      {/* Formulário de pesquisa */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-box"
          placeholder="Pesquisar por título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

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
