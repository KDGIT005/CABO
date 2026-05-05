import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  Shield, Users, Car, BarChart3, Trash2, MapPin,
  ArrowRight, Calendar, AlertTriangle, Ban, AlertCircle, CheckCircle,
  XCircle, Unlock
} from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, ridesData, reportsData] = await Promise.all([
        api.adminGetUsers(),
        api.adminGetRides(),
        api.adminGetReports()
      ]);
      setUsers(usersData.users || []);
      setRides(ridesData.rides || []);
      setReports(reportsData.reports || []);
      setStats(ridesData.stats || {});
    } catch (err) {
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRide = async (rideId) => {
    if (!confirm('Cancel this ride?')) return;
    try {
      await api.adminCancelRide(rideId);
      addToast('Ride cancelled', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleWarnUser = async (userId) => {
    try {
      await api.adminWarnUser(userId);
      addToast('User warned', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleBlockUser = async (userId) => {
    if (!confirm('Block this user? They will not be able to use the platform.')) return;
    try {
      await api.adminBlockUser(userId);
      addToast('User blocked', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await api.adminUnblockUser(userId);
      addToast('User unblocked', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      await api.adminUpdateReport(reportId, status);
      addToast('Report updated', 'success');
      fetchData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const reasonLabel = (r) => {
    const map = {
      FAKE_RIDE: '🚫 Fake Ride', DRIVER_NOT_RESPONDING: '📵 Driver Not Responding',
      WRONG_INFORMATION: '❌ Wrong Info', OTHER: '📋 Other'
    };
    return map[r] || r;
  };

  if (loading) return <div className="page"><div className="container"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <Shield size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Admin Panel
          </h1>
          <p className="page-subtitle">Manage users, rides, reports, and monitor platform activity</p>
        </div>

        {/* Stats */}
        <div className="dashboard-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <div className="card stat-card">
            <div className="stat-value">{stats.totalUsers || 0}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.totalRides || 0}</div>
            <div className="stat-label">Total Rides</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.activeRides || 0}</div>
            <div className="stat-label">Active Rides</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.cancelledRides || 0}</div>
            <div className="stat-label">Cancelled</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: stats.pendingReports > 0 ? 'var(--danger)' : undefined }}>
              {stats.pendingReports || 0}
            </div>
            <div className="stat-label">Pending Reports</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
            <BarChart3 size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Overview
          </button>
          <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            <Users size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Users ({users.length})
          </button>
          <button className={`tab ${tab === 'rides' ? 'active' : ''}`} onClick={() => setTab('rides')}>
            <Car size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Rides ({rides.length})
          </button>
          <button className={`tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
            <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Reports ({reports.length})
            {(stats.pendingReports || 0) > 0 && <span className="nav-badge" style={{ marginLeft: 6 }}>{stats.pendingReports}</span>}
          </button>
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="card" style={{ padding: 32 }}>
            <h3 style={{ marginBottom: 16 }}>Platform Overview</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              CABO has <strong>{stats.totalUsers || 0}</strong> registered users
              with <strong>{stats.activeRides || 0}</strong> active rides currently available.
              {(stats.pendingReports || 0) > 0 && (
                <span style={{ color: 'var(--warning)' }}> There are <strong>{stats.pendingReports}</strong> pending reports to review.</span>
              )}
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200, padding: 20, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>User-to-Ride Ratio</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {stats.totalUsers > 0 ? (stats.totalRides / stats.totalUsers).toFixed(1) : 0}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200, padding: 20, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>Completion Rate</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {stats.totalRides > 0 ? Math.round(((stats.totalRides - stats.cancelledRides) / stats.totalRides) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {tab === 'users' && (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ opacity: u.blocked ? 0.6 : 1 }}>
                    <td>{u.id}</td>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span style={{
                        padding: '3px 8px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                        background: u.role === 'ADMIN' ? 'rgba(108,92,231,0.15)' : 'rgba(255,255,255,0.05)',
                        color: u.role === 'ADMIN' ? 'var(--accent-primary)' : 'var(--text-secondary)'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.blocked ? (
                        <span style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 600 }}>🔒 Blocked</span>
                      ) : (
                        <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>Active</span>
                      )}
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      {u.role !== 'ADMIN' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleWarnUser(u.id)} title="Warn User">
                            <AlertCircle size={14} />
                          </button>
                          {u.blocked ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleUnblockUser(u.id)} title="Unblock User" style={{ color: 'var(--success)' }}>
                              <Unlock size={14} />
                            </button>
                          ) : (
                            <button className="btn btn-danger btn-sm" onClick={() => handleBlockUser(u.id)} title="Block User">
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rides Table */}
        {tab === 'rides' && (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Route</th>
                  <th>Driver</th>
                  <th>Date</th>
                  <th>Car</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rides.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {r.fromLocation} <ArrowRight size={12} /> {r.toLocation}
                      </div>
                    </td>
                    <td>{r.driver?.name}</td>
                    <td>{formatDate(r.date)}</td>
                    <td>{r.carModel} ({r.carType})</td>
                    <td>{r.totalSeats - r.seatsAvailable} / {r.totalSeats}</td>
                    <td>
                      <span className={`ride-status ${r.status?.toLowerCase()}`}>{r.status}</span>
                    </td>
                    <td>
                      {r.status === 'ACTIVE' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelRide(r.id)}>
                          <Trash2 size={14} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reports Table */}
        {tab === 'reports' && (
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            {reports.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <AlertTriangle size={40} />
                <h3>No reports yet</h3>
                <p>Reports from users will appear here</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ride Route</th>
                    <th>Ride Driver</th>
                    <th>Reported By</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id} style={{ background: r.status === 'PENDING' ? 'rgba(253,203,110,0.05)' : undefined }}>
                      <td>{r.id}</td>
                      <td style={{ fontWeight: 500 }}>{r.rideRoute}</td>
                      <td>{r.rideDriver?.name}</td>
                      <td>{r.reportedBy?.name}</td>
                      <td>{reasonLabel(r.reason)}</td>
                      <td>
                        <span className={`ride-status ${r.status === 'PENDING' ? 'active' : r.status === 'REVIEWED' ? 'completed' : 'cancelled'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{formatDate(r.createdAt)}</td>
                      <td>
                        {r.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateReport(r.id, 'REVIEWED')} title="Mark Reviewed" style={{ color: 'var(--success)' }}>
                              <CheckCircle size={14} />
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateReport(r.id, 'DISMISSED')} title="Dismiss" style={{ color: 'var(--text-muted)' }}>
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
