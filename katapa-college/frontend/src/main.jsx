// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: main.jsx                                            ║
// ║  PATH: frontend/src/main.jsx                               ║
// ║                                                            ║
// ║  KYA HAI YE FILE?                                          ║
// ║  → React app ka entry point hai — yahi se app start hota.  ║
// ║  → BrowserRouter, AuthProvider, ThemeProvider, Toaster.    ║
// ║  → index.html ke #root element mein render hota hai.       ║
// ╚══════════════════════════════════════════════════════════════╝
// src/main.jsx — React Entry Point
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <App />
          {/* Global toast notifications — uses CSS variables for theme */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--color-toast-bg)',
                color: 'var(--color-toast-text)',
                border: '1px solid #d4af37',
              },
              success: { iconTheme: { primary: '#d4af37', secondary: 'var(--color-bg)' } },
            }}
          />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Keep local Vite development free from stale PWA caches.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then((registrations) => registrations.forEach((registration) => registration.unregister()))
      .catch(() => {});

    if ('caches' in window) {
      caches.keys()
        .then((keys) => keys.filter((key) => key.startsWith('kingswell-')))
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {});
    }
  });
}

// ── Register Service Worker for PWA ────────────────────────────
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
