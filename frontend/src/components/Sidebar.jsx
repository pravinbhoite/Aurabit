import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRoom } from '../context/RoomContext';
import { usePlayer } from '../context/PlayerContext';
import { useState } from 'react';
import Logo from './Logo';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5a2.5 2.5 0 0 1-5 0A2.5 2.5 0 0 1 12.5 10H15V5h3v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
  </svg>
);
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const AdminIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/>
  </svg>
);
const RoomsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 1 0 0 18A9 9 0 0 0 12 3zm0 2a7 7 0 1 1 0 14A7 7 0 0 1 12 5zm-1 4v2H9v2h2v4h2v-4h2v-2h-2V9h-2z"/>
    <circle cx="8" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/>
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);


const Sidebar = ({ playlists = [] }) => {
  const { user, logout, likedIds } = useAuth();
  const { isInRoom } = useRoom();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <Logo layout="horizontal" size="md" />

      <nav className="sidebar-nav">
        <div className="nav-section">
          <NavLink to="/" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} end>
            <HomeIcon /> Home
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <SearchIcon /> Search
          </NavLink>
          <NavLink to="/library" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <LibraryIcon /> Your Library
          </NavLink>
          <NavLink to="/liked" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <HeartIcon /> Liked Songs
            {likedIds.size > 0 && (
              <span className="liked-badge">{likedIds.size}</span>
            )}
          </NavLink>
        </div>


        <div className="nav-section" style={{ marginTop: 16 }}>
          <NavLink to="/library/create" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <PlusIcon /> Create Playlist
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <AdminIcon /> Admin Upload
            </NavLink>
          )}
          <NavLink to="/profile" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <ProfileIcon /> My Profile
          </NavLink>
          <NavLink to="/rooms" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <RoomsIcon /> Listening Rooms
            {isInRoom && <span className="sidebar-room-dot" title="In a room" />}
          </NavLink>
        </div>
      </nav>

      {/* User playlists list */}
      {playlists.length > 0 && (
        <div className="sidebar-playlists">
          <div className="nav-label" style={{ padding: '0 20px 10px' }}>Playlists</div>
          {playlists.map((pl) => (
            <div
              key={pl._id}
              className="sidebar-playlist-item"
              onClick={() => navigate(`/playlist/${pl._id}`)}
            >
              {pl.name}
            </div>
          ))}
        </div>
      )}
{user && (
  <div className="sidebar-user">
    <div className="sidebar-user-left">
      <NavLink to="/profile" style={{ textDecoration: 'none' }}>
        <div className="sidebar-avatar">
          {user.name?.[0]?.toUpperCase()}
        </div>
      </NavLink>

      <div className="sidebar-user-info">
        <div className="sidebar-username">
          {user.name}
        </div>
        <div className="sidebar-role">
          {user.role === 'admin' ? '⚡ Admin' : 'Listener'}
        </div>
      </div>
    </div>

    <button
      className="sidebar-logout"
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
)}
    </aside>
  )}

export default Sidebar;