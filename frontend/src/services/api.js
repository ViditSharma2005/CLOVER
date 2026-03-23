import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  // Fallback to relative '/api' when no explicit environment URL is provided.
  '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const auth = JSON.parse(localStorage.getItem('clover-auth') || '{}');
    const token = auth?.state?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('clover-auth');
      window.location.href = '/login';
    } else if (error.response?.status !== 400) {
      toast.error(msg);
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};

// ===== POLICIES =====
export const policyAPI = {
  getPlans: () => api.get('/policies/plans'),
  create: (data) => api.post('/policies', data),
  getAll: () => api.get('/policies'),
  getById: (id) => api.get(`/policies/${id}`),
  renew: (id, data) => api.post(`/policies/${id}/renew`, data),
  cancel: (id) => api.patch(`/policies/${id}/cancel`),
};

// ===== CLAIMS =====
export const claimAPI = {
  submit: (data) => api.post('/claims', data),
  getAll: (params) => api.get('/claims', { params }),
  getById: (id) => api.get(`/claims/${id}`),
  getStats: () => api.get('/claims/stats/summary'),
  // Admin
  adminGetAll: (params) => api.get('/claims/admin/all', { params }),
  review: (id, data) => api.patch(`/claims/${id}/review`, data),
  processPayout: (id, data) => api.patch(`/claims/${id}/payout`, data),
};

// ===== WEATHER =====
export const weatherAPI = {
  getCurrent: (city) => api.get('/weather/current', { params: { city } }),
  getEvents: (params) => api.get('/weather/events', { params }),
  simulate: (data) => api.post('/weather/simulate', data),
};

// ===== ANALYTICS =====
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getEarnings: (months) => api.get('/analytics/earnings', { params: { months } }),
  getAdminAnalytics: () => api.get('/analytics/admin'),
};

// ===== RISK =====
export const riskAPI = {
  assess: () => api.get('/risk/assess'),
};

// ===== NOTIFICATIONS =====
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

// ===== WORKERS =====
export const workerAPI = {
  getLeaderboard: () => api.get('/workers/leaderboard'),
  getReferrals: () => api.get('/workers/referrals'),
  submitKyc: (data) => api.post('/workers/kyc', data),
};

// ===== ADMIN =====
export const adminAPI = {
  getWorkers: (params) => api.get('/admin/workers', { params }),
  toggleWorker: (id) => api.patch(`/admin/workers/${id}/toggle`),
};

// ===== PAYMENTS =====
export const paymentAPI = {
  initiate: (data) => api.post('/payments/initiate', data),
  verify: (data) => api.post('/payments/verify', data),
};

export default api;
