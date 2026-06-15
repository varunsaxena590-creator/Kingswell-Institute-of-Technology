// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: ThemeContext.jsx                                     ║
// ║  PATH: frontend/src/context/ThemeContext.jsx                 ║
// ║                                                              ║
// ║  KYA HAI? → Dark/Light theme toggle context.                 ║
// ║  → localStorage mein theme save hota hai.                   ║
// ║  → document.documentElement pe 'dark' class toggle.         ║
// ║  → useTheme() hook se kahi bhi access karo.                 ║
// ║                                                              ║
// ║  PROVIDES: theme ('dark'|'light'), toggleTheme(), isDark     ║
// ╚══════════════════════════════════════════════════════════════╝
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('kingswell_theme');
    return stored || 'dark';
  });

  // Apply class on <html> element + persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('kingswell_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
import React from "react";
