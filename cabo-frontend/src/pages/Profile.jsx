import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import { Mail, Phone, Save, Shield } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setName(user.name || '');
    setPhone(user.phone || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.updateProfile({ name, phone });
      updateUser(data.user);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initials = user.name?.charAt(0).toUpperCase() || '?';
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>

        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Avatar header */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{initials}</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>{user.name}</div>
            <div className="profile-meta">Member since {memberSince}</div>
            {user.role === 'ADMIN' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10,
                background: 'var(--text-primary)', color: 'white',
                padding: '4px 14px', borderRadius: 'var(--r-pill)',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em'
              }}>
                <Shield size={11} /> ADMIN
              </span>
            )}
          </div>

          {/* Form */}
          <div style={{ padding: '28px 32px' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label><Mail size={12} /> Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={user.email}
                  disabled
                  style={{ opacity: 0.45, cursor: 'not-allowed' }}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label><Phone size={12} /> Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                <Save size={16} /> {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
