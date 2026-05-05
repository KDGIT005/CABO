import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Car, Search, PlusCircle, LayoutDashboard, User, Bell,
  Shield, LogOut, Menu, X, Home
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(data => setUnreadCount(data.unreadCount))
        .catch(() => {});
      const interval = setInterval(() => {
        api.getNotifications()
          .then(data => setUnreadCount(data.unreadCount))
          .catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" className="navbar-logo">
            <Car size={22} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
            Cabo
          </Link>
          <Link to="/" className="navbar-home" title="Home">
            <Home size={18} />
          </Link>
        </div>

        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/rides" className={isActive('/rides')} onClick={() => setMenuOpen(false)}>
            <Search size={16} /> Find Rides
          </Link>

          {user ? (
            <>
              <Link to="/rides/create" className={isActive('/rides/create')} onClick={() => setMenuOpen(false)}>
                <PlusCircle size={16} /> Create Ride
              </Link>
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={16} /> Dashboard
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </Link>
              <Link to="/profile" className={isActive('/profile')} onClick={() => setMenuOpen(false)}>
                <User size={16} /> Profile
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>
                  <Shield size={16} /> Admin
                </Link>
              )}
              <button onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`btn btn-secondary btn-sm ${isActive('/login')}`} onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
