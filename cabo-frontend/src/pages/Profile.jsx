import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import { User, Mail, Phone, Save } from 'lucide-react';

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

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', fontSize: '2rem', fontWeight: 800, color: 'white'
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
            {user.role === 'ADMIN' && (
              <span style={{ display: 'inline-block', marginTop: 8, background: 'var(--accent-primary)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                ADMIN
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><User size={14} style={{ verticalAlign: 'middle' }} /> Full Name</label>
              <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label><Mail size={14} style={{ verticalAlign: 'middle' }} /> Email</label>
              <input type="email" className="form-input" value={user.email} disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <small style={{ color: 'var(--text-muted)' }}>Email cannot be changed</small>
            </div>

            <div className="form-group">
              <label><Phone size={14} style={{ verticalAlign: 'middle' }} /> Phone Number</label>
              <input type="tel" className="form-input" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 9876543210" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
