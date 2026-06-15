// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: axios.js                                            ║
// ║  PATH: frontend/src/utils/axios.js                         ║
// ║                                                            ║
// ║  KYA HAI YE FILE?                                          ║
// ║  → Axios instance create karta hai (base URL + token).     ║
// ║  → Har API request mein JWT token auto-attach hota hai.    ║
// ║  → 401 error pe auto-logout karta hai.                     ║
// ║  → Backend URL: VITE_API_URL ya default /api               ║
// ╚══════════════════════════════════════════════════════════════╝
// src/utils/axios.js — Axios Instance with Interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('kingswell_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
      } catch {
        localStorage.removeItem('kingswell_user');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kingswell_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
