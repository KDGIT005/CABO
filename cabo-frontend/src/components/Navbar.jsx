import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  Car, Search, PlusCircle, LayoutDashboard, User,
  Shield, LogOut, Menu, X, Home
} from 'lucide-react';

const AUTH_ROUTES = ['/login', '/register'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  // ALL hooks must be called unconditionally — no early returns before this point
  useEffect(() => {
    if (!user || isAuthPage) return;
    api.getNotifications()
      .then(data => setUnreadCount(data.unreadCount))
      .catch(() => {});
    const interval = setInterval(() => {
      api.getNotifications()
        .then(data => setUnreadCount(data.unreadCount))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user, isAuthPage]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  // Hide navbar on auth pages AFTER all hooks have been called
  if (isAuthPage) return null;

  return (
    <>
      {/* ── Top minimal bar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <Car size={20} />
            Cabo
          </Link>

          {/* Desktop links */}
          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <Link to="/rides" className={isActive('/rides')} onClick={() => setMenuOpen(false)}>
              <Search size={15} /> Find Rides
            </Link>

            {user ? (
              <>
                <Link to="/rides/create" className={isActive('/rides/create')} onClick={() => setMenuOpen(false)}>
                  <PlusCircle size={15} /> Create Ride
                </Link>
                <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                  <LayoutDashboard size={15} /> Dashboard
                  {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
                </Link>
                <Link to="/profile" className={isActive('/profile')} onClick={() => setMenuOpen(false)}>
                  <User size={15} /> Profile
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className={isActive('/admin')} onClick={() => setMenuOpen(false)}>
                    <Shield size={15} /> Admin
                  </Link>
                )}
                <button onClick={handleLogout}>
                  <LogOut size={15} /> Logout
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

          {/* Mobile hamburger */}
          <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Floating Bottom Dock ── */}
      <div className="bottom-dock">
        <Link to="/" className={`dock-item ${isActive('/')}`} title="Home">
          <Home size={18} />
          <span>Home</span>
        </Link>

        <Link to="/rides" className={`dock-item ${isActive('/rides')}`} title="Find Rides">
          <Search size={18} />
          <span>Rides</span>
        </Link>

        {user ? (
          <>
            <div className="dock-divider" />
            <Link to="/rides/create" className={`dock-item ${isActive('/rides/create')}`} title="Create Ride">
              <PlusCircle size={18} />
              <span>Post</span>
            </Link>

            <Link to="/dashboard" className={`dock-item ${isActive('/dashboard')}`} title="Dashboard">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
              {unreadCount > 0 && <span className="dock-badge">{unreadCount}</span>}
            </Link>

            <Link to="/profile" className={`dock-item ${isActive('/profile')}`} title="Profile">
              <User size={18} />
              <span>Profile</span>
            </Link>

            {user.role === 'ADMIN' && (
              <Link to="/admin" className={`dock-item ${isActive('/admin')}`} title="Admin">
                <Shield size={18} />
                <span>Admin</span>
              </Link>
            )}

            <div className="dock-divider" />

            <button className="dock-item" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <div className="dock-divider" />
            <Link to="/login" className={`dock-item ${isActive('/login')}`} title="Login">
              <User size={18} />
              <span>Login</span>
            </Link>
            <Link to="/register" className={`dock-item ${isActive('/register')}`} title="Sign Up">
              <PlusCircle size={18} />
              <span>Sign Up</span>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
