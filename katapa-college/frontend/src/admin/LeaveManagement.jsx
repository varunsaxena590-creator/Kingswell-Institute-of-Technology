// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: LeaveManagement.jsx (Admin Page)                     ║
// ║  PATH: frontend/src/admin/LeaveManagement.jsx                ║
// ║                                                              ║
// ║  KYA HAI? → Admin student leave applications manage karta   ║
// ║    hai yaha pe.                                             ║
// ║  → Pending/Approved/Rejected filter karna.                  ║
// ║  → Approve ya reject karna with optional remark.            ║
// ║  → Delete karna.                                            ║
// ║  → Route: /admin/leaves (admin only)                        ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClipboardList, FaSearch, FaCheck, FaTimes, FaTrash,
  FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const STATUS_BADGE = {
  pending:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  approved: 'text-green-400 bg-green-400/10 border-green-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const LEAVE_TYPE_LABEL = {
  sick: 'Sick Leave',
  casual: 'Casual Leave',
  family: 'Family Emergency',
  academic: 'Academic',
  other: 'Other',
};

export default function LeaveManagement() {
  const [leaves,  setLeaves]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewModal, setViewModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const { data } = await api.get('/leaves');
      setLeaves(data.data || []);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filter ───────────────────────────────────────────────────
  const filtered = leaves.filter(l => {
    const q = search.toLowerCase();
    const name = `${l.student?.firstName || ''} ${l.student?.lastName || ''}`.toLowerCase();
    const adm = (l.student?.admissionNumber || '').toLowerCase();
    const matchSearch = !search || name.includes(q) || adm.includes(q) || l.subject.toLowerCase().includes(q);
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Review (approve / reject) ────────────────────────────────
  const handleReview = async (status) => {
    if (!reviewModal) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/leaves/${reviewModal._id}/review`, { status, adminRemark: remark });
      setLeaves(prev => prev.map(l => l._id === reviewModal._id ? { ...reviewModal, ...data.data } : l));
      toast.success(`Leave ${status}`);
      setReviewModal(null);
      setRemark('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave application?')) return;
    try {
      await api.delete(`/leaves/${id}`);
      setLeaves(prev => prev.filter(l => l._id !== id));
      toast.success('Leave deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const totalDays = (l) => {
    if (!l.startDate || !l.endDate) return 0;
    return Math.ceil((new Date(l.endDate) - new Date(l.startDate)) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-bold text-white text-2xl">Leave Applications</h2>
          <p className="text-gray-400 text-sm mt-1">Review and manage student leave requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',    value: leaves.length, color: 'text-white', icon: FaClipboardList },
          { label: 'Pending',  value: leaves.filter(l => l.status === 'pending').length, color: 'text-yellow-400', icon: FaClock },
          { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: 'text-green-400', icon: FaCheckCircle },
          { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: 'text-red-400', icon: FaTimesCircle },
        ].map(s => (
          <div key={s.label} className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-gray-500 text-xs uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold font-heading mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
          <input type="text" placeholder="Search by name, ADM no, or subject..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-sm sm:w-48">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Student</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium">Subject</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden md:table-cell">Type</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden sm:table-cell">Dates</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium">Status</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">Loading leave applications...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">
                  <FaClipboardList size={32} className="mx-auto mb-3 opacity-20" />
                  No leave applications found
                </td></tr>
              ) : filtered.map((l, i) => (
                <motion.tr key={l._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-800 hover:bg-dark-300/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                        {l.student?.firstName?.[0]}{l.student?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{l.student?.firstName} {l.student?.lastName}</p>
                        <p className="text-gray-500 text-xs">{l.student?.admissionNumber || l.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <p className="text-gray-300 text-sm truncate max-w-[180px]">{l.subject}</p>
                  </td>
                  <td className="py-4 px-3 hidden md:table-cell">
                    <span className="text-xs capitalize text-gray-400">{LEAVE_TYPE_LABEL[l.leaveType] || l.leaveType}</span>
                  </td>
                  <td className="py-4 px-3 hidden sm:table-cell">
                    <p className="text-gray-400 text-xs">{fmtDate(l.startDate)} — {fmtDate(l.endDate)}</p>
                    <p className="text-gray-600 text-xs">{totalDays(l)} day{totalDays(l) > 1 ? 's' : ''}</p>
                  </td>
                  <td className="py-4 px-3">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_BADGE[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewModal(l)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors" title="View">
                        <FaEye size={13} />
                      </button>
                      {l.status === 'pending' && (
                        <button onClick={() => { setReviewModal(l); setRemark(''); }} className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-colors" title="Review">
                          <FaCheckCircle size={13} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(l._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-bold text-white text-xl">Leave Details</h3>
                  <p className="text-gray-400 text-sm">{viewModal.student?.firstName} {viewModal.student?.lastName}</p>
                </div>
                <button onClick={() => setViewModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Subject</span>
                  <span className="text-white text-right max-w-[60%]">{viewModal.subject}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Leave Type</span>
                  <span className="text-white capitalize">{LEAVE_TYPE_LABEL[viewModal.leaveType] || viewModal.leaveType}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Dates</span>
                  <span className="text-white">{fmtDate(viewModal.startDate)} — {fmtDate(viewModal.endDate)}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Duration</span>
                  <span className="text-blue-400 font-medium">{totalDays(viewModal)} day{totalDays(viewModal) > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_BADGE[viewModal.status]}`}>
                    {viewModal.status}
                  </span>
                </div>
                <div className="bg-dark-300 rounded-xl px-4 py-3">
                  <p className="text-gray-500 text-xs mb-1">Reason</p>
                  <p className="text-gray-200">{viewModal.reason}</p>
                </div>
                {viewModal.adminRemark && (
                  <div className="bg-dark-300 rounded-xl px-4 py-3">
                    <p className="text-gray-500 text-xs mb-1">Admin Remark</p>
                    <p className="text-gray-200">{viewModal.adminRemark}</p>
                  </div>
                )}
                <p className="text-gray-600 text-xs text-center pt-2">
                  Applied on {fmtDate(viewModal.createdAt)}
                  {viewModal.reviewedAt && ` · Reviewed on ${fmtDate(viewModal.reviewedAt)}`}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review (Approve/Reject) Modal */}
      <AnimatePresence>
        {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-bold text-white text-xl">Review Leave</h3>
                  <p className="text-gray-400 text-sm">{reviewModal.student?.firstName} {reviewModal.student?.lastName} — {reviewModal.subject}</p>
                </div>
                <button onClick={() => setReviewModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="bg-dark-300 rounded-xl px-4 py-3 mb-4 text-sm">
                <p className="text-gray-400"><span className="text-gray-500">Type:</span> {LEAVE_TYPE_LABEL[reviewModal.leaveType]}</p>
                <p className="text-gray-400"><span className="text-gray-500">Dates:</span> {fmtDate(reviewModal.startDate)} — {fmtDate(reviewModal.endDate)} ({totalDays(reviewModal)} days)</p>
                <p className="text-gray-400 mt-2"><span className="text-gray-500">Reason:</span> {reviewModal.reason}</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 text-xs mb-1">Admin Remark (optional)</label>
                <textarea rows={3} placeholder="Add a remark..." value={remark}
                  onChange={e => setRemark(e.target.value)} className="input-field w-full resize-none text-sm" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleReview('rejected')} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50">
                  <FaTimesCircle size={14} /> Reject
                </button>
                <button onClick={() => handleReview('approved')} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50">
                  <FaCheckCircle size={14} /> Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
