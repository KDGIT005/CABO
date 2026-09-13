import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import { PlusCircle, MapPin, Calendar, Clock, Users, Car, Hash, Phone, FileText, IndianRupee } from 'lucide-react';

export default function CreateRide() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fromLocation: '', toLocation: '', date: '', time: '',
    carModel: '', carType: 'SEDAN', carNumber: '',
    seatsAvailable: 3, totalPrice: '', phoneNumber: user?.phone || '', notes: ''
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.createRide({
        ...form,
        seatsAvailable: parseInt(form.seatsAvailable),
        totalPrice: parseFloat(form.totalPrice) || 0
      });
      addToast('Ride created successfully! 🚗', 'success');
      navigate(`/rides/${data.ride.id}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const pricePerPerson = form.totalPrice > 0 && form.seatsAvailable > 0
    ? Math.round(parseFloat(form.totalPrice) / (parseInt(form.seatsAvailable) + 1))
    : null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 660 }}>

        <div className="page-header">
          <h1 className="page-title">Post a Ride</h1>
          <p className="page-subtitle">Share your trip details and find co-travelers</p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <form onSubmit={handleSubmit}>

            {/* Route section */}
            <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
              <div className="eyebrow" style={{ marginBottom: 20 }}>Route Details</div>
              <div className="form-group">
                <label><MapPin size={12} /> From Location</label>
                <input type="text" name="fromLocation" className="form-input"
                  placeholder="e.g., LNCT Bhopal"
                  value={form.fromLocation} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label><MapPin size={12} /> To Location</label>
                <input type="text" name="toLocation" className="form-input"
                  placeholder="e.g., Indore"
                  value={form.toLocation} onChange={handleChange} required />
              </div>
            </div>

            {/* Date & Time */}
            <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
              <div className="eyebrow" style={{ marginBottom: 20 }}>Schedule</div>
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label><Calendar size={12} /> Date</label>
                  <input type="date" name="date" className="form-input"
                    value={form.date} onChange={handleChange} min={today} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label><Clock size={12} /> Time</label>
                  <input type="time" name="time" className="form-input"
                    value={form.time} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Car details */}
            <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
              <div className="eyebrow" style={{ marginBottom: 20 }}>Car Details</div>
              <div className="grid-2">
                <div className="form-group">
                  <label><Car size={12} /> Car Model</label>
                  <input type="text" name="carModel" className="form-input"
                    placeholder="e.g., Swift"
                    value={form.carModel} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label><Car size={12} /> Car Type</label>
                  <select name="carType" className="form-input" value={form.carType} onChange={handleChange} required>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label><Hash size={12} /> Car Number</label>
                  <input type="text" name="carNumber" className="form-input"
                    placeholder="e.g., MP04AB1234"
                    value={form.carNumber} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label><Users size={12} /> Available Seats</label>
                  <input type="number" name="seatsAvailable" className="form-input"
                    min="1" max="10"
                    value={form.seatsAvailable} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Pricing & contact */}
            <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
              <div className="eyebrow" style={{ marginBottom: 20 }}>Pricing & Contact</div>
              <div className="form-group">
                <label><IndianRupee size={12} /> Total Cab Price (₹)</label>
                <input type="number" name="totalPrice" className="form-input"
                  placeholder="e.g., 2000" min="0"
                  value={form.totalPrice} onChange={handleChange} required />
                {pricePerPerson && (
                  <small style={{ color: 'var(--accent-teal)', fontWeight: 700, fontSize: '0.83rem', marginTop: 4 }}>
                    ≈ ₹{pricePerPerson}/person · {parseInt(form.seatsAvailable) + 1} seats incl. you
                  </small>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label><Phone size={12} /> Phone Number</label>
                <input type="tel" name="phoneNumber" className="form-input"
                  placeholder="+91 9876543210"
                  value={form.phoneNumber} onChange={handleChange} />
              </div>
            </div>

            {/* Notes */}
            <div style={{ padding: '28px 32px' }}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label><FileText size={12} /> Notes (optional)</label>
                <textarea name="notes" className="form-input"
                  placeholder="Meeting point, luggage space, any other details…"
                  value={form.notes} onChange={handleChange} rows={3} />
              </div>
              <button type="submit" className="btn btn-primary btn-lg"
                style={{ width: '100%' }} disabled={loading}>
                <PlusCircle size={18} /> {loading ? 'Creating…' : 'Post Ride'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
