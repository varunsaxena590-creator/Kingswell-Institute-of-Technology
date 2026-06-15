// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Notices.jsx (Public Page)                            ║
// ║  PATH: frontend/src/pages/Notices.jsx                       ║
// ║                                                              ║
// ║  KYA HAI? → Public notice board page.                       ║
// ║  → Active notices backend se fetch karta hai.               ║
// ║  → Notification cards aur bell icon yahin route hote hain.  ║
// ║  → Pinned, category-wise aur expiry info dikhata hai.       ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaBullhorn,
  FaThumbtack,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle,
  FaRegDotCircle,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';
import Loader from '../components/Loader';

const CATEGORY_META = {
  general: { label: 'General', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  exam: { label: 'Exam', style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  holiday: { label: 'Holiday', style: 'bg-green-500/10 text-green-400 border-green-500/20' },
  urgent: { label: 'Urgent', style: 'bg-red-500/10 text-red-400 border-red-500/20' },
  event: { label: 'Event', style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No expiry';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/notices')
      .then(({ data }) => setNotices(data.data || []))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return notices;
    return notices.filter((notice) => notice.category === filter);
  }, [filter, notices]);

  const pinnedCount = notices.filter((n) => n.pinned).length;
  const urgentCount = notices.filter((n) => n.category === 'urgent').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-6xl mx-auto section-padding">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <span className="text-gold text-sm font-semibold uppercase tracking-[0.35em]">Public Notice Board</span>
            <h1 className="section-title mt-3">
              Latest <span className="gold-text">Notices</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto mt-3">
              Important updates, exam alerts, holidays, and event announcements for students and visitors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Notices', value: notices.length },
              { label: 'Pinned', value: pinnedCount },
              { label: 'Urgent', value: urgentCount },
            ].map((item) => (
              <div key={item.label} className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-500 text-xs uppercase tracking-widest">{item.label}</p>
                <p className="text-white text-3xl font-bold mt-2">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-8">
            <FaFilter size={12} className="text-gray-500" />
            {['all', ...Object.keys(CATEGORY_META)].map((key) => {
              const meta = CATEGORY_META[key];
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors capitalize ${
                    filter === key
                      ? 'bg-gold/20 text-gold border-gold/30'
                      : meta
                        ? meta.style
                        : 'text-gray-400 border-gray-700 hover:text-white'
                  }`}
                >
                  {key === 'all' ? 'All' : meta.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <Loader />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FaBullhorn size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg text-white">No notices available</p>
              <p className="text-sm mt-1">Please check back later for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((notice, index) => {
                const meta = CATEGORY_META[notice.category] || CATEGORY_META.general;
                const isExpired = notice.expiresAt && new Date(notice.expiresAt) < new Date();

                return (
                  <motion.article
                    key={notice._id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-dark-200 border rounded-2xl p-5 ${notice.pinned ? 'border-gold/30 bg-gold/5' : 'border-gray-800'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <FaBullhorn className="text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${meta.style}`}>
                            {meta.label}
                          </span>
                          {notice.pinned && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-gold/30 bg-gold/10 text-gold inline-flex items-center gap-1">
                              <FaThumbtack size={8} /> Pinned
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 inline-flex items-center gap-1">
                              <FaExclamationTriangle size={8} /> Expired
                            </span>
                          )}
                        </div>
                        <h2 className="text-white font-semibold text-lg">{notice.title}</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mt-2 whitespace-pre-wrap">
                          {notice.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1.5">
                            <FaCalendarAlt size={10} /> {formatDate(notice.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FaClock size={10} /> {notice.expiresAt ? `Expires ${formatDate(notice.expiresAt)}` : 'No expiry'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 capitalize">
                            <FaRegDotCircle size={10} /> {notice.category || 'general'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
