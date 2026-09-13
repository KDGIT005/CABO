import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Search, Users, MessageCircle, ArrowRight, Phone, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-deco" />
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <Zap size={12} />
                College Ride Sharing · India
              </div>

              <h1>
                College Rides,<br />
                <span className="hero-accent">Made Easy.</span>
              </h1>

              <p className="hero-sub">
                CABO connects students heading the same way. Post your ride or
                find one, share the journey, travel together safely.
              </p>

              <div className="hero-actions">
                <Link to="/rides" className="btn btn-primary btn-xl">
                  <Search size={18} /> Find a Ride
                </Link>
                <Link
                  to={user ? '/rides/create' : '/register'}
                  className="btn btn-outline btn-xl"
                >
                  {user ? 'Post a Ride' : 'Get Started'} <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="hero-media">
              <div className="hero-image-card">
                <img
                  src="/hero-cab.jpg"
                  alt="Cabo Campus Cab Ride"
                  className="hero-image"
                />
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="hero-stats">
            <div>
              <div className="hero-stat-value">500+</div>
              <div className="hero-stat-label">Rides Posted</div>
            </div>
            <div>
              <div className="hero-stat-value">1200+</div>
              <div className="hero-stat-label">Students Joined</div>
            </div>
            <div>
              <div className="hero-stat-value">40+</div>
              <div className="hero-stat-label">Routes Active</div>
            </div>
            <div>
              <div className="hero-stat-value">4.8★</div>
              <div className="hero-stat-label">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">How it works</span>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><Car size={20} /></div>
              <h3>Post Your Ride</h3>
              <p>Going somewhere? Share trip details — destination, date, car info — and let others join you.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><Users size={20} /></div>
              <h3>Find Co-Travelers</h3>
              <p>Search rides by route and date. Find students heading your way and join instantly.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><MessageCircle size={20} /></div>
              <h3>Chat & Coordinate</h3>
              <p>Use built-in chat to coordinate pickup points, timings, and travel plans with your group.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MINI FEATURES ── */}
      <section>
        <div className="container">
          <div className="mini-features">
            <div className="mini-feature-card">
              <div className="mini-feature-icon"><Car size={20} /></div>
              <h4>Car Details</h4>
              <p>See car model, type, and plate number before joining any ride.</p>
            </div>
            <div className="mini-feature-card">
              <div className="mini-feature-icon"><Phone size={20} /></div>
              <h4>Direct Contact</h4>
              <p>Call the driver directly — phone number shared for quick coordination.</p>
            </div>
            <div className="mini-feature-card">
              <div className="mini-feature-icon"><ShieldCheck size={20} /></div>
              <h4>Safe & Reported</h4>
              <p>Report suspicious rides. Admins review reports and take action fast.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 0 0' }}>
        <div className="container">
          <div className="card cta-banner">
            <h2>Ready for Your Next Ride?</h2>
            <p>Join CABO and connect with fellow students for your next journey.</p>
            <Link to={user ? '/rides' : '/register'} className="btn btn-primary btn-xl">
              {user ? 'Browse Rides' : 'Sign Up Free'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer" style={{ marginTop: 80 }}>
        <div className="container">
          <p>© {new Date().getFullYear()} CABO — College Ride Sharing Platform. Share rides, travel together.</p>
        </div>
      </footer>
    </div>
  );
}
