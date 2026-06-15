// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Notifications.jsx (Page)                             ║
// ║  PATH: frontend/src/pages/Notifications.jsx                 ║
// ║                                                              ║
// ║  KYA HAI? → Full notifications page.                         ║
// ║  → Saari notifications dikhata hai with pagination.         ║
// ║  → Mark read, mark all read, delete, filter by type.       ║
// ║  → Navbar me "View All" se yahi aata hai.                  ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheck, FaCheckDouble, FaTrash, FaCircle, FaBullhorn, FaChartBar, FaMoneyBillWave, FaCreditCard, FaCalendarCheck, FaGraduationCap, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/axios';
import toast from 'react-hot-toast';

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
  notice: 'text-blue-400 bg-blue-400/10',
  result: 'text-green-400 bg-green-400/10',
  fee: 'text-yellow-400 bg-yellow-400/10',
  payment: 'text-emerald-400 bg-emerald-400/10',
  leave: 'text-purple-400 bg-purple-400/10',
  scholarship: 'text-pink-400 bg-pink-400/10',
  event: 'text-orange-400 bg-orange-400/10',
};

const typeLabels = {
  notice: 'Notice',
  result: 'Result',
  fee: 'Fee',
  payment: 'Payment',
  leave: 'Leave',
  scholarship: 'Scholarship',
  event: 'Event',
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
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/notifications?page=${page}&limit=20`);
      setNotifications(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotifClick = (notif) => {
    if (!notif.read) markAsRead(notif._id);
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

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <FaBell className="text-gold" /> Notifications
                {unreadCount > 0 && (
                  <span className="text-sm bg-red-500 text-white px-2.5 py-0.5 rounded-full font-medium">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-gray-400 mt-1 text-sm">Stay updated with important alerts</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="btn-outline-gold py-2 px-4 text-sm flex items-center gap-2 self-start"
              >
                <FaCheckDouble size={13} /> Mark All Read
              </button>
            )}
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar"
          >
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filter === 'all' ? 'bg-gold text-dark' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FaFilter size={10} /> All
            </button>
            {Object.entries(typeLabels).map(([key, label]) => {
              const Icon = typeIcons[key];
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    filter === key ? 'bg-gold text-dark' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={10} /> {label}
                </button>
              );
            })}
          </motion.div>

          {/* Notifications List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 mt-4 text-sm">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <FaBell className="mx-auto text-gray-600 mb-3" size={40} />
              <p className="text-gray-400 text-lg">No notifications{filter !== 'all' ? ` for ${typeLabels[filter]}` : ''}</p>
              <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <AnimatePresence>
                {filtered.map((notif, index) => {
                  const Icon = typeIcons[notif.type] || FaBell;
                  const colorClass = typeColors[notif.type] || 'text-gray-400 bg-gray-400/10';
                  const [textColor, bgColor] = colorClass.split(' ');
                  return (
                    <motion.div
                      key={notif._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                      className={`glass rounded-xl border transition-all duration-200 hover:border-gold/30 ${
                        !notif.read ? 'border-gold/20 bg-gold/5' : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-4 p-4">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColor}`}>
                          <Icon size={18} className={textColor} />
                        </div>

                        {/* Content */}
                        <button
                          onClick={() => handleNotifClick(notif)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className={`text-sm leading-tight ${!notif.read ? 'text-white font-semibold' : 'text-gray-300 font-medium'}`}>
                              {notif.title}
                            </h3>
                            {!notif.read && <FaCircle size={8} className="text-gold flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-[10px] font-medium uppercase tracking-wider ${textColor}`}>
                              {typeLabels[notif.type] || notif.type}
                            </span>
                            <span className="text-[10px] text-gray-500">{timeAgo(notif.createdAt)}</span>
                          </div>
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notif.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsRead(notif._id); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-green-400 hover:bg-green-400/10 transition-all"
                              title="Mark as read"
                            >
                              <FaCheck size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                            title="Delete notification"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
