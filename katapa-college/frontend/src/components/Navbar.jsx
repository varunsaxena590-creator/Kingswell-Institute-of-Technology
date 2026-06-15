// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Navbar.jsx (Component)                               ║
// ║  PATH: frontend/src/components/Navbar.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Website ka top navigation bar.                   ║
// ║  → Responsive hai — mobile mein hamburger menu.             ║
// ║  → Login/logout buttons + user dropdown.                    ║
// ║  → Har page ke top mein dikhta hai.                         ║
// ╚══════════════════════════════════════════════════════════════╝
// src/components/Navbar.jsx — Responsive Navigation
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaMoneyBillWave, FaChartBar, FaCalendarCheck, FaIdCard, FaCalendarAlt, FaUser, FaTicketAlt, FaClipboardList, FaBook, FaGraduationCap, FaCommentDots, FaCertificate, FaFileAlt, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';
import SystemStatusBadge from './SystemStatusBadge';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const navLinks = [
    { label: t('nav.home'),    to: '/' },
    { label: t('nav.about'),   to: '/about' },
    { label: t('nav.courses'), to: '/courses' },
    { label: t('nav.faculty'), to: '/faculty' },
    { label: t('nav.gallery'), to: '/gallery' },
    { label: t('nav.events'),  to: '/events' },
    { label: 'Placements',     to: '/placements' },
    { label: 'Alumni',         to: '/alumni' },
    { label: t('nav.contact'), to: '/contact' },
  ];

  // Detect scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success(t('nav.loggedOut'));
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/30' : 'bg-transparent'
      }`}
    >
      <div className="section-padding max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/pics/logo.png" alt="Kingswell Logo" className="w-10 h-10 rounded-full object-cover shadow-gold" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} />
          <div className="w-10 h-10 rounded-full bg-gold-gradient items-center justify-center font-heading font-bold text-dark text-lg shadow-gold" style={{display:'none'}}>
            K
          </div>
          <span className="font-heading font-bold text-xl hidden sm:block">
            <span className="gold-text">Kingswell</span>{' '}
            <span className="text-white">College</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-gold bg-gold/10'
                      : 'text-gray-300 hover:text-gold hover:bg-gold/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Auth buttons (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dark/Light mode toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-gold transition-all duration-300 hover:bg-gold/10"
            aria-label="Toggle dark mode"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <FaSun size={16} />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <FaMoon size={16} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-gold transition-all duration-300 hover:bg-gold/10 font-semibold text-xs"
            aria-label="Toggle language"
            title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={lang}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {lang === 'en' ? 'हि' : 'EN'}
              </motion.span>
            </AnimatePresence>
          </button>

          <SystemStatusBadge />

          {/* Notification Bell (logged in users only) */}
          {user && <NotificationBell />}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-gray-300 hover:text-gold transition-colors"
              >
                <FaUserCircle size={24} />
                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 glass rounded-xl border border-gold/20 overflow-hidden shadow-gold"
                  >
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaTachometerAlt size={14} /> {t('nav.adminPanel')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-fees"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaMoneyBillWave size={14} /> {t('nav.myFees')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-results"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaChartBar size={14} /> {t('nav.myResults')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-attendance"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaCalendarCheck size={14} /> {t('nav.myAttendance')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-id-card"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaIdCard size={14} /> {t('nav.myIdCard')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-timetable"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaCalendarAlt size={14} /> {t('nav.myTimetable')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-hall-ticket"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaTicketAlt size={14} /> {t('nav.myHallTicket')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-leave"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaClipboardList size={14} /> {t('nav.myLeave')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-library"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaBook size={14} /> {t('nav.myLibrary')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-scholarships"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaGraduationCap size={14} /> {t('nav.myScholarships')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-feedback"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaCommentDots size={14} /> {t('nav.myFeedback')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-certificates"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaCertificate size={14} /> {t('nav.myCertificates')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/my-exams"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                      >
                        <FaFileAlt size={14} /> {t('nav.myExams')}
                      </Link>
                    )}
                    <div className="border-t border-gold/10" />
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-gold hover:bg-gold/10 transition-colors"
                    >
                      <FaUser size={14} /> {t('nav.myProfile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <FaSignOutAlt size={14} /> {t('nav.logOut')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline-gold py-2 px-4 text-sm">
                {t('nav.login')}
              </Link>
              <Link to="/admission" className="btn-gold py-2 px-4 text-sm">
                {t('nav.applyNow')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile: theme toggle + lang toggle + menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-gold transition-all"
            aria-label="Toggle dark mode"
          >
            {isDark ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>
          <button
            onClick={toggleLang}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-gold transition-all font-semibold text-xs"
            aria-label="Toggle language"
          >
            {lang === 'en' ? 'हि' : 'EN'}
          </button>
          <SystemStatusBadge />
          {user && <NotificationBell />}
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-300 hover:text-gold transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-gold/10"
          >
            <div className="section-padding py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive ? 'text-gold bg-gold/10' : 'text-gray-300 hover:text-gold hover:bg-gold/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="flex gap-3 mt-2 pt-2 border-t border-gray-700">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.dashboard')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-fees" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.myFees')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-results" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.myResults')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-attendance" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.attendance')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-id-card" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.idCard')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-hall-ticket" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.hallTicket')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-leave" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.leave')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-library" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.library')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-scholarships" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.scholarships')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-feedback" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.feedback')}
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link to="/my-certificates" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                        {t('nav.certificates')}
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setOpen(false); }} className="btn-gold py-2 px-4 text-sm flex-1">
                      {t('nav.logOut')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1 text-center">
                      {t('nav.login')}
                    </Link>
                    <Link to="/admission" onClick={() => setOpen(false)} className="btn-gold py-2 px-4 text-sm flex-1 text-center">
                      {t('nav.apply')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
