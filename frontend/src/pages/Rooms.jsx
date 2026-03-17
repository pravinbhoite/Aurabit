import { useState } from 'react';
import { useRoom } from '../context/RoomContext';
import { useAuth } from '../context/AuthContext';
import RoomPlayer from '../components/RoomPlayer';

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const Rooms = () => {
  const { user } = useAuth();
  const { isInRoom, room, isHost, roomError, connecting, createRoom, joinRoom, leaveRoom, setRoomError } = useRoom();

  const [displayName, setDisplayName] = useState(user?.name?.split(' ')[0] || '');
  const [joinCode, setJoinCode]       = useState('');
  const [tab, setTab]                 = useState('create'); // 'create' | 'join'
  const [copied, setCopied]           = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    await createRoom(displayName.trim());
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim() || !displayName.trim()) return;
    await joinRoom(joinCode.trim(), displayName.trim());
  };

  const copyCode = () => {
    navigator.clipboard.writeText(room?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If already in a room, show the room player UI
  if (isInRoom && room) {
    return <RoomPlayer />;
  }

  return (
    <div className="rooms-page">
      {/* Hero */}
      <div className="page-hero" style={{ marginBottom: 32 }}>
        <div className="page-hero-label">Social</div>
        <div className="page-hero-title">🎧 Listening Rooms</div>
        <div className="page-hero-sub">Listen together in real time — create a room or join with a code</div>
      </div>

      {/* Error banner */}
      {roomError && (
        <div className="room-error-banner">
          ⚠ {roomError}
          <button onClick={() => setRoomError(null)} className="room-error-close">✕</button>
        </div>
      )}

      {/* Tab toggle */}
      <div className="room-tabs">
        <button
          className={`room-tab${tab === 'create' ? ' active' : ''}`}
          onClick={() => setTab('create')}
        >
          Create Room
        </button>
        <button
          className={`room-tab${tab === 'join' ? ' active' : ''}`}
          onClick={() => setTab('join')}
        >
          Join Room
        </button>
      </div>

      {/* Create panel */}
      {tab === 'create' && (
        <div className="room-panel">
          <h3 className="room-panel-title">Start a Listening Room</h3>
          <p className="room-panel-sub">You'll be the host — only you control playback. Share the room code to invite friends.</p>
          <form onSubmit={handleCreate} className="room-form">
            <div className="form-group">
              <label className="form-label">Your display name</label>
              <input
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                required
                maxLength={30}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={connecting || !displayName.trim()}>
              {connecting ? 'Creating…' : '🎧 Create Room'}
            </button>
          </form>
        </div>
      )}

      {/* Join panel */}
      {tab === 'join' && (
        <div className="room-panel">
          <h3 className="room-panel-title">Join a Room</h3>
          <p className="room-panel-sub">Enter the 6-character room code shared by the host.</p>
          <form onSubmit={handleJoin} className="room-form">
            <div className="form-group">
              <label className="form-label">Room Code</label>
              <input
                className="form-input room-code-input"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. XK92PL"
                required
                maxLength={6}
                style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: '1.1rem' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Your display name</label>
              <input
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                required
                maxLength={30}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={connecting || !joinCode.trim() || !displayName.trim()}>
              {connecting ? 'Joining…' : '🚪 Join Room'}
            </button>
          </form>
        </div>
      )}

      {/* How it works */}
      <div className="room-how-it-works">
        <div className="room-how-step"><span>1</span>Create or join a room</div>
        <div className="room-how-step"><span>2</span>Share the 6-char code</div>
        <div className="room-how-step"><span>3</span>Play music — everyone hears it live</div>
      </div>
    </div>
  );
};

export default Rooms;
