import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('healthtwin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem('healthtwin_token');
      if (window.location.pathname.startsWith('/app')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
};

export const profileAPI = {
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data) => apiClient.put('/profile', data),
  getSettings: () => apiClient.get('/settings'),
  updateSettings: (data) => apiClient.put('/settings', data),
  deleteAccount: () => apiClient.delete('/account'),
};

export const healthRecordsAPI = {
  getAll: (params) => apiClient.get('/health-records', { params }),
  getById: (id) => apiClient.get(`/health-records/${id}`),
  create: (data) => apiClient.post('/health-records', data),
  update: (id, data) => apiClient.put(`/health-records/${id}`, data),
  delete: (id) => apiClient.delete(`/health-records/${id}`),
  importCSV: (formData) => apiClient.post('/health-records/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportCSVUrl: () => `${API_BASE_URL}/health-records/export-csv`,
};

export const dashboardAPI = {
  getDashboard: () => apiClient.get('/dashboard'),
  getTrends: (params) => apiClient.get('/analytics/trends', { params }),
  getSummary: () => apiClient.get('/analytics/summary'),
};

export const predictionsAPI = {
  getAll: () => apiClient.get('/predictions'),
  generate: (data) => apiClient.post('/predictions', data),
};

export const recommendationsAPI = {
  getAll: () => apiClient.get('/recommendations'),
  update: (id, data) => apiClient.patch(`/recommendations/${id}`, data),
};

export const goalsAPI = {
  getAll: () => apiClient.get('/goals'),
  create: (data) => apiClient.post('/goals', data),
  update: (id, data) => apiClient.put(`/goals/${id}`, data),
  delete: (id) => apiClient.delete(`/goals/${id}`),
};

export const aiAPI = {
  chat: (data) => apiClient.post('/ai/chat', data),
  getHistory: () => apiClient.get('/ai/history'),
  clearHistory: () => apiClient.delete('/ai/history'),
  getInsights: () => apiClient.post('/ai/insights'),
};

export default apiClient;
