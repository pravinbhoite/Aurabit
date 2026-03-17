import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const PlaylistDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayer();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPlaylist(); }, [id]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/playlists/${id}`);
      setPlaylist(data);
    } catch {
      toast.error('Playlist not found');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAll = () => {
    if (playlist.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const handlePlaySong = (song) => {
    if (currentSong?._id === song._id) {
      togglePlay();
    } else {
      playSong(song, playlist.songs);
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const { data } = await api.put(`/playlists/${id}/remove-song`, { songId });
      setPlaylist({ ...playlist, songs: data.songs });
      toast.success('Song removed');
    } catch {
      toast.error('Failed to remove song');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Delete this playlist?')) return;
    try {
      await api.delete(`/playlists/${id}`);
      toast.success('Playlist deleted');
      navigate('/library');
    } catch {
      toast.error('Failed to delete playlist');
    }
  };

  if (loading) return <div className="spinner" />;
  if (!playlist) return null;

  const isOwner = user?._id === playlist.userId?._id || user?._id === playlist.userId;

  return (
    <div>
      {/* Header */}
      <div className="page-hero" style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div
          style={{
            width: 180, height: 180, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#1a3a1a,#0d3d0d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '4rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          🎵
        </div>
        <div style={{ flex: 1 }}>
          <div className="page-hero-label">Playlist</div>
          <div className="page-hero-title">{playlist.name}</div>
          <div className="page-hero-sub">
            {playlist.userId?.name} · {playlist.songs?.length || 0} songs
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <button
              id="play-all-btn"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={handlePlayAll}
              disabled={!playlist.songs?.length}
            >
              <PlayIcon /> Play All
            </button>
            {isOwner && (
              <button id="delete-playlist-btn" className="btn-secondary" onClick={handleDeletePlaylist}
                style={{ borderColor: '#ff4444', color: '#ff4444' }}>
                Delete Playlist
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Song List */}
      {playlist.songs?.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎵</div>
          <h3>This playlist is empty</h3>
          <p>Search for songs and add them here</p>
        </div>
      ) : (
        <div className="song-list" style={{ marginTop: 24 }}>
          {/* Header row */}
          <div className="song-list-item" style={{ cursor: 'default', opacity: 0.5, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            <span>#</span><span></span><span>Title</span><span>Genre/Mood</span><span>Duration</span>
          </div>

          {playlist.songs.map((song, idx) => {
            const isCurrentSong = currentSong?._id === song._id;
            const coverSrc = song.coverImage?.startsWith('/uploads')
              ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${song.coverImage}`
              : song.coverImage;

            return (
              <div
                key={song._id}
                className={`song-list-item${isCurrentSong ? ' playing' : ''}`}
                onClick={() => handlePlaySong(song)}
              >
                <span className="song-list-num">
                  {isCurrentSong && isPlaying ? (
                    <div className="eq-bars" style={{ margin: 'auto' }}>
                      {[1,2,3,4].map(i => <div key={i} className="eq-bar" />)}
                    </div>
                  ) : idx + 1}
                </span>
                {coverSrc ? (
                  <img className="song-list-cover" src={coverSrc} alt={song.title} />
                ) : (
                  <div className="song-list-cover" style={{ background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>🎵</div>
                )}
                <div>
                  <div className="song-list-info-title">{song.title}</div>
                  <div className="song-list-info-artist">{song.artist}</div>
                </div>
                <div>
                  <div className="song-list-genre">{song.genre}</div>
                  <div className="song-list-info-artist">{song.mood}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="song-list-duration">{formatTime(song.duration)}</span>
                  {isOwner && (
                    <button
                      className="player-btn"
                      style={{ color: 'var(--text-faint)' }}
                      onClick={(e) => { e.stopPropagation(); handleRemoveSong(song._id); }}
                      title="Remove from playlist"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
