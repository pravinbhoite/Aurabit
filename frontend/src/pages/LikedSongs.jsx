import { useState, useEffect } from 'react';
import api from '../api/axios';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const HeartFilledIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const formatDuration = (secs) => {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = String(Math.floor(secs % 60)).padStart(2, '0');
  return `${m}:${s}`;
};

const LikedSongs = () => {
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer();
  const { likedIds, toggleLike } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch liked songs on mount
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users/liked-songs');
        setSongs(data);
      } catch {
        toast.error('Could not load liked songs');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Keep list in sync when user unlikes a song from this page
  useEffect(() => {
    setSongs((prev) => prev.filter((s) => likedIds.has(s._id)));
  }, [likedIds]);

  const handlePlay = (song) => {
    if (currentSong?._id === song._id) {
      togglePlay();
    } else {
      playSong(song, songs);
    }
  };

  const handleUnlike = async (e, song) => {
    e.stopPropagation();
    await toggleLike(song._id);
    toast.success('Removed from Liked Songs');
  };

  const coverSrc = (song) =>
    song.coverImage?.startsWith('/uploads')
      ? `http://localhost:5000${song.coverImage}`
      : song.coverImage;

  if (loading) {
    return (
      <div className="liked-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="liked-page">
      {/* Hero */}
      <div className="liked-hero">
        <div className="liked-hero-icon">
          <HeartFilledIcon />
        </div>
        <div>
          <div className="page-hero-label">Your Library</div>
          <div className="page-hero-title">Liked Songs</div>
          <div className="page-hero-sub">{songs.length} song{songs.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Empty state */}
      {songs.length === 0 && (
        <div className="empty-state">
          <HeartFilledIcon />
          <h3>No liked songs yet</h3>
          <p>Hit the ❤ on any song to save it here.</p>
        </div>
      )}

      {/* Song list */}
      {songs.length > 0 && (
        <div className="song-list">
          {songs.map((song, i) => {
            const active = currentSong?._id === song._id;
            return (
              <div
                key={song._id}
                className={`song-list-item${active ? ' playing' : ''}`}
                onClick={() => handlePlay(song)}
              >
                {/* Number / play indicator */}
                <div className="song-list-num">
                  {active && isPlaying ? (
                    <span style={{ color: 'var(--accent)' }}>▶</span>
                  ) : (
                    i + 1
                  )}
                </div>

                {/* Cover */}
                {coverSrc(song) ? (
                  <img className="song-list-cover" src={coverSrc(song)} alt={song.title} />
                ) : (
                  <div className="song-list-cover" style={{ background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', borderRadius: 4 }}>🎵</div>
                )}

                {/* Info */}
                <div>
                  <div className={`song-list-info-title${active ? ' liked-active-title' : ''}`}>{song.title}</div>
                  <div className="song-list-info-artist">{song.artist}</div>
                </div>

                {/* Genre */}
                <div className="song-list-genre">{song.genre}</div>

                {/* Duration + unlike button */}
                <div className="liked-song-actions">
                  <span className="song-list-duration">{formatDuration(song.duration)}</span>
                  <button
                    className="song-like-btn liked"
                    onClick={(e) => handleUnlike(e, song)}
                    title="Unlike"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LikedSongs;
