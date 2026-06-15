// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyScholarships.jsx (Student Page)                    ║
// ║  PATH: frontend/src/pages/MyScholarships.jsx                 ║
// ║                                                              ║
// ║  KYA HAI? → Student scholarship page.                       ║
// ║  → Available scholarships browse + apply karta hai.         ║
// ║  → Apni applications track karta hai (status, remark).      ║
// ║  → Route: /my-scholarships (protected — login required)     ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGraduationCap, FaRupeeSign, FaCalendarAlt, FaChair,
  FaClock, FaCheckCircle, FaTimesCircle, FaTimes, FaPaperPlane,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';
import toast from 'react-hot-toast';

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
  pending:  { icon: FaClock,        color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'Pending' },
  approved: { icon: FaCheckCircle,  color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20',  label: 'Approved' },
  rejected: { icon: FaTimesCircle,  color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',      label: 'Rejected' },
};

export default function MyScholarships() {
  const [tab, setTab] = useState('available');
  const [scholarships, setScholarships] = useState([]);
  const [myApps, setMyApps]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [applyModal, setApplyModal]     = useState(null); // scholarship object
  const [applyForm, setApplyForm]       = useState({ reason: '', cgpa: '', familyIncome: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [sRes, aRes] = await Promise.all([
        api.get('/scholarships'),
        api.get('/scholarships/my'),
      ]);
      setScholarships(sRes.data.data || []);
      setMyApps(aRes.data.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // Check if already applied
  const hasApplied = (schId) => myApps.some(a => a.scholarship?._id === schId);

  // Check if deadline passed
  const isExpired = (deadline) => deadline && new Date(deadline) < new Date();

  const openApply = (s) => { setApplyModal(s); setApplyForm({ reason: '', cgpa: '', familyIncome: '' }); };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        scholarshipId: applyModal._id,
        reason: applyForm.reason,
        cgpa: applyForm.cgpa ? Number(applyForm.cgpa) : null,
        familyIncome: applyForm.familyIncome ? Number(applyForm.familyIncome) : null,
      };
      const { data } = await api.post('/scholarships/apply', payload);
      setMyApps(prev => [data.data, ...prev]);
      toast.success('Application submitted!');
      setApplyModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
  };

  const stats = {
    total: myApps.length,
    pending: myApps.filter(a => a.status === 'pending').length,
    approved: myApps.filter(a => a.status === 'approved').length,
    rejected: myApps.filter(a => a.status === 'rejected').length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-4xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">Scholarships</h1>
            <p className="text-gray-400">Browse available scholarships & track your applications</p>
          </motion.div>

          {/* Stats */}
          {myApps.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="grid grid-cols-3 gap-3 mb-6">
              {[
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
          )}

          {/* Tabs */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6">
            <button onClick={() => setTab('available')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'available' ? 'bg-gold/20 text-gold border border-gold/30' : 'text-gray-400 border border-gray-700 hover:text-white'}`}>
              Available Scholarships
            </button>
            <button onClick={() => setTab('my')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'my' ? 'bg-gold/20 text-gold border border-gold/30' : 'text-gray-400 border border-gray-700 hover:text-white'}`}>
              My Applications ({myApps.length})
            </button>
          </motion.div>

          {loading && <div className="text-center py-20 text-gray-500">Loading scholarships...</div>}

          {/* ═══ AVAILABLE SCHOLARSHIPS ═══ */}
          {!loading && tab === 'available' && (
            <div className="space-y-4">
              {scholarships.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FaGraduationCap size={52} className="mx-auto mb-4 opacity-10" />
                  <p className="text-lg text-white mb-1">No Scholarships Available</p>
                  <p className="text-sm">Check back later for new scholarship opportunities.</p>
                </div>
              )}
              {scholarships.map((s, i) => {
                const applied = hasApplied(s._id);
                const expired = isExpired(s.deadline);
                return (
                  <motion.div key={s._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-dark-200 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center">
                        <FaGraduationCap size={20} className="text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-white font-heading font-medium text-base">{s.name}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${CAT_COLORS[s.category]}`}>{s.category}</span>
                        </div>
                        {s.description && <p className="text-gray-500 text-sm mb-3">{s.description}</p>}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1 text-gold font-medium"><FaRupeeSign size={10} /> ₹{s.amount.toLocaleString()}</span>
                          <span className="flex items-center gap-1"><FaChair size={10} /> {s.seats > 0 ? `${s.seats} seats` : 'Unlimited'}</span>
                          <span className={`flex items-center gap-1 ${expired ? 'text-red-400' : ''}`}>
                            <FaCalendarAlt size={10} /> Deadline: {fmtDate(s.deadline)} {expired ? '(Expired)' : ''}
                          </span>
                        </div>
                        {s.eligibility && (
                          <p className="text-gray-600 text-xs mb-3">Eligibility: {s.eligibility}</p>
                        )}
                        {applied ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-green-400/10 border-green-400/20 text-green-400">
                            <FaCheckCircle size={10} /> Already Applied
                          </span>
                        ) : expired ? (
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-red-400/10 border-red-400/20 text-red-400">
                            <FaTimesCircle size={10} /> Deadline Passed
                          </span>
                        ) : (
                          <button onClick={() => openApply(s)} className="btn-gold py-1.5 px-4 text-xs flex items-center gap-1.5">
                            <FaPaperPlane size={10} /> Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ═══ MY APPLICATIONS ═══ */}
          {!loading && tab === 'my' && (
            <div className="space-y-4">
              {myApps.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <FaGraduationCap size={52} className="mx-auto mb-4 opacity-10" />
                  <p className="text-lg text-white mb-1">No Applications Yet</p>
                  <p className="text-sm">Apply for scholarships from the available tab.</p>
                </div>
              )}
              {myApps.map((a, i) => {
                const cfg = STATUS_CFG[a.status] || STATUS_CFG.pending;
                const Icon = cfg.icon;
                return (
                  <motion.div key={a._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`bg-dark-200 border rounded-2xl p-5 transition-colors ${
                      a.status === 'approved' ? 'border-green-500/20' : a.status === 'rejected' ? 'border-red-500/20' : 'border-gray-800'
                    }`}>
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        a.status === 'approved' ? 'bg-green-400/10 text-green-400' :
                        a.status === 'rejected' ? 'bg-red-400/10 text-red-400' :
                        'bg-gold/10 text-gold'
                      }`}>
                        <FaGraduationCap size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-white font-medium">{a.scholarship?.name}</h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                            <Icon size={10} /> {cfg.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                          <span className="text-gold">₹{a.scholarship?.amount?.toLocaleString()}</span>
                          <span>Applied: {fmtDate(a.createdAt)}</span>
                          {a.reviewedAt && <span>Reviewed: {fmtDate(a.reviewedAt)}</span>}
                        </div>
                        {a.reason && <p className="text-gray-500 text-xs mb-1">Your reason: {a.reason}</p>}
                        {a.adminRemark && (
                          <div className={`text-xs px-3 py-2 rounded-lg border mt-2 ${
                            a.status === 'approved' ? 'bg-green-400/5 border-green-400/10 text-green-300' :
                            a.status === 'rejected' ? 'bg-red-400/5 border-red-400/10 text-red-300' :
                            'bg-gray-800/50 border-gray-700 text-gray-400'
                          }`}>
                            Admin Remark: {a.adminRemark}
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

      {/* ═══ APPLY MODAL ═══ */}
      <AnimatePresence>
        {applyModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setApplyModal(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-200 border border-gray-800 rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-white text-lg font-bold">Apply for Scholarship</h2>
                <button onClick={() => setApplyModal(null)} className="text-gray-500 hover:text-white"><FaTimes size={18} /></button>
              </div>
              <div className="mb-4 p-3 bg-dark-300 rounded-xl border border-gray-800">
                <p className="text-gold font-medium text-sm">{applyModal.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">₹{applyModal.amount.toLocaleString()} · {applyModal.category}</p>
              </div>
              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Why do you deserve this scholarship?</label>
                  <textarea value={applyForm.reason} onChange={e => setApplyForm(f => ({ ...f, reason: e.target.value }))} rows={3} className="input-field w-full" placeholder="Your reason for applying..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">CGPA (optional)</label>
                    <input type="number" step="0.01" min="0" max="10" value={applyForm.cgpa} onChange={e => setApplyForm(f => ({ ...f, cgpa: e.target.value }))} className="input-field w-full" placeholder="8.5" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Family Income ₹ (optional)</label>
                    <input type="number" min="0" value={applyForm.familyIncome} onChange={e => setApplyForm(f => ({ ...f, familyIncome: e.target.value }))} className="input-field w-full" placeholder="300000" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setApplyModal(null)} className="btn-outline-gold py-2 px-4 text-sm flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 px-4 text-sm flex-1 flex items-center justify-center gap-2">
                    <FaPaperPlane size={12} /> Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
