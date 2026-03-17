import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import SongCard from '../components/SongCard';
import toast from 'react-hot-toast';

const MOODS = ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Angry', 'Focused', 'Party', 'Chill'];

const SparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent)' }}>
    <path d="M12 1l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16l-6.2 4.3 2.4-7.4L2 8.4h7.6z"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const Home = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [moodSongs, setMoodSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [recMeta, setRecMeta] = useState(null);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
    fetchTrending();
    if (user?._id) fetchRecommendations();
  }, [user]);

  const fetchSongs = async () => {
    try {
      const { data } = await api.get('/songs?limit=12');
      setSongs(data.songs || []);
    } catch (err) {
      console.log('ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const { data } = await api.get('/songs/trending');
      setTrendingSongs(data || []);
    } catch {
      // Silently fail
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const { data } = await api.get(`/recommendations/${user._id}`);
      setRecommendations(data.recommendations || []);
      setRecMeta(data.meta || null);
    } catch {
      // Silently fail — recommendations are bonus
    } finally {
      setRecLoading(false);
    }
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood === selectedMood ? '' : mood);
    if (mood === selectedMood) { setMoodSongs([]); return; }
    try {
      const { data } = await api.get(`/search?mood=${mood}`);
      setMoodSongs(data);
    } catch {
      toast.error('Failed to fetch mood songs');
    }
  };

  const displaySongs = selectedMood && moodSongs.length > 0 ? moodSongs : songs;

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-label">Welcome back</div>
        <div className="page-hero-title">
          Good{' '}
          {new Date().getHours() < 12
            ? 'Morning'
            : new Date().getHours() < 17
            ? 'Afternoon'
            : 'Evening'}
          ,<br />
          {user?.name?.split(' ')[0]} 👋
        </div>
        <div className="page-hero-sub">What's your vibe today?</div>
      </div>

      {/* Mood Picker */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-header">
          <h2 className="section-title">Choose Your Mood</h2>
        </div>
        <div className="filter-chips">
          {MOODS.map((mood) => (
            <button
              key={mood}
              className={`chip${selectedMood === mood ? ' active' : ''}`}
              onClick={() => handleMoodSelect(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* 🔥 Trending Songs */}
      {(trendingLoading || trendingSongs.length > 0) && (
        <div style={{ marginBottom: 36 }}>
          <div className="section-header">
            <h2 className="section-title trending-title">
              <span className="trending-icon"><TrendingIcon /></span>
              Trending Now
            </h2>
          </div>

          {trendingLoading ? (
            <div className="spinner" />
          ) : (
            <div className="trending-list">
              {trendingSongs.map((song, i) => {
                const coverSrc = song.coverImage?.startsWith('/uploads')
                  ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${song.coverImage}`
                  : song.coverImage;

                return (
                  <div key={song._id} className="trending-item">
                    {/* Rank */}
                    <div className={`trending-rank${i < 3 ? ' trending-rank--top' : ''}`}>
                      {i + 1}
                    </div>

                    {/* Cover */}
                    {coverSrc ? (
                      <img className="trending-cover" src={coverSrc} alt={song.title} />
                    ) : (
                      <div className="trending-cover trending-cover--fallback">🎵</div>
                    )}

                    {/* Info */}
                    <div className="trending-info">
                      <div className="trending-song-title">{song.title}</div>
                      <div className="trending-song-artist">{song.artist}</div>
                    </div>

                    {/* Genre chip */}
                    <span className="song-tag" style={{ flexShrink: 0 }}>{song.genre}</span>

                    {/* Play count */}
                    <div className="trending-plays">
                      <span className="trending-plays-num">{(song.plays || 0).toLocaleString()}</span>
                      <span className="trending-plays-label">plays</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div className="section-header">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SparkleIcon /> AI Picks For You
            </h2>
          </div>

          {/* Taste context chips */}
          {recMeta && !recMeta.isFallback && (
            <div className="rec-taste-chips">
              {[...(recMeta.topGenres || []), ...(recMeta.topArtists || []).slice(0, 2)].map((tag) => (
                <span key={tag} className="rec-taste-chip">{tag}</span>
              ))}
            </div>
          )}

          {recLoading ? (
            <div className="spinner" />
          ) : (
            <div className="songs-grid">
              {recommendations.slice(0, 6).map((song) => (
                <SongCard key={song._id} song={song} queue={recommendations} />
              ))}
            </div>
          )}
        </div>
      )}


      {/* All / Mood Songs */}
      <div>
        <div className="section-header">
          <h2 className="section-title">
            {selectedMood ? `${selectedMood} Vibes 🎵` : 'All Songs'}
          </h2>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : displaySongs.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎵</div>
            <h3>No songs yet</h3>
            <p>Ask an admin to upload some tracks!</p>
          </div>
        ) : (
          <div className="songs-grid">
            {displaySongs.map((song) => (
              <SongCard key={song._id} song={song} queue={displaySongs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
