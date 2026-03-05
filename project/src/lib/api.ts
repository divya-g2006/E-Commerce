import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://e-commerce-at6a.onrender.com';

const API_BASE_URL = String(rawBaseUrl).replace(/\/+$/, '').endsWith('/api')
  ? String(rawBaseUrl).replace(/\/+$/, '')
  : `${String(rawBaseUrl).replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
