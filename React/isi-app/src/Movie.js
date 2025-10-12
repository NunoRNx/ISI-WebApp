// Movie.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';

const Movie = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`)
      .then(response => response.json())
      .then(setMovie);
  }, [id]);

  if (!movie) return <div>A carregar detalhes...</div>;

  return (
    <div className="movie-detail">
      <h2>{movie.title}</h2>
      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
      <p>{movie.overview}</p>
      <p><strong>Lançamento:</strong> {movie.release_date}</p>
      <p><strong>Nota:</strong> {movie.vote_average}</p>
    </div>
  );
};

export default Movie;
