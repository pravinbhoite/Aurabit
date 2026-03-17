import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
};

const StatCard = ({ icon, value, label, accent }) => (
  <div className="profile-stat-card" style={{ '--stat-accent': accent }}>
    <div className="profile-stat-icon">{icon}</div>
    <div className="profile-stat-value">{value}</div>
    <div className="profile-stat-label">{label}</div>
  </div>
);

const Profile = () => {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setProfile(data);
      } catch {
        /* silently graceful */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Avatar initials from name
  const initials = (authUser?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return <div className="profile-page"><div className="spinner" /></div>;
  }

  const p = profile || {};

  return (
    <div className="profile-page">

      {/* ── Avatar + identity ── */}
      <div className="profile-hero">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-identity">
          <div className="profile-name">{p.name || authUser?.name || '—'}</div>
          <div className="profile-email">{p.email || '—'}</div>
          <span className={`profile-role-badge${p.role === 'admin' ? ' admin' : ''}`}>
            {p.role === 'admin' ? '⚙ Admin' : '🎵 Listener'}
          </span>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="profile-stats">
        <StatCard
          icon="❤"
          value={p.totalLikedSongs ?? '—'}
          label="Liked Songs"
          accent="#ff4d6d"
        />
        <StatCard
          icon="📂"
          value={p.totalPlaylists ?? '—'}
          label="Playlists"
          accent="#b47cf7"
        />
        <StatCard
          icon="🕓"
          value={p.totalRecentlyPlayed ?? '—'}
          label="Recently Played"
          accent="#4f8ef7"
        />
      </div>

      {/* ── Account details ── */}
      <div className="profile-details-card">
        <h3 className="profile-section-title">Account Details</h3>
        <div className="profile-details-grid">
          {[
            { label: 'Full Name', value: p.name },
            { label: 'Email', value: p.email },
            { label: 'Role', value: p.role === 'admin' ? 'Administrator' : 'Listener' },
            { label: 'Joined', value: formatDate(p.joinedAt) },
            { label: 'Last Login', value: formatDate(p.lastLogin) },
          ].map(({ label, value }) => (
            <div key={label} className="profile-detail-row">
              <span className="profile-detail-label">{label}</span>
              <span className="profile-detail-value">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Profile;
