import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Search, Users, MessageCircle, ArrowRight, Shield } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>
            College Rides,<br />
            <span>Made Easy</span>
          </h1>
          <p>
            CABO connects students heading the same way. Post your ride or find one,
            share the journey, and travel together safely.
          </p>
          <div className="hero-actions">
            <Link to="/rides" className="btn btn-primary btn-lg">
              <Search size={20} /> Find a Ride
            </Link>
            <Link to={user ? "/rides/create" : "/register"} className="btn btn-outline btn-lg">
              <Car size={20} /> {user ? "Create a Ride" : "Get Started"}
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How <span style={{ color: 'var(--accent-primary)' }}>CABO</span> Works</h2>
          <div className="steps-grid">
            <div className="card step-card">
              <div className="step-icon"><Car size={28} /></div>
              <h3>Post Your Ride</h3>
              <p>Going somewhere? Share your trip details — destination, date, car info — and let others join you.</p>
            </div>
            <div className="card step-card">
              <div className="step-icon"><Users size={28} /></div>
              <h3>Find Co-Travelers</h3>
              <p>Search rides by route and date. Find students heading your way and join their ride instantly.</p>
            </div>
            <div className="card step-card">
              <div className="step-icon"><MessageCircle size={28} /></div>
              <h3>Chat & Coordinate</h3>
              <p>Use the built-in chat to coordinate pickup points, timings, and travel plans with your ride group.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="grid-3" style={{ gap: 24 }}>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🚗</div>
              <h4 style={{ marginBottom: 4 }}>Car Details</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                See car model, type, and number before joining a ride.
              </p>
            </div>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📞</div>
              <h4 style={{ marginBottom: 4 }}>Direct Contact</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Call the driver using the displayed phone number for verification.
              </p>
            </div>
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🛡️</div>
              <h4 style={{ marginBottom: 4 }}>Safe & Reported</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Report fake rides. Admins review reports and take action.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <div className="card" style={{ padding: '60px 40px', background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(168,85,247,0.1))', border: '1px solid rgba(108,92,231,0.3)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
              Ready for Your Next Ride?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 28px', fontSize: '1.05rem' }}>
              Join CABO and connect with fellow students for your next journey.
            </p>
            <Link to={user ? "/rides" : "/register"} className="btn btn-primary btn-lg">
              {user ? "Browse Rides" : "Sign Up Free"} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px 0', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} CABO — College Ride Sharing Platform. Share rides, travel together.
          </p>
        </div>
      </footer>
    </div>
  );
}
