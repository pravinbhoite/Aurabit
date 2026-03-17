import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const GENRES = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Indie', 'Metal', 'Lo-fi', 'Other'];
const MOODS  = ['Happy', 'Sad', 'Energetic', 'Calm', 'Romantic', 'Angry', 'Focused', 'Party', 'Chill'];

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const Admin = () => {
  // ── Song upload state ────────────────────────────────────────────────────
  const [form, setForm] = useState({ title: '', artist: '', album: '', genre: '', mood: '', duration: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [audioDrag, setAudioDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const audioInputRef = useRef();
  const coverInputRef = useRef();

  // ── Users dashboard state ────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // ── Analytics stats state ─────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users/all');
        setTotalUsers(data.total);
        setUsers(data.users);
      } catch (err) {
        setUsersError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setUsersLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch {
        // silently fail — stats are non-critical
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUsers();
    fetchStats();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAudioDrop = (e) => {
    e.preventDefault();
    setAudioDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) setAudioFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) { toast.error('Please select an audio file'); return; }
    if (!form.genre) { toast.error('Please select a genre'); return; }
    if (!form.mood)  { toast.error('Please select a mood'); return; }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);

    setUploading(true);
    try {
      const { data } = await api.post('/songs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => {
          const pct = Math.round((p.loaded * 100) / p.total);
          if (pct < 100) toast.loading(`Uploading... ${pct}%`, { id: 'upload' });
        },
      });
      toast.success(`✅ "${data.title}" uploaded!`, { id: 'upload' });
      setUploaded([data, ...uploaded]);
      setForm({ title: '', artist: '', album: '', genre: '', mood: '', duration: '' });
      setAudioFile(null);
      setCoverFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <div className="admin-container">

        {/* ── Analytics Stats Cards ── */}
        <div className="stats-grid">
          {[
            {
              label: 'Total Users',
              value: statsLoading ? '…' : (stats?.totalUsers ?? '—'),
              icon: '👥',
              color: '#4f8ef7',
              glow: 'rgba(79,142,247,0.15)',
            },
            {
              label: 'Total Songs',
              value: statsLoading ? '…' : (stats?.totalSongs ?? '—'),
              icon: '🎵',
              color: 'var(--accent)',
              glow: 'var(--accent-glow)',
            },
            {
              label: 'Total Playlists',
              value: statsLoading ? '…' : (stats?.totalPlaylists ?? '—'),
              icon: '📂',
              color: '#b47cf7',
              glow: 'rgba(180,124,247,0.15)',
            },
            {
              label: 'Most Played',
              value: statsLoading ? '…' : (stats?.mostPlayedSong?.title || '—'),
              sub: stats?.mostPlayedSong
                ? `${(stats.mostPlayedSong.plays || 0).toLocaleString()} plays · ${stats.mostPlayedSong.artist}`
                : null,
              icon: '🔥',
              color: '#f77c4f',
              glow: 'rgba(247,124,79,0.15)',
            },
          ].map(({ label, value, sub, icon, color, glow }) => (
            <div key={label} className="stat-card" style={{ '--stat-color': color, '--stat-glow': glow }}>
              <div className="stat-card-icon">{icon}</div>
              <div className="stat-card-body">
                <div className="stat-card-value">{value}</div>
                {sub && <div className="stat-card-sub">{sub}</div>}
                <div className="stat-card-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="page-hero">
          <div className="page-hero-label">Admin Panel</div>
          <div className="page-hero-title">Upload Songs ⚡</div>
          <div className="page-hero-sub">Add music with mood and genre tags</div>
        </div>

        {/* ── Song upload form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Audio File Drop Zone */}
          <div
            className={`upload-zone${audioDrag ? ' active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setAudioDrag(true); }}
            onDragLeave={() => setAudioDrag(false)}
            onDrop={handleAudioDrop}
            onClick={() => audioInputRef.current?.click()}
          >
            <UploadIcon />
            {audioFile ? (
              <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 600 }}>🎵 {audioFile.name}</p>
            ) : (
              <>
                <p style={{ margin: '0 0 4px', fontWeight: 600 }}>Drop audio file here</p>
                <p style={{ margin: 0, fontSize: '0.8rem' }}>MP3, WAV, OGG, FLAC, AAC · Max 50MB</p>
              </>
            )}
            <input
              ref={audioInputRef}
              id="audio-file-input"
              type="file"
              accept=".mp3,.wav,.ogg,.flac,.aac,.m4a"
              style={{ display: 'none' }}
              onChange={(e) => setAudioFile(e.target.files[0])}
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="form-label">Cover Image (optional)</label>
            <input
              ref={coverInputRef}
              id="cover-file-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="form-input"
              style={{ paddingTop: 8 }}
              onChange={(e) => setCoverFile(e.target.files[0])}
            />
          </div>

          {/* Metadata fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input id="song-title" name="title" className="form-input" required value={form.title} onChange={handleChange} placeholder="Song title" />
            </div>
            <div className="form-group">
              <label className="form-label">Artist *</label>
              <input id="song-artist" name="artist" className="form-input" required value={form.artist} onChange={handleChange} placeholder="Artist name" />
            </div>
            <div className="form-group">
              <label className="form-label">Album</label>
              <input id="song-album" name="album" className="form-input" value={form.album} onChange={handleChange} placeholder="Album name" />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (seconds)</label>
              <input id="song-duration" name="duration" type="number" className="form-input" value={form.duration} onChange={handleChange} placeholder="e.g. 210" min="0" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Genre *</label>
              <select id="song-genre" name="genre" className="form-select" required value={form.genre} onChange={handleChange}>
                <option value="">Select genre…</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mood *</label>
              <select id="song-mood" name="mood" className="form-select" required value={form.mood} onChange={handleChange}>
                <option value="">Select mood…</option>
                {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <button id="upload-submit-btn" type="submit" className="btn-primary" disabled={uploading}>
            {uploading ? 'Uploading...' : '⬆ Upload Song'}
          </button>
        </form>

        {/* Recently uploaded */}
        {uploaded.length > 0 && (
          <div>
            <h3 className="section-title" style={{ marginBottom: 16 }}>Uploaded This Session</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {uploaded.map((s) => (
                <div key={s._id} style={{
                  background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
                  padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center',
                  borderLeft: '3px solid var(--accent)',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🎵</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.artist} · {s.genre} · {s.mood}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Users Dashboard ── */}
        <div>
          <h3 className="section-title" style={{ marginBottom: 20 }}>👥 Users Dashboard</h3>

          {/* Stat card */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 16,
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius)',
            padding: '20px 32px', marginBottom: 24,
            borderLeft: '4px solid var(--accent)',
          }}>
            <span style={{ fontSize: '2rem' }}>👤</span>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                {usersLoading ? '…' : totalUsers}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>Total Users</div>
            </div>
          </div>

          {/* Loading / error states */}
          {usersLoading && (
            <p style={{ color: 'var(--text-muted)' }}>Loading users…</p>
          )}
          {usersError && (
            <p style={{ color: '#ff6b6b' }}>⚠ {usersError}</p>
          )}

          {/* Users table */}
          {!usersLoading && !usersError && users.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                    {['Name', 'Email', 'Role', 'Joined', 'Last Login'].map((h) => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 14px',
                        color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr
                      key={u._id}
                      style={{
                        background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)',
                        borderBottom: '1px solid var(--border, rgba(255,255,255,0.04))',
                      }}
                    >
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: u.role === 'admin' ? 'var(--accent)' : 'transparent',
                          color: u.role === 'admin' ? '#fff' : 'var(--text-muted)',
                          borderRadius: 99, padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600,
                          border: u.role !== 'admin' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(u.createdAt)}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(u.lastLogin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!usersLoading && !usersError && users.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>No users found.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default Admin;
