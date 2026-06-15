// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyLeave.jsx (Student Page)                           ║
// ║  PATH: frontend/src/pages/MyLeave.jsx                        ║
// ║                                                              ║
// ║  KYA HAI? → Student apni leave applications dekhta hai      ║
// ║    aur naya leave apply karta hai yaha pe.                  ║
// ║  → Apply form (type, dates, subject, reason).               ║
// ║  → Status track karna (pending / approved / rejected).      ║
// ║  → Pending leave delete kar sakta hai.                      ║
// ║  → Route: /my-leave (protected — login required)            ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClipboardList, FaPlus, FaTimes, FaTrash, FaClock,
  FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaPaperPlane,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

const LEAVE_TYPES = [
  { value: 'sick',     label: 'Sick Leave' },
  { value: 'casual',   label: 'Casual Leave' },
  { value: 'family',   label: 'Family Emergency' },
  { value: 'academic', label: 'Academic' },
  { value: 'other',    label: 'Other' },
];

const STATUS_BADGE = {
  pending:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  approved: 'text-green-400 bg-green-400/10 border-green-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const STATUS_ICON = {
  pending:  FaClock,
  approved: FaCheckCircle,
  rejected: FaTimesCircle,
};

const emptyForm = { leaveType: 'casual', subject: '', reason: '', startDate: '', endDate: '' };

export default function MyLeave() {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(emptyForm);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/leaves/my')
      .then(({ data }) => setLeaves(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.reason || !form.startDate || !form.endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date cannot be before start date');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/leaves/my', form);
      setLeaves(prev => [data.data, ...prev]);
      toast.success('Leave application submitted!');
      setForm(emptyForm);
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave application?')) return;
    try {
      await api.delete(`/leaves/${id}`);
      setLeaves(prev => prev.filter(l => l._id !== id));
      toast.success('Leave application deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const totalDays = (l) => {
    if (!l.startDate || !l.endDate) return 0;
    return Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Stats
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-4xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-white text-3xl mb-1">My Leave Applications</h1>
              <p className="text-gray-400">Apply for leave and track your application status</p>
            </div>
            <button onClick={() => { setForm(emptyForm); setModal(true); }}
              className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5">
              <FaPlus size={12} /> Apply Leave
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total',    value: stats.total,    color: 'text-white' },
              { label: 'Pending',  value: stats.pending,  color: 'text-yellow-400' },
              { label: 'Approved', value: stats.approved, color: 'text-green-400' },
              { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-3">
                <p className="text-gray-500 text-xs uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-bold font-heading mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20 text-gray-500">Loading your leave applications...</div>
          )}

          {/* Empty */}
          {!loading && leaves.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-500">
              <FaClipboardList size={52} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg text-white mb-1">No leave applications yet</p>
              <p className="text-sm">Click "Apply Leave" to submit your first leave request.</p>
            </motion.div>
          )}

          {/* Leave Cards */}
          {!loading && leaves.length > 0 && (
            <div className="space-y-4">
              {leaves.map((l, i) => {
                const Icon = STATUS_ICON[l.status];
                return (
                  <motion.div key={l._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-dark-200 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-medium text-base truncate">{l.subject}</h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize shrink-0 flex items-center gap-1 ${STATUS_BADGE[l.status]}`}>
                            <Icon size={10} /> {l.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{l.reason}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt size={11} /> {fmtDate(l.startDate)} — {fmtDate(l.endDate)}
                          </span>
                          <span className="text-gray-600">|</span>
                          <span className="capitalize">{LEAVE_TYPES.find(t => t.value === l.leaveType)?.label || l.leaveType}</span>
                          <span className="text-gray-600">|</span>
                          <span>{totalDays(l)} day{totalDays(l) > 1 ? 's' : ''}</span>
                        </div>
                        {l.adminRemark && (
                          <div className="mt-3 bg-dark-300 rounded-lg px-3 py-2 text-sm">
                            <span className="text-gray-500">Admin: </span>
                            <span className="text-gray-300">{l.adminRemark}</span>
                          </div>
                        )}
                      </div>
                      {l.status === 'pending' && (
                        <button onClick={() => handleDelete(l._id)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0" title="Delete">
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-white text-xl">Apply for Leave</h3>
                <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Leave Type</label>
                  <select value={form.leaveType} onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))} className="input-field w-full text-sm">
                    {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1">Subject / Title *</label>
                  <input type="text" placeholder="e.g. Medical Appointment" value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input-field w-full text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Start Date *</label>
                    <input type="date" value={form.startDate}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">End Date *</label>
                    <input type="date" value={form.endDate}
                      onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="input-field w-full text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1">Reason *</label>
                  <textarea rows={4} placeholder="Explain why you need leave..." value={form.reason}
                    onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} className="input-field w-full resize-none text-sm" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl bg-dark-300 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    <FaPaperPlane size={12} /> {saving ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
