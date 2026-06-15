// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: LanguageContext.jsx                                  ║
// ║  PATH: frontend/src/context/LanguageContext.jsx             ║
// ║                                                              ║
// ║  KYA HAI? → Hindi/English language switch context.           ║
// ║  → localStorage mein language save hota hai.                ║
// ║  → useLanguage() hook se lang, toggleLang, t() milta hai.  ║
// ║  → t('section.key') → current language ka text return.      ║
// ║                                                              ║
// ║  PROVIDES: lang ('en'|'hi'), toggleLang(), t(key),          ║
// ║            isHindi                                           ║
// ╚══════════════════════════════════════════════════════════════╝
import { createContext, useContext, useState, useCallback } from 'react';
import translations from '../utils/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('kingswell_lang');
    return stored || 'en';
  });

  const toggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      localStorage.setItem('kingswell_lang', next);
      return next;
    });
  };

  // t('nav.home') → translations.nav.home[lang]
  const t = useCallback(
    (key) => {
      const parts = key.split('.');
      let obj = translations;
      for (const p of parts) {
        obj = obj?.[p];
        if (!obj) return key; // fallback: return key itself
      }
      return obj[lang] || obj['en'] || key;
    },
    [lang]
  );

  const isHindi = lang === 'hi';

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isHindi }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
import React from 'react';
