import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const SongPage = () => {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const { data } = await api.get(`/songs/${id}`);
        setSong(data);
      } catch (err) {
        setError('Song not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  if (loading) return (
    <div className="layout">
      <div className="main-content">
        <div className="spinner" style={{ margin: '50px auto' }} />
      </div>
    </div>
  );

  if (error || !song) return (
    <div className="layout">
      <div className="main-content">
        <div className="public-song-error">
          <h2>Oops!</h2>
          <p>{error}</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>Go to AuraBeat</Link>
        </div>
      </div>
    </div>
  );

  const coverSrc = song.coverImage?.startsWith('/uploads')
    ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${song.coverImage}`
    : song.coverImage;

  return (
    <div className="layout">
      <div className="main-content public-song-content">
        <div className="public-song-hero">
          <div className="public-song-cover-container">
            {coverSrc ? (
              <img className="public-song-cover" src={coverSrc} alt={song.title} />
            ) : (
              <div className="public-song-cover fallback">🎵</div>
            )}
          </div>
          
          <div className="public-song-info">
            <div className="public-song-label">Song</div>
            <h1 className="public-song-title">{song.title}</h1>
            <div className="public-song-artist">{song.artist}</div>
            
            <div className="public-song-meta">
              <span className="song-tag">{song.genre}</span>
              <span className="meta-dot">•</span>
              <span>{(song.plays || 0).toLocaleString()} plays</span>
            </div>
            
            <div className="public-song-actions">
              <button 
                className="public-play-btn"
                onClick={() => playSong(song, [song])}
              >
                <PlayIcon /> Play Now
              </button>
              <button
                className="public-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard!');
                }}
              >
                <CopyIcon /> Copy Link
              </button>
            </div>
          </div>
        </div>
        
        <div className="public-song-promo">
          <h3>Love this track?</h3>
          <p>Join AuraBeat to like songs, create playlists, and listen in real-time rooms.</p>
          <Link to="/register" className="btn-secondary" style={{ display: 'inline-block', marginTop: 16 }}>Sign Up Free</Link>
          <div style={{ marginTop: 12, fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongPage;
