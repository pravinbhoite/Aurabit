import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PlaylistCard from '../components/PlaylistCard';
import toast from 'react-hot-toast';

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const Library = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchPlaylists(); }, []);

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(data);
    } catch {
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post('/playlists', { name: newName.trim() });
      setPlaylists([data, ...playlists]);
      setNewName('');
      setShowForm(false);
      toast.success(`Playlist "${data.name}" created!`);
      navigate(`/playlist/${data._id}`);
    } catch {
      toast.error('Failed to create playlist');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="page-hero">
        <div className="page-hero-label">Your Collection</div>
        <div className="page-hero-title">Your Library</div>
        <div className="page-hero-sub">{playlists.length} playlist{playlists.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Playlists</h2>
        <button
          id="create-playlist-btn"
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
          onClick={() => setShowForm(!showForm)}
        >
          <PlusIcon /> New Playlist
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            display: 'flex', gap: 10, marginBottom: 24,
            background: 'var(--bg-elevated)', padding: 16,
            borderRadius: 'var(--radius)', border: '1px solid var(--border)',
          }}
        >
          <input
            id="playlist-name-input"
            className="form-input"
            style={{ flex: 1, margin: 0 }}
            type="text"
            placeholder="Playlist name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button id="playlist-create-confirm" className="btn-primary" type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </form>
      )}

      {loading ? (
        <div className="spinner" />
      ) : playlists.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎵</div>
          <h3>No playlists yet</h3>
          <p>Create your first playlist to get started</p>
        </div>
      ) : (
        <div className="songs-grid">
          {playlists.map((pl) => (
            <PlaylistCard key={pl._id} playlist={pl} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;
