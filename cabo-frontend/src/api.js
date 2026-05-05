const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

function getToken() {
  return localStorage.getItem('cabo_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

export const api = {
  // Auth
  syncUser: (body) => fetch(`${API_URL}/auth/sync`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getMe: () => fetch(`${API_URL}/auth/me`, { headers: authHeaders() }).then(handleResponse),
  updateProfile: (body) => fetch(`${API_URL}/auth/profile`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) }).then(handleResponse),

  // Rides
  listRides: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/rides${qs ? '?' + qs : ''}`, { headers: authHeaders() }).then(handleResponse);
  },
  createRide: (body) => fetch(`${API_URL}/rides`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  getRide: (id) => fetch(`${API_URL}/rides/${id}`, { headers: authHeaders() }).then(handleResponse),
  cancelRide: (id) => fetch(`${API_URL}/rides/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  joinRide: (id) => fetch(`${API_URL}/rides/${id}/join`, { method: 'POST', headers: authHeaders() }).then(handleResponse),
  leaveRide: (id) => fetch(`${API_URL}/rides/${id}/leave`, { method: 'POST', headers: authHeaders() }).then(handleResponse),
  myRides: () => fetch(`${API_URL}/rides/my`, { headers: authHeaders() }).then(handleResponse),

  // Report
  reportRide: (rideId, reason) => fetch(`${API_URL}/rides/${rideId}/report`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ reason }) }).then(handleResponse),

  // Messages
  getMessages: (rideId, after = 0) => fetch(`${API_URL}/rides/${rideId}/messages?after=${after}`, { headers: authHeaders() }).then(handleResponse),
  sendMessage: (rideId, content) => fetch(`${API_URL}/rides/${rideId}/messages`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ content }) }).then(handleResponse),

  // Notifications
  getNotifications: () => fetch(`${API_URL}/notifications`, { headers: authHeaders() }).then(handleResponse),
  markNotificationsRead: () => fetch(`${API_URL}/notifications/read`, { method: 'PUT', headers: authHeaders() }).then(handleResponse),

  // Admin
  adminGetUsers: () => fetch(`${API_URL}/admin/users`, { headers: authHeaders() }).then(handleResponse),
  adminGetRides: () => fetch(`${API_URL}/admin/rides`, { headers: authHeaders() }).then(handleResponse),
  adminCancelRide: (id) => fetch(`${API_URL}/admin/rides/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),
  adminGetReports: () => fetch(`${API_URL}/admin/reports`, { headers: authHeaders() }).then(handleResponse),
  adminUpdateReport: (id, status) => fetch(`${API_URL}/admin/reports/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) }).then(handleResponse),
  adminWarnUser: (id, message) => fetch(`${API_URL}/admin/users/${id}/warn`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ message }) }).then(handleResponse),
  adminBlockUser: (id) => fetch(`${API_URL}/admin/users/${id}/block`, { method: 'PUT', headers: authHeaders() }).then(handleResponse),
  adminUnblockUser: (id) => fetch(`${API_URL}/admin/users/${id}/unblock`, { method: 'PUT', headers: authHeaders() }).then(handleResponse),
};

export { getToken };
export default api;
