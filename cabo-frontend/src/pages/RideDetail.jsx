import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import {
  MapPin, Calendar, Clock, Users, ArrowRight, UserPlus,
  LogOut, Send, MessageCircle, Trash2, Car, Hash, Phone,
  AlertTriangle, X
} from 'lucide-react';

export default function RideDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const chatRef = useRef(null);
  const pollRef = useRef(null);
  const lastMsgIdRef = useRef(0);

  const isParticipant = user && participants.some(p => p.id === user.id);
  const isCreator = user && ride && ride.driver?.id === user.id;

  const fetchRide = async () => {
    try {
      const data = await api.getRide(id);
      setRide(data);
      setParticipants(data.participants || []);
    } catch (err) {
      addToast('Ride not found', 'error');
      navigate('/rides');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const data = await api.getMessages(id, lastMsgIdRef.current);
      if (data.messages && data.messages.length > 0) {
        lastMsgIdRef.current = data.messages[data.messages.length - 1].id;
        setMessages(prev => {
          const newMessages = data.messages.filter(m => !prev.some(p => p.id === m.id));
          return [...prev, ...newMessages];
        });
        setTimeout(() => {
          chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
        }, 50);
      }
    } catch (err) {
      // User might not be a participant
    }
  };

  useEffect(() => {
    fetchRide();
  }, [id]);

  useEffect(() => {
    if (isParticipant) {
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, 3000);
      return () => clearInterval(pollRef.current);
    }
  }, [isParticipant, id]);

  const handleJoin = async () => {
    try {
      await api.joinRide(id);
      addToast('Joined ride! 🎉', 'success');
      fetchRide();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleLeave = async () => {
    try {
      await api.leaveRide(id);
      addToast('Left the ride', 'info');
      fetchRide();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await api.cancelRide(id);
      addToast('Ride cancelled', 'info');
      fetchRide();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      await api.sendMessage(id, newMsg.trim());
      setNewMsg('');
      fetchMessages();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      addToast('Please select a reason', 'error');
      return;
    }
    try {
      await api.reportRide(id, reportReason);
      addToast('Ride reported successfully', 'success');
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  };

  const formatMsgTime = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const carTypeLabel = (type) => {
    const map = { HATCHBACK: '🚗 Hatchback', SEDAN: '🚙 Sedan', SUV: '🚐 SUV' };
    return map[type] || type;
  };

  if (loading) return <div className="page"><div className="container"><div className="loading-spinner"><div className="spinner"></div></div></div></div>;
  if (!ride) return null;

  return (
    <div className="page">
      <div className="container">
        <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
          {/* Left Column */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="ride-card-header" style={{ border: 'none', padding: 0, marginBottom: 20 }}>
                <div className="ride-route" style={{ fontSize: '1.3rem' }}>
                  <MapPin size={20} />
                  {ride.fromLocation}
                  <ArrowRight size={20} className="ride-route-arrow" />
                  {ride.toLocation}
                </div>
                <span className={`ride-status ${ride.status?.toLowerCase()}`}>{ride.status}</span>
              </div>

              <div className="grid-2" style={{ gap: 16, marginBottom: 20 }}>
                <div className="ride-info-item">
                  <Calendar size={16} />
                  <span>{formatDate(ride.date)}</span>
                </div>
                <div className="ride-info-item">
                  <Clock size={16} />
                  <span>{formatTime(ride.time)}</span>
                </div>
                <div className="ride-info-item">
                  <Users size={16} />
                  <span>{ride.seatsAvailable} of {ride.totalSeats} seats available</span>
                </div>
                <div className="ride-info-item">
                  <Car size={16} />
                  <span>{ride.carModel} · {carTypeLabel(ride.carType)}</span>
                </div>
                <div className="ride-info-item">
                  <Hash size={16} />
                  <span>{ride.carNumber}</span>
                </div>
                <div className="ride-info-item">
                  <Phone size={16} />
                  <span>{ride.phoneNumber || ride.driver?.phone || 'N/A'}</span>
                </div>
              </div>

              {/* Price Section */}
              {ride.totalPrice > 0 && (
                <div style={{
                  padding: '16px', background: 'linear-gradient(135deg, rgba(0,206,201,0.1), rgba(108,92,231,0.08))',
                  borderRadius: 'var(--radius-md)', marginBottom: 16, border: '1px solid rgba(0,206,201,0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Total Cab Fare</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>₹{Math.round(ride.totalPrice)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>Per Person</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>₹{Math.round(ride.pricePerSeat)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                    Split among {ride.totalSeats} seats (including creator)
                  </div>
                </div>
              )}

              {ride.driver && (
                <div style={{
                  padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)',
                  marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <div className="participant-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                    {ride.driver.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{ride.driver.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ride Creator</div>
                  </div>
                </div>
              )}

              {ride.notes && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20, padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                  📝 {ride.notes}
                </p>
              )}

              {/* Action Buttons */}
              {user && ride.status === 'ACTIVE' && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {!isParticipant && ride.seatsAvailable > 0 && (
                    <button className="btn btn-primary" onClick={handleJoin}>
                      <UserPlus size={18} /> Join Ride
                    </button>
                  )}
                  {isParticipant && !isCreator && (
                    <button className="btn btn-secondary" onClick={handleLeave}>
                      <LogOut size={18} /> Leave Ride
                    </button>
                  )}
                  {isCreator && (
                    <button className="btn btn-danger" onClick={handleCancel}>
                      <Trash2 size={18} /> Cancel Ride
                    </button>
                  )}
                  {!isCreator && (
                    <button className="btn btn-secondary" onClick={() => setShowReportModal(true)}
                      style={{ color: 'var(--warning)' }}>
                      <AlertTriangle size={18} /> Report Ride
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>
                <Users size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Participants ({participants.length})
              </h3>
              {participants.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No participants yet</p>
              ) : (
                <div className="participants-list">
                  {participants.map(p => (
                    <div key={p.id} className="participant-badge">
                      <div className="participant-avatar">
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      {p.name}
                      {ride.driver?.id === p.id && (
                        <span style={{ fontSize: '0.7rem', background: 'var(--accent-primary)', padding: '2px 6px', borderRadius: 20, color: 'white' }}>
                          Creator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageCircle size={18} /> Ride Chat
              </h3>
            </div>

            {isParticipant ? (
              <div className="chat-container" style={{ borderRadius: 0, border: 'none' }}>
                <div className="chat-messages" ref={chatRef}>
                  {messages.length === 0 && (
                    <div className="empty-state" style={{ padding: 20 }}>
                      <p>No messages yet. Say hi! 👋</p>
                    </div>
                  )}
                  {messages.map(msg => (
                    <div key={msg.id} className={`chat-message ${msg.senderId === user.id ? 'own' : 'other'}`}>
                      <div className="chat-message-name">{msg.senderName}</div>
                      {msg.content}
                      <div className="chat-message-time">{formatMsgTime(msg.timestamp)}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="chat-input-area">
                  <input type="text" className="form-input" placeholder="Type a message..."
                    value={newMsg} onChange={e => setNewMsg(e.target.value)} />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={!newMsg.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <MessageCircle size={32} />
                <h3>Join to chat</h3>
                <p>Join this ride to access the group chat</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} color="var(--warning)" /> Report Ride
              </h3>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
              Select a reason for reporting this ride:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'FAKE_RIDE', label: '🚫 Fake Ride', desc: 'This ride does not exist or is misleading' },
                { value: 'DRIVER_NOT_RESPONDING', label: '📵 Driver Not Responding', desc: 'Unable to contact the driver' },
                { value: 'WRONG_INFORMATION', label: '❌ Wrong Information', desc: 'Incorrect details about the ride' },
                { value: 'OTHER', label: '📋 Other', desc: 'Another issue not listed above' },
              ].map(r => (
                <label key={r.value} className={`report-option ${reportReason === r.value ? 'selected' : ''}`}>
                  <input type="radio" name="reason" value={r.value}
                    checked={reportReason === r.value}
                    onChange={() => setReportReason(r.value)}
                    style={{ display: 'none' }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            <button className="btn btn-danger" style={{ width: '100%', marginTop: 20 }} onClick={handleReport} disabled={!reportReason}>
              <AlertTriangle size={16} /> Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
