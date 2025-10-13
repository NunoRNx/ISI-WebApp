import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Movie.css';

const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';

const formatMoney = (n) => {
  if (n === null || n === undefined) return '—';
  try {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  } catch {
    return `$${(n || 0).toLocaleString()}`;
  }
};

const Movie = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const year = useMemo(() => {
    if (!movie?.release_date) return 'N/A';
    return new Date(movie.release_date).getFullYear();
  }, [movie]);

  const runtimeText = useMemo(() => {
    const min = movie?.runtime || 0;
    if (!min) return '—';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${m}m`;
  }, [movie]);

  const trailerKey = useMemo(() => {
    const yt = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
    return yt?.key || null;
  }, [videos]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchAll = async () => {
      try {
        const [mRes, vRes, rRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=en-US`),
          fetch(`https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`),
        ]);
        const m = await mRes.json();
        const v = await vRes.json();
        const r = await rRes.json();
        if (!isMounted) return;
        setMovie(m || null);
        setVideos(v?.results || []);
        setRecommendations(r?.results || []);
      } catch (e) {
        if (!isMounted) return;
        setMovie(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="movie-page">
        <div className="movie-loading">A carregar detalhes...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-page">
        <div className="movie-error">Não foi possível carregar este filme.</div>
      </div>
    );
  }

  const posterSrc = movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : '';
  const bg = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null;

  return (
    <div className="movie-page">
      {bg && <div className="movie-backdrop" style={{ backgroundImage: `url(${bg})` }} />}

      <div className="movie-container">
        {/* Coluna esquerda (poster sticky) */}
        <aside className="movie-left">
          <div className="poster-wrap">
            {posterSrc ? (
              <img className="movie-poster" src={posterSrc} alt={movie.title} />
            ) : (
              <div className="movie-poster placeholder">Sem poster</div>
            )}
          </div>
        </aside>

        {/* Coluna direita (detalhes) */}
        <main className="movie-right">
          {/* Barra de ações */}
          <div className="movie-actions">
            <button className="btn-secondary" onClick={() => navigate(-1)}>← Voltar</button>
            {trailerKey && (
              <a
                className="btn-primary"
                href={`https://www.youtube.com/watch?v=${trailerKey}`}
                target="_blank"
                rel="noreferrer"
              >
                ▶ Ver trailer
              </a>
            )}
          </div>

          {/* Cabeçalho */}
          <header className="movie-header-card">
            <h1 className="movie-title">{movie.title}</h1>
            <div className="movie-meta">
              <span>{year}</span>
              <span className="sep">—</span>
              <span>{(movie.original_language || '').toUpperCase()}</span>
              <span className="sep">•</span>
              <span>{runtimeText}</span>
              <span className="sep">•</span>
              <span className="rating">
                ★ {movie.vote_average?.toFixed?.(1) ?? movie.vote_average ?? 'N/A'}
                <span className="votes">(votes: {movie.vote_count || 0})</span>
              </span>
            </div>
            {!!movie.genres?.length && (
              <div className="movie-genres">
                {movie.genres.map(g => (
                  <span key={g.id} className="genre-chip">{g.name}</span>
                ))}
              </div>
            )}
          </header>

          {/* Sinopse */}
          <section className="movie-section">
            <h3 className="section-title">Sinopse</h3>
            <p className="movie-overview">{movie.overview || 'Sem descrição disponível.'}</p>
          </section>

          {/* Info técnica */}
          <section className="movie-grid">
            <div className="info-card">
              <h4>Produção</h4>
              <div className="pill-list">
                {(movie.production_companies || []).slice(0, 8).map(pc => (
                  <span key={pc.id} className="pill">{pc.name}</span>
                ))}
                {(!movie.production_companies || movie.production_companies.length === 0) && <span className="muted">—</span>}
              </div>
            </div>
            <div className="info-card">
              <h4>Países</h4>
              <div className="pill-list">
                {(movie.production_countries || []).map(pc => (
                  <span key={pc.iso_3166_1} className="pill">{pc.name}</span>
                ))}
                {(!movie.production_countries || movie.production_countries.length === 0) && <span className="muted">—</span>}
              </div>
            </div>
            <div className="info-card">
              <h4>Orçamento</h4>
              <div className="value">{movie.budget !== 0 ? formatMoney(movie.budget):"N/A"}</div>
            </div>
            <div className="info-card">
              <h4>Receita</h4>
              <div className="value">{movie.revenue !== 0 ? formatMoney(movie.revenue):"N/A"}</div>
            </div>
          </section>

          {/* Recomendações */}
          {!!recommendations?.length && (
            <section className="movie-section">
              <h3 className="section-title">Recomendações</h3>
              <div className="recs-row">
                {recommendations.slice(0, 12).map(r => {
                  const ps = r.poster_path ? `https://image.tmdb.org/t/p/w185${r.poster_path}` : '';
                  return (
                    <div
                      className="rec-card"
                      key={r.id}
                      onClick={() => navigate(`/movie/${r.id}`)}
                      title={r.title}
                    >
                      {ps ? (
                        <img src={ps} alt={r.title} />
                      ) : (
                        <div className="rec-placeholder">Sem poster</div>
                      )}
                      <div className="rec-title">{r.title}</div>
                      <div className="rec-meta">
                        {(r.release_date ? new Date(r.release_date).getFullYear() : 'N/A')}
                        <span className="dot">•</span>
                        ★ {r.vote_average?.toFixed?.(1) ?? r.vote_average ?? 'N/A'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Movie;
