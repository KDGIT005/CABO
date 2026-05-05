import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Search, MapPin, Calendar, Users, ArrowRight, Car, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Rides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Generate date chips (today + next 7 days)
  const getDateChips = () => {
    const chips = [];
    const today = new Date();
    for (let i = 0; i < 8; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      chips.push({
        value: d.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        weekday: d.toLocaleDateString('en-IN', { weekday: 'short' })
      });
    }
    return chips;
  };

  const dateChips = getDateChips();

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params = {};
      if (fromLocation) params.fromLocation = fromLocation;
      if (toLocation) params.toLocation = toLocation;
      if (selectedDate) params.date = selectedDate;
      const data = await api.listRides(params);
      setRides(data.rides || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, [selectedDate]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const carTypeLabel = (type) => {
    const map = { HATCHBACK: '🚗 Hatchback', SEDAN: '🚙 Sedan', SUV: '🚐 SUV' };
    return map[type] || type;
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Find a Ride</h1>
          <p className="page-subtitle">Search available rides and join one that fits your route</p>
        </div>

        <form onSubmit={handleSearch} className="search-bar">
          <input type="text" className="form-input" placeholder="🔍 From location"
            value={fromLocation} onChange={e => setFromLocation(e.target.value)} />
          <input type="text" className="form-input" placeholder="📍 To location"
            value={toLocation} onChange={e => setToLocation(e.target.value)} />
          <button type="submit" className="btn btn-primary">
            <Search size={18} /> Search
          </button>
        </form>

        {/* Date Filter Chips (IRCTC style) */}
        <div className="date-filter">
          <button
            className={`date-chip ${selectedDate === '' ? 'active' : ''}`}
            onClick={() => setSelectedDate('')}
          >
            <span className="date-chip-label">All</span>
            <span className="date-chip-weekday">Dates</span>
          </button>
          {dateChips.map(chip => (
            <button
              key={chip.value}
              className={`date-chip ${selectedDate === chip.value ? 'active' : ''}`}
              onClick={() => setSelectedDate(chip.value)}
            >
              <span className="date-chip-label">{chip.label}</span>
              <span className="date-chip-weekday">{chip.weekday}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : rides.length === 0 ? (
          <div className="empty-state">
            <Search size={48} />
            <h3>No rides found</h3>
            <p>Try a different search, or <Link to="/rides/create">create a ride</Link>.</p>
          </div>
        ) : (
          <div className="grid-2">
            {rides.map(ride => (
              <Link to={`/rides/${ride.id}`} key={ride.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card ride-card">
                  <div className="ride-card-header">
                    <div className="ride-route">
                      <MapPin size={16} />
                      {ride.fromLocation}
                      <ArrowRight size={16} className="ride-route-arrow" />
                      {ride.toLocation}
                    </div>
                    <span className={`ride-status ${ride.status?.toLowerCase()}`}>{ride.status}</span>
                  </div>
                  <div className="ride-card-body">
                    <div className="ride-info-item">
                      <Calendar size={14} />
                      <span>{formatDate(ride.date)}</span>
                    </div>
                    <div className="ride-info-item">
                      <Users size={14} />
                      <span>{ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? 's' : ''} left</span>
                    </div>
                    <div className="ride-info-item">
                      <Car size={14} />
                      <span>{ride.carModel} · {carTypeLabel(ride.carType)}</span>
                    </div>
                    {ride.driver && (
                      <div className="ride-info-item" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        by {ride.driver.name}
                      </div>
                    )}
                  </div>
                  <div className="ride-card-footer">
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span>🕐 {formatTime(ride.time)}</span>
                      {ride.pricePerSeat > 0 && (
                        <span style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>₹{Math.round(ride.pricePerSeat)}/person</span>
                      )}
                    </div>
                    <span className="btn btn-primary btn-sm">View Details</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
