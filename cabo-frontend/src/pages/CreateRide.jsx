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

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <h1 className="page-title">Create a Ride</h1>
          <p className="page-subtitle">Post your trip and find co-travelers</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><MapPin size={14} style={{ verticalAlign: 'middle' }} /> From Location</label>
              <input type="text" name="fromLocation" className="form-input" placeholder="e.g., LNCT Bhopal"
                value={form.fromLocation} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label><MapPin size={14} style={{ verticalAlign: 'middle' }} /> To Location</label>
              <input type="text" name="toLocation" className="form-input" placeholder="e.g., Indore"
                value={form.toLocation} onChange={handleChange} required />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label><Calendar size={14} style={{ verticalAlign: 'middle' }} /> Date</label>
                <input type="date" name="date" className="form-input"
                  value={form.date} onChange={handleChange} min={today} required />
              </div>
              <div className="form-group">
                <label><Clock size={14} style={{ verticalAlign: 'middle' }} /> Time</label>
                <input type="time" name="time" className="form-input"
                  value={form.time} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label><Car size={14} style={{ verticalAlign: 'middle' }} /> Car Model</label>
                <input type="text" name="carModel" className="form-input" placeholder="e.g., Swift"
                  value={form.carModel} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label><Car size={14} style={{ verticalAlign: 'middle' }} /> Car Type</label>
                <select name="carType" className="form-input" value={form.carType} onChange={handleChange} required>
                  <option value="HATCHBACK">Hatchback</option>
                  <option value="SEDAN">Sedan</option>
                  <option value="SUV">SUV</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label><Hash size={14} style={{ verticalAlign: 'middle' }} /> Car Number</label>
                <input type="text" name="carNumber" className="form-input" placeholder="e.g., MP04AB1234"
                  value={form.carNumber} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label><Users size={14} style={{ verticalAlign: 'middle' }} /> Available Seats</label>
                <input type="number" name="seatsAvailable" className="form-input" min="1" max="10"
                  value={form.seatsAvailable} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label><IndianRupee size={14} style={{ verticalAlign: 'middle' }} /> Total Cab Price (₹)</label>
              <input type="number" name="totalPrice" className="form-input" placeholder="e.g., 2000" min="0"
                value={form.totalPrice} onChange={handleChange} required />
              {form.totalPrice > 0 && form.seatsAvailable > 0 && (
                <small style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
                  ≈ ₹{Math.round(parseFloat(form.totalPrice) / (parseInt(form.seatsAvailable) + 1))} per person ({parseInt(form.seatsAvailable) + 1} seats including you)
                </small>
              )}
            </div>

            <div className="form-group">
              <label><Phone size={14} style={{ verticalAlign: 'middle' }} /> Phone Number</label>
              <input type="tel" name="phoneNumber" className="form-input" placeholder="+91 9876543210"
                value={form.phoneNumber} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label><FileText size={14} style={{ verticalAlign: 'middle' }} /> Notes (optional)</label>
              <textarea name="notes" className="form-input" placeholder="Any additional details like meeting point, luggage space, etc."
                value={form.notes} onChange={handleChange} rows={3} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              <PlusCircle size={20} /> {loading ? 'Creating...' : 'Create Ride'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
