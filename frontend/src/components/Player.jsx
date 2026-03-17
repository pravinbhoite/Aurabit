import { usePlayer } from '../context/PlayerContext';

const formatTime = (secs) => {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);
const PrevIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
  </svg>
);
const NextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>
);
const VolumeHighIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);
const VolumeMuteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>
  </svg>
);
const MusicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

const Player = () => {
  const { currentSong, isPlaying, progress, duration, volume, togglePlay, playNext, playPrev, seek, setVolume } =
    usePlayer();

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    seek(Math.max(0, Math.min(100, percent)));
  };

  const isMuted = volume === 0;

  return (
    <footer className="player">
      {/* Left: song info */}
      <div className="player-song-info">
        {currentSong ? (
          <>
            <img
              className="player-cover"
              src={currentSong.coverImage?.startsWith('/uploads')
                ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${currentSong.coverImage}`
                : currentSong.coverImage || '/default-cover.png'}
              alt={currentSong.title}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="player-meta">
              <div className="player-title">{currentSong.title}</div>
              <div className="player-artist">{currentSong.artist}</div>
            </div>
          </>
        ) : (
          <>
            <div className="player-cover-placeholder">
              <MusicIcon />
            </div>
            <div className="player-meta">
              <div className="player-title" style={{ color: 'var(--text-muted)' }}>No song playing</div>
            </div>
          </>
        )}
      </div>

      {/* Center: controls + progress */}
      <div className="player-controls">
        <div className="player-buttons">
          <button className="player-btn" onClick={playPrev} disabled={!currentSong} aria-label="Previous">
            <PrevIcon />
          </button>
          <button className="player-btn play-btn" onClick={togglePlay} disabled={!currentSong} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="player-btn" onClick={playNext} disabled={!currentSong} aria-label="Next">
            <NextIcon />
          </button>
        </div>

        <div className="progress-bar-container">
          <span className="progress-time">{formatTime((progress / 100) * duration)}</span>
          <div
            className="progress-bar"
            onClick={handleProgressClick}
            role="slider"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-time right">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: volume */}
      <div className="player-right">
        <div className="volume-container">
          <button
            className="player-btn"
            onClick={() => setVolume(isMuted ? 0.7 : 0)}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeMuteIcon /> : <VolumeHighIcon />}
          </button>
          <input
            type="range"
            className="volume-slider"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  );
};

export default Player;
