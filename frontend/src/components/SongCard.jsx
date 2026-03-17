import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

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

const HeartIcon = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

const EqBars = () => (
  <div className="eq-bars">
    {[1,2,3,4].map(i => <div key={i} className="eq-bar" />)}
  </div>
);

const SongCard = ({ song, queue = [] }) => {
  const { playSong, togglePlay, currentSong, isPlaying } = usePlayer();
  const { likedIds, toggleLike } = useAuth();
  const isCurrentSong = currentSong?._id === song._id;
  const isLiked = likedIds.has(song._id);
  const [liking, setLiking] = useState(false);

  const [playlists, setPlaylists] = useState([]);

  // Fetch playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { data } = await api.get('/playlists');
        setPlaylists(data);
      } catch {}
    };
    fetchPlaylists();
  }, []);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrentSong) {
      togglePlay();
    } else {
      playSong(song, queue.length > 0 ? queue : [song]);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liking) return;
    setLiking(true);
    const liked = await toggleLike(song._id);
    if (liked === null) toast.error('Failed to update like');
    else toast.success(liked ? '❤ Added to Liked Songs' : 'Removed from Liked Songs');
    setLiking(false);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/song/${song._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Song link copied to clipboard!');
  };

  const addToPlaylist = async (playlistId) => {
    if (!playlistId) return;
    try {
      await api.put(`/playlists/${playlistId}/add-song`, { songId: song._id });
      toast.success('Added to playlist 🎵');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding song');
    }
  };

  const coverSrc = song.coverImage?.startsWith('/uploads')
    ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${song.coverImage}`
    : song.coverImage;

  return (
    <div className={`song-card ${isCurrentSong ? 'playing' : ''}`}>
      <div className="song-card-cover-wrap">
        {coverSrc ? (
          <img className="song-card-cover" src={coverSrc} alt={song.title} />
        ) : (
          <div className="song-card-cover fallback">🎵</div>
        )}

        <button className="song-card-play-btn" onClick={handlePlay}>
          {isCurrentSong && isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      {/* Title row with like and share buttons */}
      <div className="song-card-title-row">
        <div className="song-card-title" title={song.title}>{song.title}</div>
        <div className="song-card-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="song-share-btn"
            onClick={handleShare}
            title="Share Song"
          >
            <ShareIcon />
          </button>
          <button
            className={`song-like-btn${isLiked ? ' liked' : ''}`}
            onClick={handleLike}
            disabled={liking}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <HeartIcon filled={isLiked} />
          </button>
        </div>
      </div>

      <div className="song-card-artist">{song.artist}</div>

      <div className="song-card-meta">
        <span className="song-tag">{song.genre}</span>
        {isCurrentSong && isPlaying && <EqBars />}
      </div>

      {/* Add to Playlist */}
      <select
        className="song-playlist-select"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => addToPlaylist(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Add to playlist</option>
        {playlists.map((pl) => (
          <option key={pl._id} value={pl._id}>{pl.name}</option>
        ))}
      </select>
    </div>
  );
};

export default SongCard;