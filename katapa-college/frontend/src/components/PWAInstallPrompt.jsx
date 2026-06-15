// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: PWAInstallPrompt.jsx (Component)                     ║
// ║  PATH: frontend/src/components/PWAInstallPrompt.jsx         ║
// ║                                                              ║
// ║  KYA HAI? → "Install App" banner for PWA.                   ║
// ║  → beforeinstallprompt event capture karta hai.             ║
// ║  → Mobile/Desktop pe install button dikhata hai.            ║
// ║  → Dismiss karne pe 7 din ke liye hide rehta hai.          ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const DISMISS_KEY = 'kingswell_pwa_dismiss';
const DISMISS_DAYS = 7;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Don't show if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Don't show if dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DAYS * 86400000) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setInstalled(true);
      setShow(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  };

  return (
    <AnimatePresence>
      {show && !installed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[9999]"
        >
          <div className="bg-dark-200 border border-gold/30 rounded-2xl shadow-2xl p-4 sm:p-5 flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
              <FaDownload className="text-gold" size={20} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-bold text-white text-sm sm:text-base leading-tight">
                {t('pwa.title')}
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                {t('pwa.desc')}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleInstall}
                  className="btn-gold py-2 px-5 text-xs sm:text-sm font-semibold"
                >
                  {t('pwa.install')}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors"
                >
                  {t('pwa.notNow')}
                </button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
