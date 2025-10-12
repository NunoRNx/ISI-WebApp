import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import './Search.css';

const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';

const GENRES = [
  { id: 'all', name: 'Todos' },
  { id: 28, name: 'Ação' },
  { id: 35, name: 'Comédia' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasia' },
  { id: 12, name: 'Aventura' },
  { id: 27, name: 'Terror' },
  { id: 16, name: 'Animação' },
  { id: 99, name: 'Documentário' },
  { id: 53, name: 'Thriller' },
  { id: 10749, name: 'Romance' },
  { id: 80, name: 'Crime' },
  { id: 9648, name: 'Mistério' },
  { id: 10402, name: 'Música' },
  { id: 878, name: 'Ficção Científica' },
  { id: 37, name: 'Western' },
  { id: 10751, name: 'Família' },
  { id: 10752, name: 'Guerra' },
  { id: 36, name: 'Histórico' },
  { id: 10770, name: 'TV Movie' },
];


const ORDER_OPTIONS = [
  { value: 'yearDesc', label: 'Ano ↓' },
  { value: 'yearAsc', label: 'Ano ↑' },
  { value: 'ratingDesc', label: 'Rating ↓' },
  { value: 'ratingAsc', label: 'Rating ↑' },
  { value: 'votesDesc', label: 'Votos ↓' },
  { value: 'votesAsc', label: 'Votos ↑' },
  { value: 'popularityDesc', label: 'Popularidade ↓' },
  { value: 'popularityAsc', label: 'Popularidade ↑' }
];


function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Search = () => {
  const query = useQuery();
  const navigate = useNavigate();

  const searchTerm = query.get('query') || '';
  const page = Number(query.get('page')) || 1;

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(searchTerm);
  const [filterGenre, setFilterGenre] = useState('all');
  const [orderBy, setOrderBy] = useState('yearDesc');

  useEffect(() => {
    if (!searchTerm) {
      setMovies([]);
      return;
    }
    setLoading(true);
    fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en&query=${encodeURIComponent(searchTerm)}&page=${page}`
    )
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results || []);
        setLoading(false);
      });
  }, [searchTerm, page]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      navigate(`/search?query=${encodeURIComponent(input.trim())}&page=1`);
      setFilterGenre('all');
    }
  };

  const goToPage = (newPage) => {
    navigate(`/search?query=${encodeURIComponent(searchTerm)}&page=${newPage}`);
  };

  // Filtros + ordenação locais
  let filteredMovies = filterGenre === 'all'
    ? movies
    : movies.filter((m) => Array.isArray(m.genre_ids) && m.genre_ids.includes(Number(filterGenre)));

  filteredMovies = [...filteredMovies].sort((a, b) => {
    const getYear = (movie) => movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : 0;
    if (orderBy === 'yearDesc') return getYear(b) - getYear(a);
    if (orderBy === 'yearAsc') return getYear(a) - getYear(b);
    if (orderBy === 'ratingDesc') return (b.vote_average || 0) - (a.vote_average || 0);
    if (orderBy === 'ratingAsc') return (a.vote_average || 0) - (b.vote_average || 0);
    if (orderBy === 'votesDesc') return (b.vote_count || 0) - (a.vote_count || 0);
    if (orderBy === 'votesAsc') return (a.vote_count || 0) - (b.vote_count || 0);
    if (orderBy === 'popularityDesc') return (b.popularity || 0) - (a.popularity || 0);
    if (orderBy === 'popularityAsc') return (a.popularity || 0) - (b.popularity || 0);
    
    return 0;
  });

  return (
    <div className="page">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="search-box"
          placeholder="Pesquisar por título..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="search-btn" type="submit">Buscar</button>
      </form>

      <h1 className="page-title">Resultados da pesquisa</h1>
      <div className="container-2col">
        {/* Sidebar de filtros à esquerda */}
        <aside className="filter-sidebar">
          <h3>Filtros</h3>
          <div className="filter-list">
            {GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setFilterGenre(genre.id)}
                className={filterGenre === genre.id ? 'filter-active' : ''}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Coluna da lista com ordenação no topo */}
        <div className="results-column">
          <div className="order-bar">
            <div></div>
            <div className="order-right">
              <label htmlFor="order-select">Ordenar:</label>
              <select
                id="order-select"
                className="order-select"
                value={orderBy}
                onChange={e => setOrderBy(e.target.value)}
              >
                {ORDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="result-count">
                ({filteredMovies.length} resultados)
              </span>
            </div>
          </div>
          <div className="list-box">
            {loading ? (
              <div className="loading"><p>A carregar...</p></div>
            ) : filteredMovies.length === 0 ? (
              <div className="no-result-placeholder">
                <p>Nenhum resultado encontrado.</p>
              </div>
            ) : (
              filteredMovies.map((movie) => (
                <div className="list-item" key={movie.id}>
                  <div className="poster-box">
                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w154${movie.poster_path}` : ''}
                      alt={movie.title}
                      className="search-poster"
                    />
                  </div>
                  <div className="content-box">
                    <Link to={`/movie/${movie.id}`} className="search-title">
                      {movie.title}
                    </Link>
                    <p className="search-date">
                      {movie.release_date
                        ? new Date(movie.release_date).getFullYear()
                        : 'N/A'}
                      {' — '}
                      {movie.original_language
                        ? movie.original_language.toUpperCase()
                        : ''}
                      <span className="movie-rating">
                        ★ {movie.vote_average || 'N/A'}
                        <span className="movie-votes">
                          (votes: {movie.vote_count || 0})
                        </span>
                      </span>
                    </p>
                    <p className="search-overview">
                      {movie.overview || 'Sem descrição disponível.'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0' }}>
        <button className="search-btn" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
          Página anterior
        </button>
        <span style={{ color: '#ff6600', fontWeight: 700, margin: '0 16px', fontSize: 18 }}>
          Página {page}
        </span>
        <button onClick={() => goToPage(page + 1)} className="search-btn">
          Próxima página
        </button>
      </div>
    </div>
  );
};

export default Search;
