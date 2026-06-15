// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: FeedbackManagement.jsx (Admin Page)                  ║
// ║  PATH: frontend/src/admin/FeedbackManagement.jsx             ║
// ║                                                              ║
// ║  KYA HAI? → Admin feedback management page.                 ║
// ║  → View all student feedback with ratings.                  ║
// ║  → Filter by category, status. Reply & resolve.             ║
// ║  → Star ratings, average score stats.                       ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar, FaReply, FaTrash, FaTimes, FaFilter, FaCommentDots,
  FaCheckCircle, FaEye, FaExclamationCircle,
} from 'react-icons/fa';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['faculty', 'course', 'facility', 'general'];

const CAT_COLORS = {
  faculty:  'bg-blue-400/15 text-blue-400 border-blue-400/20',
  course:   'bg-purple-400/15 text-purple-400 border-purple-400/20',
  facility: 'bg-orange-400/15 text-orange-400 border-orange-400/20',
  general:  'bg-gray-400/15 text-gray-400 border-gray-400/20',
};

const STATUS_CFG = {
  new:      { icon: FaExclamationCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'New' },
  reviewed: { icon: FaEye,               color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',   label: 'Reviewed' },
  resolved: { icon: FaCheckCircle,       color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20', label: 'Resolved' },
};

const Stars = ({ count, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <FaStar key={n} size={size} className={n <= count ? 'text-gold' : 'text-gray-700'} />
    ))}
  </div>
);

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [replyModal, setReplyModal]     = useState(null);
  const [replyForm, setReplyForm]       = useState({ adminReply: '', status: 'reviewed' });

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data } = await api.get('/feedback');
      setFeedbacks(data.data || []);
    } catch { toast.error('Failed to load feedback'); }
    finally { setLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // Stats
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';
  const newCount = feedbacks.filter(f => f.status === 'new').length;

  // Filter
  const filtered = feedbacks.filter(f => {
    if (filterCat !== 'all' && f.category !== filterCat) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  const openReply = (fb) => {
    setReplyModal(fb);
    setReplyForm({ adminReply: fb.adminReply || '', status: fb.status === 'new' ? 'reviewed' : fb.status });
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/feedback/${replyModal._id}/reply`, replyForm);
      setFeedbacks(prev => prev.map(f => f._id === replyModal._id ? data.data : f));
      toast.success('Reply sent');
      setReplyModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
      toast.success('Feedback deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Feedback Management</h1>
          <p className="text-gray-500 text-sm mt-1">{feedbacks.length} total feedback · {newCount} new</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-2 text-center">
            <p className="text-gray-500 text-[10px] uppercase tracking-widest">Avg Rating</p>
            <div className="flex items-center gap-2">
              <span className="text-gold font-heading font-bold text-lg">{avgRating}</span>
              <Stars count={Math.round(avgRating)} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <FaFilter size={12} className="text-gray-500" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="input-field py-1 px-3 text-xs">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="input-field py-1 px-3 text-xs">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading && <div className="text-center py-20 text-gray-500">Loading feedback...</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <FaCommentDots size={40} className="mx-auto mb-3 opacity-10" />
          <p>No feedback found</p>
        </div>
      )}

      {/* Feedback List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((fb, i) => {
            const cfg = STATUS_CFG[fb.status] || STATUS_CFG.new;
            const Icon = cfg.icon;
            return (
              <motion.div key={fb._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`bg-dark-200 border rounded-xl p-4 transition-colors ${
                  fb.status === 'new' ? 'border-yellow-500/20' : 'border-gray-800 hover:border-gray-700'
                }`}>
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    fb.anonymous ? 'bg-gray-700 text-gray-400' : 'bg-gold/10 text-gold'
                  }`}>
                    {fb.anonymous ? '?' : (fb.student?.firstName?.[0] || '?')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white font-medium text-sm">
                        {fb.anonymous ? 'Anonymous Student' : `${fb.student?.firstName} ${fb.student?.lastName}`}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${CAT_COLORS[fb.category]}`}>{fb.category}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                        <Icon size={8} /> {cfg.label}
                      </span>
                    </div>

                    <Stars count={fb.rating} />

                    <h4 className="text-gray-200 text-sm font-medium mt-1.5">{fb.subject}</h4>
                    <p className="text-gray-500 text-xs mt-1">{fb.message}</p>

                    {!fb.anonymous && (
                      <p className="text-gray-600 text-[10px] mt-2">
                        {fb.student?.email} · {fb.student?.enrollmentNo || '—'}
                      </p>
                    )}
                    <p className="text-gray-600 text-[10px]">Submitted: {fmtDate(fb.createdAt)}</p>

                    {fb.adminReply && (
                      <div className="mt-2 bg-dark-300 border border-gray-700 rounded-lg p-3">
                        <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">Admin Reply</p>
                        <p className="text-gray-300 text-xs">{fb.adminReply}</p>
                        {fb.repliedAt && <p className="text-gray-600 text-[10px] mt-1">{fmtDate(fb.repliedAt)}</p>}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openReply(fb)} className="p-2 text-gray-500 hover:text-blue-400 transition-colors" title="Reply">
                      <FaReply size={14} />
                    </button>
                    <button onClick={() => handleDelete(fb._id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ REPLY MODAL ═══ */}
      <AnimatePresence>
        {replyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setReplyModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-200 border border-gray-800 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-white text-lg font-bold">Reply to Feedback</h2>
                <button onClick={() => setReplyModal(null)} className="text-gray-500 hover:text-white"><FaTimes size={18} /></button>
              </div>

              {/* Feedback preview */}
              <div className="mb-4 p-3 bg-dark-300 rounded-xl border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-sm font-medium">
                    {replyModal.anonymous ? 'Anonymous' : `${replyModal.student?.firstName} ${replyModal.student?.lastName}`}
                  </span>
                  <Stars count={replyModal.rating} size={10} />
                </div>
                <p className="text-gold text-xs font-medium">{replyModal.subject}</p>
                <p className="text-gray-500 text-xs mt-1">{replyModal.message}</p>
              </div>

              <form onSubmit={handleReply} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Your Reply</label>
                  <textarea value={replyForm.adminReply} onChange={e => setReplyForm(f => ({ ...f, adminReply: e.target.value }))}
                    rows={4} className="input-field w-full" placeholder="Write your reply..." />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Status</label>
                  <div className="flex gap-2">
                    {['reviewed', 'resolved'].map(s => (
                      <button key={s} type="button" onClick={() => setReplyForm(f => ({ ...f, status: s }))}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize border transition-colors ${
                          replyForm.status === s
                            ? (s === 'resolved' ? 'bg-green-400/15 text-green-400 border-green-400/30' : 'bg-blue-400/15 text-blue-400 border-blue-400/30')
                            : 'text-gray-400 border-gray-700 hover:text-white'
                        }`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setReplyModal(null)} className="btn-outline-gold py-2 px-4 text-sm flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 px-4 text-sm flex-1 flex items-center justify-center gap-2">
                    <FaReply size={12} /> Send Reply
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
