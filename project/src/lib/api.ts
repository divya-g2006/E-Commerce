// import axios from 'axios';

// const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://e-commerce-at6a.onrender.com';

// const API_BASE_URL = String(rawBaseUrl).replace(/\/+$/, '').endsWith('/api')
//   ? String(rawBaseUrl).replace(/\/+$/, '')
//   : `${String(rawBaseUrl).replace(/\/+$/, '')}/api`;

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;


// src/lib/api.ts
import axios from 'axios';

// Base URL: use environment variable or fallback to your deployed Render backend
const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://e-commerce-at6a.onrender.com';

// Remove trailing slashes; do NOT add /api since your backend routes don't use it
const API_BASE_URL = String(rawBaseUrl).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to headers if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api