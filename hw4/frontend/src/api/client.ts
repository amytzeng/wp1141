import axios from 'axios';

const rawBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001';
const baseURL = rawBase.endsWith('/api') ? rawBase.replace(/\/+$/, '') : rawBase.replace(/\/+$/, '') + '/api';

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  withCredentials: false, // Disable credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
