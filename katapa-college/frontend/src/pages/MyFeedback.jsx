// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyFeedback.jsx (Student Page)                        ║
// ║  PATH: frontend/src/pages/MyFeedback.jsx                     ║
// ║                                                              ║
// ║  KYA HAI? → Student feedback submission & history page.     ║
// ║  → Submit new feedback (rating, category, message).         ║
// ║  → View past feedback with admin replies.                   ║
// ║  → Anonymous option available.                              ║
// ║  → Route: /my-feedback (protected — login required)         ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar, FaCommentDots, FaPaperPlane, FaTimes,
  FaClock, FaCheckCircle, FaEye, FaUserSecret,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
  new:      { icon: FaClock,       color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'New' },
  reviewed: { icon: FaEye,         color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',   label: 'Reviewed' },
  resolved: { icon: FaCheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20', label: 'Resolved' },
};

const StarRating = ({ value, onChange, size = 20 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className={`transition-colors ${n <= value ? 'text-gold' : 'text-gray-700 hover:text-gray-500'}`}>
        <FaStar size={size} />
      </button>
    ))}
  </div>
);

const Stars = ({ count, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <FaStar key={n} size={size} className={n <= count ? 'text-gold' : 'text-gray-700'} />
    ))}
  </div>
);

const blankForm = { category: 'general', subject: '', message: '', rating: 0, anonymous: false };

export default function MyFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ ...blankForm });

  useEffect(() => {
    api.get('/feedback/my')
      .then(({ data }) => setFeedbacks(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please give a rating'); return; }
    try {
      const { data } = await api.post('/feedback', form);
      setFeedbacks(prev => [data.data, ...prev]);
      toast.success('Feedback submitted!');
      setForm({ ...blankForm });
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-3xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">Feedback</h1>
            <p className="text-gray-400">Share your feedback about faculty, courses & facilities</p>
          </motion.div>

          {/* Submit toggle */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="mb-6 flex justify-center">
            <button onClick={() => setShowForm(!showForm)}
              className={`py-2.5 px-6 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border ${
                showForm ? 'bg-dark-200 text-gray-400 border-gray-700' : 'btn-gold'
              }`}>
              {showForm ? <><FaTimes size={12} /> Cancel</> : <><FaPaperPlane size={12} /> Submit Feedback</>}
            </button>
          </motion.div>

          {/* ═══ SUBMIT FORM ═══ */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8">
                <form onSubmit={handleSubmit}
                  className="bg-dark-200 border border-gray-800 rounded-2xl p-6 space-y-4">

                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-2">How would you rate your experience?</p>
                    <StarRating value={form.rating} onChange={(r) => setForm(f => ({ ...f, rating: r }))} size={28} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Category *</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field w-full">
                        {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Subject *</label>
                      <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required className="input-field w-full" placeholder="Brief subject" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Your Feedback *</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={4} className="input-field w-full" placeholder="Share your detailed feedback..." />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} className="accent-gold w-4 h-4" />
                    <FaUserSecret size={14} className="text-gray-500" />
                    Submit anonymously
                  </label>

                  <button type="submit" className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2">
                    <FaPaperPlane size={12} /> Submit Feedback
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && <div className="text-center py-20 text-gray-500">Loading your feedback...</div>}

          {/* Empty */}
          {!loading && feedbacks.length === 0 && !showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-500">
              <FaCommentDots size={52} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg text-white mb-1">No Feedback Yet</p>
              <p className="text-sm">Click "Submit Feedback" to share your thoughts.</p>
            </motion.div>
          )}

          {/* Feedback History */}
          {!loading && feedbacks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-gray-400 text-sm font-medium">Your Feedback History ({feedbacks.length})</h2>
              {feedbacks.map((fb, i) => {
                const cfg = STATUS_CFG[fb.status] || STATUS_CFG.new;
                const Icon = cfg.icon;
                return (
                  <motion.div key={fb._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`bg-dark-200 border rounded-2xl p-5 transition-colors ${
                      fb.status === 'resolved' ? 'border-green-500/20' : 'border-gray-800'
                    }`}>
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        fb.status === 'resolved' ? 'bg-green-400/10 text-green-400' :
                        fb.status === 'reviewed' ? 'bg-blue-400/10 text-blue-400' :
                        'bg-gold/10 text-gold'
                      }`}>
                        <FaCommentDots size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${CAT_COLORS[fb.category]}`}>{fb.category}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                            <Icon size={8} /> {cfg.label}
                          </span>
                          {fb.anonymous && <span className="text-[10px] text-gray-500 flex items-center gap-1"><FaUserSecret size={8} /> Anonymous</span>}
                        </div>

                        <Stars count={fb.rating} />

                        <h3 className="text-white font-medium text-sm mt-1.5">{fb.subject}</h3>
                        <p className="text-gray-500 text-xs mt-1">{fb.message}</p>
                        <p className="text-gray-600 text-[10px] mt-2">{fmtDate(fb.createdAt)}</p>

                        {fb.adminReply && (
                          <div className="mt-3 bg-dark-300 border border-gray-700 rounded-lg p-3">
                            <p className="text-gold text-[10px] font-bold uppercase tracking-widest mb-1">Admin Reply</p>
                            <p className="text-gray-300 text-xs">{fb.adminReply}</p>
                            {fb.repliedAt && <p className="text-gray-600 text-[10px] mt-1">{fmtDate(fb.repliedAt)}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
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
