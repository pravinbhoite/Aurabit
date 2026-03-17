import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  // Track whether the user has interacted with each password field yet
  const [touched, setTouched] = useState({ password: false, confirm: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.trim() !== form.confirm.trim()) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast.success('Account created! Welcome to AuraBeat 🎵');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  // Derived validation flags (real-time)
  const passwordTooShort = form.password.trim().length > 0 && form.password.trim().length < 6;
  const passwordsMismatch =
    form.confirm.trim().length > 0 && form.password.trim() !== form.confirm.trim();

  const isSubmitDisabled =
    loading ||
    form.password.trim().length < 6 ||
    form.password.trim() !== form.confirm.trim();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Logo layout="vertical" size="lg" />
        <div className="auth-tagline">Join millions of music lovers.</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              id="reg-name"
              className="form-input"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* ── Password ────────────────────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="reg-password"
              className={`form-input${touched.password && passwordTooShort ? ' input-error' : ''}`}
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              required
            />
            {touched.password && passwordTooShort && (
              <span className="field-error">Password must be at least 6 characters</span>
            )}
          </div>

          {/* ── Confirm Password ─────────────────────────────────────── */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              id="reg-confirm"
              className={`form-input${touched.confirm && passwordsMismatch ? ' input-error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              required
            />
            {touched.confirm && passwordsMismatch && (
              <span className="field-error">Passwords do not match</span>
            )}
          </div>

          <button
            id="reg-submit"
            className="btn-primary"
            type="submit"
            disabled={isSubmitDisabled}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
