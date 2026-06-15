// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: NotificationBell.jsx (Component)                     ║
// ║  PATH: frontend/src/components/NotificationBell.jsx         ║
// ║                                                              ║
// ║  KYA HAI? → Navbar mein notification bell icon.              ║
// ║  → Unread count badge dikhata hai.                          ║
// ║  → Click pe dropdown with recent notifications.             ║
// ║  → "View All" → /notifications page pe le jaata hai.        ║
// ║  → Polls every 30 seconds for new notifications.            ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCircle, FaCheckDouble, FaTimes, FaBullhorn, FaChartBar, FaMoneyBillWave, FaCreditCard, FaCalendarCheck, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
import API from '../utils/axios';

const typeIcons = {
  notice: FaBullhorn,
  result: FaChartBar,
  fee: FaMoneyBillWave,
  payment: FaCreditCard,
  leave: FaCalendarCheck,
  scholarship: FaGraduationCap,
  event: FaCalendarAlt,
};

const typeColors = {
  notice: 'text-blue-400',
  result: 'text-green-400',
  fee: 'text-yellow-400',
  payment: 'text-emerald-400',
  leave: 'text-purple-400',
  scholarship: 'text-pink-400',
  event: 'text-orange-400',
};

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await API.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch {
      // silently fail
    }
  }, []);

  // Fetch recent notifications (for dropdown)
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/notifications?limit=8');
      setNotifications(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* */ }
  };

  // Mark all read
  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* */ }
  };

  // Click on notification → mark read + navigate if applicable
  const handleNotifClick = (notif) => {
    if (!notif.read) markAsRead(notif._id);
    setIsOpen(false);
    // Navigate based on type
    const routes = {
      notice: '/notices',
      result: '/my-results',
      fee: '/my-fees',
      payment: '/my-fees',
      leave: '/my-leave',
      scholarship: '/my-scholarships',
      event: '/events',
    };
    const route = routes[notif.type];
    if (route) navigate(route);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-gold transition-all duration-300 hover:bg-gold/10"
        aria-label="Notifications"
        title="Notifications"
      >
        <FaBell size={17} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 glass rounded-xl border border-gold/20 shadow-gold overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-gold hover:text-gold/80 transition-colors flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <FaCheckDouble size={11} /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FaBell className="mx-auto text-gray-600 mb-2" size={24} />
                  <p className="text-gray-400 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = typeIcons[notif.type] || FaBell;
                  const color = typeColors[notif.type] || 'text-gray-400';
                  return (
                    <button
                      key={notif._id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full text-left px-4 py-3 flex gap-3 transition-all duration-200 hover:bg-gold/5 border-b border-white/5 last:border-b-0 ${
                        !notif.read ? 'bg-gold/5' : ''
                      }`}
                    >
                      <div className={`mt-0.5 flex-shrink-0 ${color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${!notif.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500">{timeAgo(notif.createdAt)}</span>
                          {!notif.read && <FaCircle size={6} className="text-gold" />}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gold/10">
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-4 py-3 text-sm text-gold hover:bg-gold/10 transition-colors font-medium"
                >
                  View All Notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
