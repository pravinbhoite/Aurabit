import { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { usePlayer } from '../context/PlayerContext';
import toast from 'react-hot-toast';

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);
const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
);

const RoomPlayer = () => {
  const { room, isHost, leaveRoom, broadcastPlay, broadcastPause, broadcastSeek, broadcastSongChange } = useRoom();
  const { currentSong, isPlaying, progress, togglePlay, seek } = usePlayer();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(room?.code || '');
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayPause = () => {
    if (!isHost) return;
    if (isPlaying) {
      togglePlay();
      broadcastPause();
    } else {
      togglePlay();
      broadcastPlay();
    }
  };

  const handleSeek = (e) => {
    if (!isHost) return;
    const pct = Number(e.target.value);
    seek(pct);
    broadcastSeek(pct);
  };

  const handleLeave = () => {
    leaveRoom();
    toast.success('Left the room');
  };

  const coverSrc = currentSong?.coverImage?.startsWith('/uploads')
    ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}${currentSong.coverImage}`
    : currentSong?.coverImage;

  return (
    <div className="room-player-page">

      {/* Header bar */}
      <div className="room-player-header">
        <div className="room-player-badge">
          <span className="room-live-dot" />
          LIVE ROOM
        </div>
        <div className="room-code-display">
          <span className="room-code-label">Room</span>
          <span className="room-code-value">{room?.code}</span>
          <button className="room-copy-btn" onClick={copyCode} title="Copy code">
            {copied ? '✓' : <CopyIcon />}
          </button>
        </div>
        <button className="room-leave-btn" onClick={handleLeave}>Leave</button>
      </div>

      {/* Current song */}
      <div className="room-now-playing">
        {coverSrc ? (
          <img className="room-cover" src={coverSrc} alt={currentSong?.title} />
        ) : (
          <div className="room-cover room-cover--fallback">🎵</div>
        )}
        <div className="room-song-info">
          <div className="room-song-title">{currentSong?.title || 'Nothing playing yet'}</div>
          <div className="room-song-artist">{currentSong?.artist || (isHost ? 'Play a song to share with the room' : 'Waiting for host to play a song…')}</div>
          {currentSong && <span className="song-tag" style={{ marginTop: 8, display: 'inline-block' }}>{currentSong.genre}</span>}
        </div>
      </div>

      {/* Controls — host only */}
      {isHost && currentSong && (
        <div className="room-controls">
          <button className="room-play-btn" onClick={handlePlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <input
            type="range"
            className="room-seek-bar"
            min={0} max={100} step={0.5}
            value={progress}
            onChange={handleSeek}
          />
          <span className="room-seek-pct">{Math.round(progress)}%</span>
        </div>
      )}

      {!isHost && (
        <div className="room-guest-notice">
          🎧 You're listening as a guest. Only the host controls playback.
        </div>
      )}

      {/* Member list */}
      <div className="room-members-section">
        <div className="room-members-title">
          In this room <span className="room-member-count">{room?.members?.length || 0}</span>
        </div>
        <div className="room-member-list">
          {room?.members?.map((m) => (
            <div key={m.socketId} className="room-member-chip">
              <div className="room-member-avatar">{m.name?.[0]?.toUpperCase()}</div>
              <span>{m.name}</span>
              {m.socketId === room.hostId && <span className="room-host-badge">host</span>}
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <p className="room-host-tip">
          💡 Play any song from <strong>Home</strong> or <strong>Search</strong> — it will sync to everyone in this room automatically.
        </p>
      )}
    </div>
  );
};

export default RoomPlayer;
