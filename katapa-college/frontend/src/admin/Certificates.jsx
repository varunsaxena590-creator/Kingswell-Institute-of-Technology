// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Certificates.jsx (Admin Page)                        ║
// ║  PATH: frontend/src/admin/Certificates.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Admin certificate generator & management page.  ║
// ║  → Generate certificates for students.                      ║
// ║  → View all, filter by type/status, revoke, delete.         ║
// ║  → Verify by certificate number.                            ║
// ║  → Route: /admin/certificates                                ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCertificate, FaPlus, FaTimes, FaTrash, FaBan,
  FaSearch, FaCheckCircle, FaTimesCircle, FaUser,
} from 'react-icons/fa';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const TYPES = ['course-completion', 'merit', 'participation', 'character', 'transfer', 'bonafide', 'other'];

const TYPE_COLORS = {
  'course-completion': 'bg-blue-400/15 text-blue-400 border-blue-400/20',
  merit:              'bg-gold/15 text-gold border-gold/20',
  participation:      'bg-purple-400/15 text-purple-400 border-purple-400/20',
  character:          'bg-green-400/15 text-green-400 border-green-400/20',
  transfer:           'bg-orange-400/15 text-orange-400 border-orange-400/20',
  bonafide:           'bg-cyan-400/15 text-cyan-400 border-cyan-400/20',
  other:              'bg-gray-400/15 text-gray-400 border-gray-400/20',
};

const blankForm = {
  studentId: '', type: 'course-completion', title: '', description: '',
  issueDate: '', validUntil: '', grade: '', courseName: '', semester: '',
};

export default function Certificates() {
  const [certs, setCerts]       = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...blankForm });
  const [filterType, setFilterType]     = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch]             = useState('');
  const [revokeModal, setRevokeModal]   = useState(null);
  const [revokeReason, setRevokeReason] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [certRes, stuRes] = await Promise.all([
        api.get('/certificates'),
        api.get('/students'),
      ]);
      setCerts(certRes.data.data || []);
      setStudents((stuRes.data.data || stuRes.data || []).filter(s => s.status === 'accepted'));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.title) { toast.error('Student and title are required'); return; }
    try {
      const { data } = await api.post('/certificates', form);
      toast.success('Certificate generated!');
      setForm({ ...blankForm });
      setShowForm(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRevoke = async () => {
    if (!revokeModal) return;
    try {
      await api.put(`/certificates/${revokeModal}/revoke`, { reason: revokeReason });
      toast.success('Certificate revoked');
      setRevokeModal(null);
      setRevokeReason('');
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate permanently?')) return;
    try {
      await api.delete(`/certificates/${id}`);
      setCerts(prev => prev.filter(c => c._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  // Filter
  const filtered = certs.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = c.student ? `${c.student.firstName} ${c.student.lastName}`.toLowerCase() : '';
      return name.includes(q) || c.certificateNo.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    total: certs.length,
    active: certs.filter(c => c.status === 'active').length,
    revoked: certs.filter(c => c.status === 'revoked').length,
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading certificates...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
            <FaCertificate className="text-gold" /> Certificate Generator
          </h1>
          <p className="text-gray-500 text-sm mt-1">Generate, manage & verify student certificates</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className={`py-2 px-5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border ${
            showForm ? 'bg-dark-200 text-gray-400 border-gray-700' : 'btn-gold'
          }`}>
          {showForm ? <><FaTimes size={12} /> Cancel</> : <><FaPlus size={12} /> Generate Certificate</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', val: stats.total, color: 'text-gold' },
          { label: 'Active', val: stats.active, color: 'text-green-400' },
          { label: 'Revoked', val: stats.revoked, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-dark-200 border border-gray-800 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ═══ GENERATE FORM ═══ */}
      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handleGenerate} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-dark-200 border border-gray-800 rounded-2xl p-6 space-y-4 overflow-hidden">
            <h2 className="text-gold text-sm font-bold uppercase tracking-widest">Generate New Certificate</h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Student *</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} required className="input-field w-full">
                  <option value="">— Select Student —</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.enrollmentNumber || s.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field w-full">
                  {TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="input-field w-full" placeholder="e.g. Certificate of Course Completion — B.Tech CSE" />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="input-field w-full" placeholder="Optional details..." />
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Course Name</label>
                <input value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} className="input-field w-full" placeholder="B.Tech CSE" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Semester</label>
                <input value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} className="input-field w-full" placeholder="6th" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Grade</label>
                <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="input-field w-full" placeholder="A+" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Issue Date</label>
                <input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} className="input-field w-full" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Valid Until</label>
                <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="input-field w-full" />
              </div>
            </div>

            <button type="submit" className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2">
              <FaCertificate size={14} /> Generate Certificate
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, cert no, title..."
            className="input-field w-full pl-8 text-sm" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-field text-sm">
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <FaCertificate size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-white text-lg">No certificates found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`bg-dark-200 border rounded-xl p-4 transition-colors ${
                c.status === 'revoked' ? 'border-red-500/20 opacity-70' : 'border-gray-800'
              }`}>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  c.status === 'revoked' ? 'bg-red-400/10 text-red-400' : 'bg-gold/10 text-gold'
                }`}>
                  <FaCertificate size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-gold text-[10px] font-mono font-bold">{c.certificateNo}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[c.type] || TYPE_COLORS.other}`}>
                      {c.type.replace(/-/g, ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      c.status === 'active'
                        ? 'bg-green-400/10 text-green-400 border-green-400/20'
                        : 'bg-red-400/10 text-red-400 border-red-400/20'
                    }`}>
                      {c.status === 'active' ? <FaCheckCircle size={8} /> : <FaTimesCircle size={8} />} {c.status}
                    </span>
                  </div>

                  <h3 className="text-white font-medium text-sm">{c.title}</h3>

                  {c.student && (
                    <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                      <FaUser size={9} /> {c.student.firstName} {c.student.lastName}
                      {c.student.enrollmentNumber && ` — ${c.student.enrollmentNumber}`}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-gray-600">
                    {c.courseName && <span>Course: {c.courseName}</span>}
                    {c.semester && <span>Sem: {c.semester}</span>}
                    {c.grade && <span>Grade: {c.grade}</span>}
                    <span>Issued: {fmtDate(c.issueDate)}</span>
                    {c.validUntil && <span>Valid Until: {fmtDate(c.validUntil)}</span>}
                  </div>

                  {c.description && <p className="text-gray-600 text-xs mt-1">{c.description}</p>}
                  {c.revokedReason && <p className="text-red-400/70 text-xs mt-1">Revoke reason: {c.revokedReason}</p>}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {c.status === 'active' && (
                    <button onClick={() => { setRevokeModal(c._id); setRevokeReason(''); }}
                      className="p-2 rounded-lg text-orange-400 hover:bg-orange-400/10 transition-colors" title="Revoke">
                      <FaBan size={13} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(c._id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                    <FaTrash size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Revoke Modal */}
      <AnimatePresence>
        {revokeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setRevokeModal(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-white font-bold flex items-center gap-2"><FaBan className="text-orange-400" /> Revoke Certificate</h3>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Reason (optional)</label>
                <textarea value={revokeReason} onChange={e => setRevokeReason(e.target.value)} rows={3} className="input-field w-full" placeholder="Reason for revoking..." />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setRevokeModal(null)} className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-400 text-sm">Cancel</button>
                <button onClick={handleRevoke} className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium">Revoke</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
