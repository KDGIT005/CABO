import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  LayoutDashboard, Car, Users, Bell, MapPin, ArrowRight,
  Calendar, Clock, CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('created');
  const [createdRides, setCreatedRides] = useState([]);
  const [joinedRides, setJoinedRides] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ridesData, notifData] = await Promise.all([
        api.myRides(),
        api.getNotifications()
      ]);
      setCreatedRides(ridesData.createdRides || []);
      setJoinedRides(ridesData.joinedRides || []);
      setNotifications(notifData.notifications || []);
      setUnreadCount(notifData.unreadCount || 0);
    } catch (err) {
      addToast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async () => {
    try {
      await api.markNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast('Notifications cleared', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const formatNotifDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
      ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const RideList = ({ rides, emptyText }) => (
    rides.length === 0 ? (
      <div className="empty-state">
        <Car size={40} />
        <h3>{emptyText}</h3>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rides.map(ride => (
          <Link to={`/rides/${ride.id}`} key={ride.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="ride-route" style={{ marginBottom: 4 }}>
                  <MapPin size={14} />
                  {ride.fromLocation}
                  <ArrowRight size={14} className="ride-route-arrow" />
                  {ride.toLocation}
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span><Calendar size={12} /> {formatDate(ride.date)}</span>
                  <span><Clock size={12} /> {formatTime(ride.time)}</span>
                  <span><Users size={12} /> {ride.participantCount || 0} riders</span>
                  {ride.pricePerSeat > 0 && (
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>₹{Math.round(ride.pricePerSeat)}/person</span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`ride-status ${ride.status?.toLowerCase()}`}>{ride.status}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{ride.carModel}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  );

  if (loading) return <div className="page"><div className="container"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <LayoutDashboard size={28} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Dashboard
          </h1>
          <p className="page-subtitle">Manage your rides and notifications</p>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="card stat-card">
            <div className="stat-value">{createdRides.length}</div>
            <div className="stat-label">Rides Created</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{joinedRides.length}</div>
            <div className="stat-label">Rides Joined</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">
              {createdRides.filter(r => r.status === 'ACTIVE').length + joinedRides.filter(r => r.status === 'ACTIVE').length}
            </div>
            <div className="stat-label">Upcoming</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{unreadCount}</div>
            <div className="stat-label">Unread Notifications</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'created' ? 'active' : ''}`} onClick={() => setTab('created')}>
            <Car size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> My Rides
          </button>
          <button className={`tab ${tab === 'joined' ? 'active' : ''}`} onClick={() => setTab('joined')}>
            <Users size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Joined Rides
          </button>
          <button className={`tab ${tab === 'notifications' ? 'active' : ''}`} onClick={() => setTab('notifications')}>
            <Bell size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Notifications
            {unreadCount > 0 && <span className="nav-badge" style={{ marginLeft: 6 }}>{unreadCount}</span>}
          </button>
        </div>

        {/* Content */}
        {tab === 'created' && <RideList rides={createdRides} emptyText="No rides created yet" />}
        {tab === 'joined' && <RideList rides={joinedRides} emptyText="No rides joined yet" />}
        {tab === 'notifications' && (
          <div>
            {unreadCount > 0 && (
              <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <button className="btn btn-secondary btn-sm" onClick={handleMarkRead}>
                  <CheckCircle size={14} /> Mark All as Read
                </button>
              </div>
            )}
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={40} />
                <h3>No notifications</h3>
              </div>
            ) : (
              <div className="card" style={{ padding: 0 }}>
                {notifications.map(n => (
                  <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
                    <div className={`notification-dot ${n.read ? 'read' : ''}`}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>{n.message}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatNotifDate(n.createdAt)}
                      </p>
                    </div>
                    {n.rideId > 0 && (
                      <Link to={`/rides/${n.rideId}`} className="btn btn-secondary btn-sm">View</Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
