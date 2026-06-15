// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Scholarships.jsx (Admin Page)                        ║
// ║  PATH: frontend/src/admin/Scholarships.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Admin scholarship management page.              ║
// ║  → Tab 1: Scholarship Schemes (CRUD)                        ║
// ║  → Tab 2: Applications (view, approve/reject)               ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaBan,
  FaGraduationCap, FaRupeeSign, FaClipboardList, FaCalendarAlt,
  FaChair, FaToggleOn, FaToggleOff,
} from 'react-icons/fa';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['merit', 'need-based', 'sports', 'minority', 'sc-st', 'research', 'other'];

const CAT_COLORS = {
  'merit':      'bg-blue-400/15 text-blue-400 border-blue-400/20',
  'need-based': 'bg-green-400/15 text-green-400 border-green-400/20',
  'sports':     'bg-orange-400/15 text-orange-400 border-orange-400/20',
  'minority':   'bg-purple-400/15 text-purple-400 border-purple-400/20',
  'sc-st':      'bg-cyan-400/15 text-cyan-400 border-cyan-400/20',
  'research':   'bg-yellow-400/15 text-yellow-400 border-yellow-400/20',
  'other':      'bg-gray-400/15 text-gray-400 border-gray-400/20',
};

const STATUS_CFG = {
  pending:  { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  approved: { color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
  rejected: { color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20' },
};

const blankForm = {
  name: '', description: '', category: 'merit', amount: '',
  seats: '', eligibility: '', deadline: '', isActive: true,
};

export default function Scholarships() {
  const [tab, setTab] = useState('schemes');
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState({ ...blankForm });
  const [reviewModal, setReviewModal] = useState(null); // app object
  const [reviewForm, setReviewForm]   = useState({ status: 'approved', adminRemark: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        api.get('/scholarships/all'),
        api.get('/scholarships/applications'),
      ]);
      setScholarships(sRes.data.data || []);
      setApplications(aRes.data.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ── Scheme CRUD ──
  const openCreate = () => { setEditId(null); setForm({ ...blankForm }); setShowModal(true); };
  const openEdit = (s) => {
    setEditId(s._id);
    setForm({
      name: s.name, description: s.description || '', category: s.category,
      amount: s.amount, seats: s.seats || '', eligibility: s.eligibility || '',
      deadline: s.deadline?.slice(0, 10) || '', isActive: s.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, amount: Number(form.amount), seats: Number(form.seats) || 0, deadline: form.deadline || null };
    try {
      if (editId) {
        const { data } = await api.put(`/scholarships/${editId}`, payload);
        setScholarships(prev => prev.map(s => s._id === editId ? data.data : s));
        toast.success('Scholarship updated');
      } else {
        const { data } = await api.post('/scholarships', payload);
        setScholarships(prev => [data.data, ...prev]);
        toast.success('Scholarship created');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scholarship and all its applications?')) return;
    try {
      await api.delete(`/scholarships/${id}`);
      setScholarships(prev => prev.filter(s => s._id !== id));
      setApplications(prev => prev.filter(a => a.scholarship?._id !== id));
      toast.success('Scholarship deleted');
    } catch { toast.error('Failed to delete'); }
  };

  // ── Application Review ──
  const openReview = (app) => { setReviewModal(app); setReviewForm({ status: 'approved', adminRemark: '' }); };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/scholarships/applications/${reviewModal._id}/review`, reviewForm);
      setApplications(prev => prev.map(a => a._id === reviewModal._id ? data.data : a));
      toast.success(`Application ${reviewForm.status}`);
      setReviewModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Scholarship Management</h1>
          <p className="text-gray-500 text-sm mt-1">{scholarships.length} schemes · {applications.length} applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-dark-300 rounded-lg overflow-hidden border border-gray-800">
            <button onClick={() => setTab('schemes')} className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${tab === 'schemes' ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'}`}>
              <FaGraduationCap size={12} /> Schemes
            </button>
            <button onClick={() => setTab('applications')} className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${tab === 'applications' ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'}`}>
              <FaClipboardList size={12} /> Applications
            </button>
          </div>
          {tab === 'schemes' && (
            <button onClick={openCreate} className="btn-gold py-2 px-4 text-sm flex items-center gap-2">
              <FaPlus size={12} /> Add Scheme
            </button>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-20 text-gray-500">Loading...</div>}

      {/* ═══ SCHEMES TAB ═══ */}
      {!loading && tab === 'schemes' && (
        <div className="space-y-3">
          {scholarships.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FaGraduationCap size={40} className="mx-auto mb-3 opacity-10" />
              <p>No scholarship schemes created yet</p>
            </div>
          )}
          {scholarships.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`bg-dark-200 border rounded-xl p-4 transition-colors ${s.isActive ? 'border-gray-800 hover:border-gray-700' : 'border-gray-800/50 opacity-60'}`}>
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                  <FaGraduationCap size={20} className="text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-white font-medium">{s.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${CAT_COLORS[s.category]}`}>{s.category}</span>
                    {!s.isActive && <span className="text-[10px] text-red-400 font-bold">INACTIVE</span>}
                  </div>
                  {s.description && <p className="text-gray-500 text-xs mb-2 line-clamp-2">{s.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><FaRupeeSign size={10} /> ₹{s.amount.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><FaChair size={10} /> {s.seats > 0 ? `${s.seats} seats` : 'Unlimited'}</span>
                    <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> Deadline: {fmtDate(s.deadline)}</span>
                  </div>
                  {s.eligibility && <p className="text-gray-600 text-xs mt-1">Eligibility: {s.eligibility}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(s)} className="p-2 text-gray-500 hover:text-blue-400 transition-colors"><FaEdit size={14} /></button>
                  <button onClick={() => handleDelete(s._id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><FaTrash size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ═══ APPLICATIONS TAB ═══ */}
      {!loading && tab === 'applications' && (
        <div className="space-y-3">
          {applications.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FaClipboardList size={40} className="mx-auto mb-3 opacity-10" />
              <p>No applications received yet</p>
            </div>
          )}
          {applications.map((a, i) => {
            const cfg = STATUS_CFG[a.status] || STATUS_CFG.pending;
            return (
              <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-dark-200 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-medium">{a.student?.firstName} {a.student?.lastName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${cfg.bg} ${cfg.color}`}>{a.status}</span>
                    </div>
                    <p className="text-gold text-sm mb-1">{a.scholarship?.name}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                      <span>Enrollment: {a.student?.enrollmentNo || '—'}</span>
                      <span>Email: {a.student?.email}</span>
                      <span>Amount: ₹{a.scholarship?.amount?.toLocaleString()}</span>
                      {a.cgpa && <span>CGPA: {a.cgpa}</span>}
                      {a.familyIncome && <span>Family Income: ₹{a.familyIncome.toLocaleString()}</span>}
                    </div>
                    {a.reason && <p className="text-gray-500 text-xs mb-1">Reason: {a.reason}</p>}
                    {a.adminRemark && <p className="text-gray-400 text-xs">Admin Remark: {a.adminRemark}</p>}
                    <p className="text-gray-600 text-[10px] mt-1">Applied: {fmtDate(a.createdAt)}{a.reviewedAt ? ` · Reviewed: ${fmtDate(a.reviewedAt)}` : ''}</p>
                  </div>
                  {a.status === 'pending' && (
                    <button onClick={() => openReview(a)} className="btn-gold py-1.5 px-3 text-xs shrink-0">Review</button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══ SCHEME MODAL ═══ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-200 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-white text-lg font-bold">{editId ? 'Edit Scheme' : 'Add Scheme'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><FaTimes size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Scholarship Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field w-full" placeholder="e.g. Merit Scholarship 2026" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-field w-full" placeholder="Scholarship details..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field w-full">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Amount (₹) *</label>
                    <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="0" className="input-field w-full" placeholder="50000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Seats (0 = unlimited)</label>
                    <input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} min="0" className="input-field w-full" placeholder="10" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-field w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Eligibility Criteria</label>
                  <input value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} className="input-field w-full" placeholder="e.g. CGPA > 8.0, Family income < 5L" />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-gold w-4 h-4" />
                  {form.isActive ? <FaToggleOn size={14} className="text-green-400" /> : <FaToggleOff size={14} className="text-gray-500" />}
                  Active (visible to students)
                </label>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 px-4 text-sm flex-1">{editId ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ REVIEW MODAL ═══ */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setReviewModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-200 border border-gray-800 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-white text-lg font-bold">Review Application</h2>
                <button onClick={() => setReviewModal(null)} className="text-gray-500 hover:text-white"><FaTimes size={18} /></button>
              </div>
              <div className="mb-4 p-3 bg-dark-300 rounded-xl border border-gray-800">
                <p className="text-white text-sm font-medium">{reviewModal.student?.firstName} {reviewModal.student?.lastName}</p>
                <p className="text-gold text-xs">{reviewModal.scholarship?.name} — ₹{reviewModal.scholarship?.amount?.toLocaleString()}</p>
                {reviewModal.reason && <p className="text-gray-500 text-xs mt-1">Reason: {reviewModal.reason}</p>}
                {reviewModal.cgpa && <p className="text-gray-500 text-xs">CGPA: {reviewModal.cgpa}</p>}
                {reviewModal.familyIncome && <p className="text-gray-500 text-xs">Family Income: ₹{reviewModal.familyIncome.toLocaleString()}</p>}
              </div>
              <form onSubmit={handleReview} className="space-y-4">
                <div className="flex gap-3">
                  <button type="button" onClick={() => setReviewForm(f => ({ ...f, status: 'approved' }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-colors ${reviewForm.status === 'approved' ? 'bg-green-400/15 text-green-400 border-green-400/30' : 'text-gray-400 border-gray-700 hover:text-white'}`}>
                    <FaCheck size={12} /> Approve
                  </button>
                  <button type="button" onClick={() => setReviewForm(f => ({ ...f, status: 'rejected' }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-colors ${reviewForm.status === 'rejected' ? 'bg-red-400/15 text-red-400 border-red-400/30' : 'text-gray-400 border-gray-700 hover:text-white'}`}>
                    <FaBan size={12} /> Reject
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Remark (optional)</label>
                  <textarea value={reviewForm.adminRemark} onChange={e => setReviewForm(f => ({ ...f, adminRemark: e.target.value }))} rows={3} className="input-field w-full" placeholder="Admin remark..." />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setReviewModal(null)} className="btn-outline-gold py-2 px-4 text-sm flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 px-4 text-sm flex-1">Submit Review</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
