import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('aurabeat_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('aurabeat_token'));
  const [loading, setLoading] = useState(false);
  // Set of liked song IDs for fast O(1) isLiked lookups in SongCard
  const [likedIds, setLikedIds] = useState(new Set());

  // Populate likedIds from backend whenever the user is logged in
  const fetchLikedIds = useCallback(async () => {
    try {
      const { data } = await api.get('/users/liked-songs');
      setLikedIds(new Set(data.map((s) => s._id)));
    } catch {
      setLikedIds(new Set());
    }
  }, []);

  useEffect(() => {
    if (user && token) fetchLikedIds();
    else setLikedIds(new Set());
  }, [user, token, fetchLikedIds]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      setToken(data.token);
      localStorage.setItem('aurabeat_token', data.token);
      localStorage.setItem('aurabeat_user', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setUser(data);
      setToken(data.token);
      localStorage.setItem('aurabeat_token', data.token);
      localStorage.setItem('aurabeat_user', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setLikedIds(new Set());
    localStorage.removeItem('aurabeat_token');
    localStorage.removeItem('aurabeat_user');
  };

  // Toggle like for a song; optimistically updates local state, returns new liked boolean
  const toggleLike = async (songId) => {
    try {
      const { data } = await api.put(`/songs/${songId}/like`);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (data.liked) next.add(songId);
        else next.delete(songId);
        return next;
      });
      return data.liked;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, likedIds, login, register, logout, toggleLike }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
