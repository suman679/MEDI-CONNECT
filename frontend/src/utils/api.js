import axios from 'axios';

const API = axios.create({
baseURL: `${process.env.REACT_APP_API_URL}/api` || 'http://localhost:5000/api',
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('mc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('mc_token');
      sessionStorage.removeItem('mc_user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || { message: err.message || 'Network error' });
  }
);

export const authAPI = {
  register:       (d) => API.post('/auth/register', d),
  login:          (d) => API.post('/auth/login', d),
  logout:         ()  => API.post('/auth/logout'),
  getMe:          ()  => API.get('/auth/me'),
  updateProfile:  (d) => API.put('/auth/updateprofile', d),
  updatePassword: (d) => API.put('/auth/updatepassword', d),
};

export const doctorAPI = {
  getAll:             (p) => API.get('/doctors', { params: p }),
  getOne:             (id)=> API.get(`/doctors/${id}`),
  getSpecializations: ()  => API.get('/doctors/specializations'),
  getAvailability:    (id)=> API.get(`/doctors/${id}/availability`),
  getStats:           ()  => API.get('/doctors/stats'),
  createProfile:      (d) => API.post('/doctors/profile', d),
  updateProfile:      (d) => API.put('/doctors/profile', d),
};

export const appointmentAPI = {
  book:         (d)       => API.post('/appointments', d),
  getAll:       (p)       => API.get('/appointments', { params: p }),
  getOne:       (id)      => API.get(`/appointments/${id}`),
  updateStatus: (id, d)   => API.put(`/appointments/${id}/status`, d),
  addReview:    (id, d)   => API.post(`/appointments/${id}/review`, d),
};

export const prescriptionAPI = {
  create: (d)  => API.post('/prescriptions', d),
  getAll: ()   => API.get('/prescriptions'),
  getOne: (id) => API.get(`/prescriptions/${id}`),
};

export const recordAPI = {
  getAll:  (p)  => API.get('/records', { params: p }),
  getOne:  (id) => API.get(`/records/${id}`),
  create:  (d)  => API.post('/records', d),
  delete:  (id) => API.delete(`/records/${id}`),
};

export const notificationAPI = {
  getAll:   (p)  => API.get('/notifications', { params: p }),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAll:  ()   => API.put('/notifications/markall'),
  delete:   (id) => API.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getStats:      ()   => API.get('/admin/stats'),
  getUsers:      (p)  => API.get('/admin/users', { params: p }),
  toggleUser:    (id) => API.put(`/admin/users/${id}/toggle`),
  approveDoctor: (id) => API.put(`/admin/doctors/${id}/approve`),
  rejectDoctor:  (id) => API.put(`/admin/doctors/${id}/reject`),
};

export default API;
