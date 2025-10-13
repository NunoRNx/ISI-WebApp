import React, { useEffect, useState, useMemo, useRef } from 'react';
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

  // Estado para XML (apenas leitura)
  const [xmlPreview, setXmlPreview] = useState('');
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subsStatus, setSubsStatus] = useState('');
  const fileInputRef = useRef(null);

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

  const xmlEscape = (s) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  // Constrói XML de exemplo no formato solicitado
  const buildExampleXML = (m) => {
    const t = xmlEscape(m?.title || 'Uncharted');
    const y = (m?.release_date ? new Date(m.release_date).getFullYear() : 2022);
    const lang = (m?.original_language || 'en');
    const mid = xmlEscape(id || '335787');
    return `<?xml version="1.0" encoding="UTF-8"?>
    <movie>
      <Id>${mid}</Id>
      <title>${t}</title>
      <year>${xmlEscape(y)}</year>
      <language>${xmlEscape(lang)}</language>
      <movieLength>${toHHMMSS(m?.runtime || 0)}</movieLength>
      <subtitles>
        <subtitle start="HH:MM:SS" end="HH:MM:SS">This is an exemple</subtitle>
        <subtitle start="HH:MM:SS" end="HH:MM:SS">This is an exemple 2</subtitle>
      </subtitles>
    </movie>`;
  };

  const toHHMMSS = (totalMin) => {
  const m = Math.max(0, Number(totalMin) || 0);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(mm)}:00`;
  };
  
  // Validação mínima de bem-formado (opcional)
  const isWellFormedXML = (text) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'application/xml');
      const err = doc.getElementsByTagName('parsererror');
      return err.length === 0;
    } catch {
      return false;
    }
  };

  // Carrega o XML existente (para pré-visualização e download)
  const fetchCurrentXML = async () => {
    setLoadingSubs(true);
    setSubsStatus('');
    try {
      const res = await fetch(`/knime/subtitles?movieId=${id}`, { headers: { Accept: 'application/xml' } });
      if (res.status === 204) {
        const ex = buildExampleXML(movie);
        setXmlPreview(ex);
        setSubsStatus('Sem XML na base de dados. A mostrar exemplo.');
      } else if (res.ok) {
        const text = await res.text();
        if (text && text.trim()) {
          setXmlPreview(text);
          setSubsStatus('XML atual carregado.');
        } else {
          const ex = buildExampleXML(movie);
          setXmlPreview(ex);
          setSubsStatus('Resposta vazia. A mostrar exemplo.');
        }
      } else {
        const msg = await res.text();
        const ex = buildExampleXML(movie);
        setXmlPreview(ex);
        setSubsStatus(`Falha ao obter XML (${res.status}). A mostrar exemplo. ${msg || ''}`.trim());
      }
    } catch {
      const ex = buildExampleXML(movie);
      setXmlPreview(ex);
      setSubsStatus('Erro de rede. A mostrar exemplo.');
    } finally {
      setLoadingSubs(false);
    }
  };

  // Download helpers
  const downloadTextAsFile = (text, filename) => {
    const blob = new Blob([text], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExisting = async () => {
    setSubsStatus('');
    setLoadingSubs(true);
    try {
      const res = await fetch(`/knime/subtitles?movieId=${id}`, { headers: { Accept: 'application/xml' } });
      if (res.status === 204) {
        setSubsStatus('Sem XML na BD. Usa "Download Exemplo".');
      } else if (res.ok) {
        const xml = await res.text();
        if (!xml || !xml.trim()) {
          setSubsStatus('Resposta vazia. Usa "Download Exemplo".');
        } else {
          downloadTextAsFile(xml, `movie-${id}.xml`);
          setSubsStatus('Download concluído.');
        }
      } else {
        const msg = await res.text();
        setSubsStatus(`Falha ao obter XML: ${res.status} ${msg || ''}`.trim());
      }
    } catch {
      setSubsStatus('Erro de rede ao obter XML.');
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleDownloadExample = () => {
    try {
      const xml = buildExampleXML(movie);
      downloadTextAsFile(xml, `movie-${id}-example.xml`);
      setSubsStatus('Exemplo descarregado.');
    } catch {
      setSubsStatus('Falha ao gerar exemplo.');
    }
  };

  // Upload de ficheiro (multipart: movieId + file)
  const handleUploadFile = async (file) => {
    if (!file) return;
    setSubsStatus('A enviar ficheiro para KNIME...');
    setLoadingSubs(true);
    try {
      // Validação local opcional: bem-formado
      const text = await file.text().catch(() => null);
      if (text && !isWellFormedXML(text)) {
        setSubsStatus('XML malformado. Corrigir e tentar novamente.');
        setLoadingSubs(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const form = new FormData();
      form.append('movieId', id);
      form.append('file', file, file.name);

      const res = await fetch(`/knime/subtitles/upload`, { method: 'POST', body: form });

      if (res.ok) {
        setSubsStatus('Upload recebido. KNIME vai validar e gravar.');
        // Recarregar a pré-visualização após upload bem-sucedido
        await fetchCurrentXML();
      } else {
        const msg = await res.text();
        setSubsStatus(`Falha no upload: ${res.status} ${msg || ''}`.trim());
      }
    } catch {
      setSubsStatus('Erro de rede no upload.');
    } finally {
      setLoadingSubs(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.xml')) {
      setSubsStatus('Apenas ficheiros .xml são permitidos.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    handleUploadFile(file);
  };

  // Carrega dados TMDB
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
      } catch {
        if (!isMounted) return;
        setMovie(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAll();
    return () => { isMounted = false; };
  }, [id]);

  // Carrega XML atual/exemplo quando o filme estiver disponível
  useEffect(() => {
    if (!id) return;
    if (movie !== null) fetchCurrentXML();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, movie]);

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

          {/* Secção: Legendas (preview + download/upload) */}
          <section className="subs-editor" style={{ marginTop: 24 }}>
            <h3 className="section-title">Legendas (XML)</h3>
            <p className="subs-status">{subsStatus || (loadingSubs ? 'A processar...' : '')}</p>

            {/* Preview somente leitura */}
            <pre
              className="code-box"
              style={{
                width: '100%',
                minHeight: 260,
                maxHeight: 420,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                background: '#0f0f0f',
                color: '#eaeaea',
                borderRadius: 8,
                padding: 12,
                border: '1px solid #333',
                marginBottom: 8,
              }}
              aria-label="Pré-visualização de XML"
            >
              {xmlPreview || 'Sem conteúdo para mostrar.'}
            </pre>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handleDownloadExisting} disabled={loadingSubs}>
                Download XML
              </button>
              <button className="btn-secondary" onClick={handleDownloadExample} disabled={loadingSubs}>
                Download Exemplo
              </button>
              <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                Carregar XML
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xml,application/xml,text/xml"
                  onChange={onFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <p className="muted" style={{ marginTop: 8 }}>
              O upload envia o movieId juntamente com o ficheiro para validação no KNIME; o workflow deve rejeitar se o &lt;Id&gt; do XML não corresponder ao movieId do pedido.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Movie;
