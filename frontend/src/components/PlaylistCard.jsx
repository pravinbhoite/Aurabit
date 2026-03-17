import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const PlaylistCard = ({ playlist, onClick }) => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const handleClick = () => {
    if (onClick) onClick(playlist);
    else navigate(`/playlist/${playlist._id}`);
  };

  const handlePlayAll = (e) => {
    e.stopPropagation();
    if (playlist.songs?.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
    }
  };

  const coverSrc = playlist.coverImage?.startsWith('/uploads')
    ? `http://localhost:5000${playlist.coverImage}`
    : playlist.coverImage;

  return (
    <div className="playlist-card" onClick={handleClick}>
      <div style={{ position: 'relative' }}>
        {coverSrc ? (
          <img className="playlist-cover" src={coverSrc} alt={playlist.name} />
        ) : (
          <div className="playlist-cover-placeholder">🎵</div>
        )}
        {playlist.songs?.length > 0 && (
          <button
            style={{
              position: 'absolute', bottom: 14, right: 8,
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--accent)', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
            className="playlist-play-btn"
            onClick={handlePlayAll}
          >
            <PlayIcon />
          </button>
        )}
      </div>
      <div className="playlist-name">{playlist.name}</div>
      <div className="playlist-count">{playlist.songs?.length || 0} songs</div>
      <style>{`.playlist-card:hover .playlist-play-btn { opacity: 1 !important; }`}</style>
    </div>
  );
};

export default PlaylistCard;
