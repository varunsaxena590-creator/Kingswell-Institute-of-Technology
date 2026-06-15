// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: AuthContext.jsx                                     ║
// ║  PATH: frontend/src/context/AuthContext.jsx                ║
// ║                                                            ║
// ║  KYA HAI YE FILE?                                          ║
// ║  → Global authentication state manage karta hai.           ║
// ║  → Login, logout, register functions provide karta hai.    ║
// ║  → JWT token localStorage mein save hota hai.              ║
// ║  → useAuth() hook se kisi bhi component mein access hota.  ║
// ║                                                            ║
// ║  PROVIDES: user, token, login(), logout(), register(),     ║
// ║    loading, isAdmin                                        ║
// ╚══════════════════════════════════════════════════════════════╝
// src/context/AuthContext.jsx — Global Auth State
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore session from localStorage on mount and verify it with the server.
  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem('kingswell_user');
      if (!stored) return;

      setLoading(true);
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);
      try {
        const parsed = JSON.parse(stored);
        if (!parsed?.token) throw new Error('Missing token');

        // Validate token before trusting the local session.
        const baseUrl = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${parsed.token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Session invalid');

        const data = await res.json();
        const userData = { ...data.data, token: parsed.token };
        setUser(userData);
        localStorage.setItem('kingswell_user', JSON.stringify(userData));
      } catch {
        localStorage.removeItem('kingswell_user');
        setUser(null);
      } finally {
        window.clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const userData = data.data;
    setUser(userData);
    localStorage.setItem('kingswell_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const userData = data.data;
    setUser(userData);
    localStorage.setItem('kingswell_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kingswell_user');
  };

  // Update stored user after profile edit
  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('kingswell_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy consumption
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
