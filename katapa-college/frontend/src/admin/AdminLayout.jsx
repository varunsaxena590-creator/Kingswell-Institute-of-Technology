// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: AdminLayout.jsx (Admin Shell)                        ║
// ║  PATH: frontend/src/admin/AdminLayout.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Admin panel ka main layout/shell hai.            ║
// ║  → Left sidebar with navigation links (Dashboard, Students, ║
// ║    Courses, Faculty, Fees, etc.)                             ║
// ║  → <Outlet/> mein admin child pages render hote hain.       ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/AdminLayout.jsx — Admin Panel Shell
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt, FaUserGraduate, FaBookOpen, FaListAlt,
  FaImages, FaBars, FaTimes, FaSignOutAlt, FaHome, FaChalkboardTeacher, FaEnvelope, FaPalette, FaMoneyBillWave, FaBullhorn, FaChartBar, FaCalendarCheck, FaCalendarAlt, FaPaperPlane, FaChartPie, FaTicketAlt, FaClipboardList, FaBook, FaRegCalendarAlt, FaGraduationCap, FaCommentDots, FaCertificate, FaBed, FaClipboardCheck, FaComments, FaFileAlt, FaBriefcase, FaSun, FaMoon, FaQuestionCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
  { icon: FaTachometerAlt,       label: 'Dashboard',       to: '/admin' },
  { icon: FaUserGraduate,        label: 'Students',         to: '/admin/students' },
  { icon: FaBookOpen,            label: 'Add Course',       to: '/admin/courses/add' },
  { icon: FaListAlt,             label: 'Manage Courses',   to: '/admin/courses/manage' },
  { icon: FaChalkboardTeacher,   label: 'Manage Faculty',   to: '/admin/faculty' },
  { icon: FaEnvelope,            label: 'Contact Inquiries',to: '/admin/contacts' },
  { icon: FaMoneyBillWave,       label: 'Fee Management',   to: '/admin/fees' },
  { icon: FaBullhorn,            label: 'Notice Board',     to: '/admin/notices' },
  { icon: FaChartBar,            label: 'Results & Marks',  to: '/admin/results' },
  { icon: FaCalendarCheck,       label: 'Attendance',        to: '/admin/attendance' },
  { icon: FaCalendarAlt,         label: 'Timetable',          to: '/admin/timetable' },
  { icon: FaPaperPlane,          label: 'Email Notifications', to: '/admin/emails' },
  { icon: FaChartPie,            label: 'Reports & Analytics', to: '/admin/analytics' },
  { icon: FaTicketAlt,            label: 'Hall Tickets',         to: '/admin/hall-tickets' },
  { icon: FaClipboardList,         label: 'Leave Applications',   to: '/admin/leaves' },
  { icon: FaBook,                  label: 'Library',              to: '/admin/library' },
  { icon: FaRegCalendarAlt,        label: 'Event Calendar',       to: '/admin/events' },
  { icon: FaGraduationCap,         label: 'Scholarships',         to: '/admin/scholarships' },
  { icon: FaCommentDots,           label: 'Feedback',             to: '/admin/feedback' },
  { icon: FaCertificate,           label: 'Certificates',         to: '/admin/certificates' },
  { icon: FaBed,                   label: 'Hostel Management',    to: '/admin/hostel' },
  { icon: FaClipboardCheck,        label: 'Assignments',          to: '/admin/assignments' },
  { icon: FaFileAlt,               label: 'Online Exams',         to: '/admin/exams' },
  { icon: FaBriefcase,             label: 'Placements',           to: '/admin/placements' },
  { icon: FaComments,              label: 'Chat / Messages',      to: '/admin/chat' },
  { icon: FaQuestionCircle,         label: 'Chatbot FAQs',         to: '/admin/chatbot-faqs' },
  { icon: FaImages,              label: 'Upload Gallery',   to: '/admin/gallery/upload' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [themeBlue, setThemeBlue] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const accent = themeBlue
    ? {
        active:    'bg-blue-500/15 text-blue-400 border border-blue-500/20',
        avatarBg:  'bg-gradient-to-br from-blue-600 to-blue-400',
        roleText:  'text-blue-400',
        btnHover:  'hover:text-blue-400',
      }
    : {
        active:    'bg-gold/15 text-gold border border-gold/20',
        avatarBg:  'bg-gold-gradient',
        roleText:  'text-gold',
        btnHover:  'hover:text-gold',
      };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      {/* ── Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.25 }}
        className="bg-dark-200 border-r border-gray-800 flex flex-col shrink-0 h-full overflow-hidden z-30"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800 shrink-0">
          <img src="/pics/logo.png" alt="Logo" className="w-9 h-9 rounded-full object-cover shrink-0" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} />
          <div className="w-9 h-9 rounded-full bg-gold-gradient items-center justify-center font-bold text-dark text-base shrink-0" style={{display:'none'}}>
            K
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-heading font-bold text-white text-sm whitespace-nowrap overflow-hidden"
              >
                Admin Panel
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 my-0.5 mx-2 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? accent.active
                    : 'text-gray-400 hover:bg-dark-300 hover:text-white'
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-800 p-3 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-300 transition-colors"
          >
            <FaHome size={15} className="shrink-0" />
            {sidebarOpen && <span className="text-sm">Back to Site</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <FaSignOutAlt size={15} className="shrink-0" />
            {sidebarOpen && <span className="text-sm">Log Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-dark-200 border-b border-gray-800 flex items-center px-4 md:px-6 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`text-gray-400 ${accent.btnHover} transition-colors`}
          >
            {sidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-600 text-xs font-semibold tracking-wide transition-all duration-300 text-gray-400 hover:text-gold hover:border-gold/40"
            >
              {isDark ? <FaSun size={12} /> : <FaMoon size={12} />}
              {isDark ? 'Light' : 'Dark'}
            </button>
            {/* Theme Toggle (Gold/Blue accent) */}
            <button
              onClick={() => setThemeBlue(p => !p)}
              title={themeBlue ? 'Switch to Gold' : 'Switch to Blue'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all duration-300 ${
                themeBlue
                  ? 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10'
                  : 'border-gold/40 text-gold hover:bg-gold/10'
              }`}
            >
              <FaPalette size={12} />
              {themeBlue ? 'Blue' : 'Gold'}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium leading-none">{user?.name}</p>
              <p className={`${accent.roleText} text-xs capitalize mt-0.5`}>{user?.role}</p>
            </div>
            <div className={`w-9 h-9 rounded-full ${accent.avatarBg} flex items-center justify-center text-dark font-bold text-sm`}>
              {user?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
