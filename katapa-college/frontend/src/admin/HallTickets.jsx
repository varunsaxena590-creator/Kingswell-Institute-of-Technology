// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: HallTickets.jsx (Admin Page)                         ║
// ║  PATH: frontend/src/admin/HallTickets.jsx                    ║
// ║                                                              ║
// ║  KYA HAI? → Admin exam hall tickets manage karne ka page.    ║
// ║  → Exams create, edit, delete karna.                        ║
// ║  → Students ko seats auto/manual assign karna.              ║
// ║  → Publish/unpublish toggle karna.                          ║
// ║  → Route: /admin/hall-tickets (admin only)                  ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTicketAlt, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck,
  FaEye, FaSearch, FaGlobe, FaChair, FaMagic,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const EXAM_TYPES = ['midterm', 'final', 'supplementary', 'practical'];

const emptyForm = {
  examName: '', examType: 'final', semester: '', course: '',
  startDate: '', endDate: '', reportTime: '09:00 AM', venue: '',
  subjects: '', instructions: 'Bring your student ID card. No electronic devices allowed.',
};

export default function HallTickets() {
  const [tickets,  setTickets]  = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [seatModal, setSeatModal] = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [tRes, cRes] = await Promise.all([
        api.get('/hall-tickets'),
        api.get('/courses'),
      ]);
      setTickets(tRes.data.data || []);
      setCourses(cRes.data.data || cRes.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filter ───────────────────────────────────────────────────
  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return !search ||
      t.examName.toLowerCase().includes(q) ||
      t.venue?.toLowerCase().includes(q) ||
      t.course?.title?.toLowerCase().includes(q);
  });

  // ── Form helpers ─────────────────────────────────────────────
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (t) => {
    setForm({
      examName: t.examName,
      examType: t.examType,
      semester: t.semester,
      course: t.course?._id || '',
      startDate: t.startDate?.slice(0, 10) || '',
      endDate: t.endDate?.slice(0, 10) || '',
      reportTime: t.reportTime || '09:00 AM',
      venue: t.venue,
      subjects: (t.subjects || []).join(', '),
      instructions: t.instructions || '',
    });
    setEditId(t._id);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.examName || !form.semester || !form.course || !form.startDate || !form.endDate || !form.venue) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (editId) {
        const { data } = await api.put(`/hall-tickets/${editId}`, payload);
        setTickets(prev => prev.map(t => t._id === editId ? data.data : t));
        toast.success('Hall ticket updated');
      } else {
        const { data } = await api.post('/hall-tickets', payload);
        setTickets(prev => [data.data, ...prev]);
        toast.success('Hall ticket created');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handlePublish = async (t) => {
    try {
      const { data } = await api.put(`/hall-tickets/${t._id}/publish`);
      setTickets(prev => prev.map(x => x._id === t._id ? { ...x, isPublished: data.data.isPublished } : x));
      toast.success(data.message);
    } catch { toast.error('Failed to toggle publish'); }
  };

  const handleAutoAssign = async (t) => {
    try {
      const { data } = await api.put(`/hall-tickets/${t._id}/auto-seats`);
      setTickets(prev => prev.map(x => x._id === t._id ? data.data : x));
      toast.success(`${data.assigned} seats auto-assigned`);
      setSeatModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Auto-assign failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hall ticket?')) return;
    try {
      await api.delete(`/hall-tickets/${id}`);
      setTickets(prev => prev.filter(t => t._id !== id));
      toast.success('Hall ticket deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-bold text-white text-2xl">Exam Hall Tickets</h2>
          <p className="text-gray-400 text-sm mt-1">Create exams, assign seats & publish hall tickets</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5">
          <FaPlus size={12} /> Create Exam
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Exams',  value: tickets.length, color: 'text-white' },
          { label: 'Published',    value: tickets.filter(t => t.isPublished).length, color: 'text-green-400' },
          { label: 'Draft',        value: tickets.filter(t => !t.isPublished).length, color: 'text-yellow-400' },
          { label: 'Total Seats',  value: tickets.reduce((a, t) => a + (t.seats?.length || 0), 0), color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-gray-500 text-xs uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold font-heading mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
        <input type="text" placeholder="Search by exam name, venue, or course..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm w-full" />
      </div>

      {/* Table */}
      <div className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Exam</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden sm:table-cell">Course</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden md:table-cell">Dates</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium">Seats</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden sm:table-cell">Status</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">Loading hall tickets...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">
                  <FaTicketAlt size={32} className="mx-auto mb-3 opacity-20" />
                  No hall tickets found
                </td></tr>
              ) : filtered.map((t, i) => (
                <motion.tr key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-800 hover:bg-dark-300/40 transition-colors">
                  <td className="py-4 px-5">
                    <p className="text-white text-sm font-medium">{t.examName}</p>
                    <p className="text-gray-500 text-xs capitalize">{t.examType} · {t.semester}</p>
                  </td>
                  <td className="py-4 px-3 hidden sm:table-cell">
                    <p className="text-gray-300 text-sm">{t.course?.title || '—'}</p>
                  </td>
                  <td className="py-4 px-3 hidden md:table-cell">
                    <p className="text-gray-400 text-xs">{fmtDate(t.startDate)} — {fmtDate(t.endDate)}</p>
                  </td>
                  <td className="py-4 px-3">
                    <span className="text-sm text-blue-400 font-medium">{t.seats?.length || 0}</span>
                  </td>
                  <td className="py-4 px-3 hidden sm:table-cell">
                    {t.isPublished
                      ? <span className="text-xs text-green-400 flex items-center gap-1"><FaCheck size={10} /> Published</span>
                      : <span className="text-xs text-yellow-400">Draft</span>}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewModal(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors" title="View">
                        <FaEye size={13} />
                      </button>
                      <button onClick={() => setSeatModal(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title="Assign Seats">
                        <FaChair size={13} />
                      </button>
                      <button onClick={() => handlePublish(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-colors" title="Toggle Publish">
                        <FaGlobe size={13} />
                      </button>
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors" title="Edit">
                        <FaEdit size={13} />
                      </button>
                      <button onClick={() => handleDelete(t._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
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
                  <h3 className="font-heading font-bold text-white text-xl">{viewModal.examName}</h3>
                  <p className="text-gray-400 text-sm capitalize">{viewModal.examType} · {viewModal.semester}</p>
                </div>
                <button onClick={() => setViewModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Course</span>
                  <span className="text-white">{viewModal.course?.title || '—'}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Venue</span>
                  <span className="text-white">{viewModal.venue}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Dates</span>
                  <span className="text-white">{fmtDate(viewModal.startDate)} — {fmtDate(viewModal.endDate)}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Report Time</span>
                  <span className="text-white">{viewModal.reportTime}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Seats Assigned</span>
                  <span className="text-blue-400 font-medium">{viewModal.seats?.length || 0}</span>
                </div>
                <div className="flex justify-between bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Published</span>
                  <span className={viewModal.isPublished ? 'text-green-400' : 'text-yellow-400'}>
                    {viewModal.isPublished ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {viewModal.subjects?.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {viewModal.subjects.map((s, i) => (
                      <span key={i} className="text-xs bg-gold/10 text-gold border border-gold/20 rounded-full px-3 py-1">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.seats?.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Seat Assignments</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {viewModal.seats.map((s, i) => (
                      <div key={i} className="flex justify-between text-xs bg-dark-300 rounded-lg px-3 py-2">
                        <span className="text-gray-300">
                          {s.student?.firstName} {s.student?.lastName}
                          <span className="text-gray-500 ml-1">({s.student?.admissionNumber || s.student?.email})</span>
                        </span>
                        <span className="text-blue-400 font-mono font-bold">{s.seatNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.instructions && (
                <p className="text-gray-400 text-sm bg-dark-300 rounded-xl px-4 py-3 mt-4">
                  <span className="text-gray-500">Instructions: </span>{viewModal.instructions}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seat Assignment Modal */}
      <AnimatePresence>
        {seatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-heading font-bold text-white text-xl">Assign Seats</h3>
                  <p className="text-gray-400 text-sm">{seatModal.examName}</p>
                </div>
                <button onClick={() => setSeatModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <div className="space-y-4">
                <div className="bg-dark-300 rounded-xl px-4 py-3 text-sm">
                  <p className="text-gray-400">Currently assigned: <span className="text-white font-bold">{seatModal.seats?.length || 0}</span> seats</p>
                  <p className="text-gray-400">Course: <span className="text-white">{seatModal.course?.title || '—'}</span></p>
                </div>

                <button onClick={() => handleAutoAssign(seatModal)}
                  className="w-full btn-gold flex items-center justify-center gap-2 py-3 text-sm">
                  <FaMagic size={14} /> Auto-Assign Seats (All Accepted Students)
                </button>

                <p className="text-gray-600 text-xs text-center">
                  Auto-assign will give seat numbers (S-001, S-002...) to all accepted students in this course.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-white text-xl">{editId ? 'Edit Exam' : 'Create Exam'}</h3>
                <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Exam Name *</label>
                    <input type="text" placeholder="e.g. Final Examination 2026" value={form.examName}
                      onChange={e => setForm(p => ({ ...p, examName: e.target.value }))} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Exam Type</label>
                    <select value={form.examType} onChange={e => setForm(p => ({ ...p, examType: e.target.value }))} className="input-field w-full capitalize">
                      {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Semester *</label>
                    <input type="text" placeholder="e.g. Semester 1 — 2026" value={form.semester}
                      onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Course *</label>
                    <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} className="input-field w-full">
                      <option value="">— Select Course —</option>
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Start Date *</label>
                    <input type="date" value={form.startDate}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">End Date *</label>
                    <input type="date" value={form.endDate}
                      onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Report Time</label>
                    <input type="text" placeholder="e.g. 09:00 AM" value={form.reportTime}
                      onChange={e => setForm(p => ({ ...p, reportTime: e.target.value }))} className="input-field w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1">Venue *</label>
                  <input type="text" placeholder="e.g. Exam Hall A, Block 3" value={form.venue}
                    onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} className="input-field w-full" />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1">Subjects (comma-separated)</label>
                  <input type="text" placeholder="e.g. Mathematics, Physics, Chemistry" value={form.subjects}
                    onChange={e => setForm(p => ({ ...p, subjects: e.target.value }))} className="input-field w-full" />
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1">Instructions</label>
                  <textarea rows={3} placeholder="Instructions for students..." value={form.instructions}
                    onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} className="input-field w-full resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl bg-dark-300 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-gold py-2.5 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : editId ? 'Update Exam' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
