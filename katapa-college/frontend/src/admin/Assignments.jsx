// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Assignments.jsx (Admin Page)                         ║
// ║  PATH: frontend/src/admin/Assignments.jsx                    ║
// ║                                                              ║
// ║  KYA HAI? → Admin assignment/homework management page.       ║
// ║  → Assignment create, update, delete karna.                 ║
// ║  → Student submissions dekhna aur grade karna.              ║
// ║  → Summary: total, active, submissions, graded.             ║
// ║  → Route: /admin/assignments (admin only)                   ║
// ╚══════════════════════════════════════════════════════════════╝
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClipboardCheck, FaPlus, FaSearch, FaTimes, FaPen, FaTrash,
  FaChevronDown, FaChevronUp, FaCheck, FaClock, FaExclamationTriangle,
  FaStar, FaEye, FaFileCsv,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

// ── helpers ────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const TYPE_COLORS = {
  homework:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  assignment: 'bg-gold/10 text-gold border-gold/20',
  project:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  lab:        'bg-green-500/10 text-green-400 border-green-500/20',
  quiz:       'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const SUB_STATUS = {
  submitted: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  graded:    'bg-green-500/10 text-green-400 border-green-500/20',
  late:      'bg-red-500/10 text-red-400 border-red-500/20',
};

const TYPES = ['homework', 'assignment', 'project', 'lab', 'quiz'];

const emptyForm = {
  title: '', description: '', course: '', subject: '', dueDate: '', totalMarks: 100, type: 'assignment',
};

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);

  // filters
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // modals
  const [addModal,   setAddModal]   = useState(false);
  const [editModal,  setEditModal]  = useState(null);
  const [subsModal,  setSubsModal]  = useState(null);    // assignment obj — view submissions
  const [gradeModal, setGradeModal] = useState(null);    // { assignment, submission }
  const [detailRow,  setDetailRow]  = useState(null);

  // forms
  const [form,      setForm]      = useState(emptyForm);
  const [editForm,  setEditForm]  = useState({});
  const [gradeForm, setGradeForm] = useState({ marks: '', feedback: '' });
  const [saving,    setSaving]    = useState(false);

  // ── fetch ────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, cRes, sRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/courses'),
        api.get('/assignments/stats'),
      ]);
      setAssignments(aRes.data?.data || []);
      setCourses(cRes.data?.data || cRes.data || []);
      setStats(sRes.data?.data || null);
    } catch {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── filter ───────────────────────────────────────────────────
  const filtered = assignments.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !search || a.title.toLowerCase().includes(q) || (a.subject || '').toLowerCase().includes(q) || (a.course?.title || '').toLowerCase().includes(q);
    const matchType   = !typeFilter || a.type === typeFilter;
    const matchCourse = !courseFilter || (a.course?._id === courseFilter);
    return matchSearch && matchType && matchCourse;
  });

  // ── create ───────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.course || !form.dueDate) {
      return toast.error('Title, description, course aur due date required hain');
    }
    setSaving(true);
    try {
      await api.post('/assignments', { ...form, totalMarks: Number(form.totalMarks) || 100 });
      toast.success('Assignment created!');
      setAddModal(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally { setSaving(false); }
  };

  // ── update ───────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/assignments/${editModal._id}`, { ...editForm, totalMarks: Number(editForm.totalMarks) || 100 });
      toast.success('Assignment updated');
      setEditModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  // ── delete ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
  };

  // ── grade submission ─────────────────────────────────────────
  const handleGrade = async (e) => {
    e.preventDefault();
    if (gradeForm.marks === '' || gradeForm.marks === null) return toast.error('Marks required hain');
    setSaving(true);
    try {
      await api.put(`/assignments/${gradeModal.assignment._id}/grade/${gradeModal.submission._id}`, {
        marks: Number(gradeForm.marks),
        feedback: gradeForm.feedback,
      });
      toast.success('Submission graded!');
      setGradeModal(null);
      setGradeForm({ marks: '', feedback: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Grading failed');
    } finally { setSaving(false); }
  };

  // ── open edit modal ──────────────────────────────────────────
  const openEdit = (a) => {
    setEditForm({
      title: a.title, description: a.description,
      course: a.course?._id || '', subject: a.subject || '',
      dueDate: a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '',
      totalMarks: a.totalMarks, type: a.type, isActive: a.isActive,
    });
    setEditModal(a);
  };

  // ── CSV export ───────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Title', 'Course', 'Type', 'Due Date', 'Total Marks', 'Submissions', 'Graded', 'Active'];
    const rows = filtered.map(a => [
      a.title, a.course?.title || '', a.type, fmtDate(a.dueDate),
      a.totalMarks, a.submissionCount, a.gradedCount, a.isActive ? 'Yes' : 'No',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'assignments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ════════════════════════ RENDER ═════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
            <FaClipboardCheck className="text-gold" /> Assignments & Homework
          </h1>
          <p className="text-gray-400 text-sm mt-1">Create assignments, view submissions, grade students</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-300 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 transition-all text-sm">
            <FaFileCsv size={14} /> Export
          </button>
          <button onClick={() => { setForm(emptyForm); setAddModal(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-dark font-semibold hover:shadow-lg hover:shadow-gold/20 transition-all text-sm">
            <FaPlus size={13} /> New Assignment
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total',          value: stats.total,          color: 'text-white' },
            { label: 'Active',         value: stats.active,         color: 'text-green-400' },
            { label: 'Past Due',       value: stats.pastDue,        color: 'text-red-400' },
            { label: 'Submissions',    value: stats.totalSubs,      color: 'text-blue-400' },
            { label: 'Graded',         value: stats.totalGraded,    color: 'text-gold' },
            { label: 'Pending Grade',  value: stats.pendingGrading, color: 'text-yellow-400' },
          ].map(c => (
            <div key={c.label} className="bg-dark-200 rounded-2xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, subject, course..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-200 text-white border border-gray-700 focus:border-gold/50 outline-none text-sm" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-dark-200 text-white border border-gray-700 text-sm outline-none">
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-dark-200 text-white border border-gray-700 text-sm outline-none">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FaClipboardCheck size={48} className="mx-auto mb-4 opacity-30" />
          <p>No assignments found</p>
        </div>
      ) : (
        <div className="bg-dark-200 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-4">Title</th>
                  <th className="text-left px-4 py-4">Course</th>
                  <th className="text-left px-4 py-4">Type</th>
                  <th className="text-left px-4 py-4">Due Date</th>
                  <th className="text-center px-4 py-4">Marks</th>
                  <th className="text-center px-4 py-4">Submissions</th>
                  <th className="text-center px-4 py-4">Graded</th>
                  <th className="text-center px-4 py-4">Active</th>
                  <th className="text-center px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const isPastDue = new Date() > new Date(a.dueDate);
                  return (
                    <React.Fragment key={a._id}>
                      <tr className="border-b border-gray-800/50 hover:bg-dark-300/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-white font-medium">{a.title}</p>
                          {a.subject && <p className="text-gray-500 text-xs">{a.subject}</p>}
                        </td>
                        <td className="px-4 py-4 text-gray-300">{a.course?.title || '—'}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${TYPE_COLORS[a.type] || ''}`}>
                            {a.type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={isPastDue ? 'text-red-400' : 'text-gray-300'}>{fmtDate(a.dueDate)}</span>
                          {isPastDue && <span className="text-red-400 text-xs ml-1">(overdue)</span>}
                        </td>
                        <td className="px-4 py-4 text-center text-white font-medium">{a.totalMarks}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-blue-400 font-medium">{a.submissionCount}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-green-400 font-medium">{a.gradedCount}</span>
                          <span className="text-gray-600">/{a.submissionCount}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex w-2.5 h-2.5 rounded-full ${a.isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setDetailRow(detailRow === a._id ? null : a._id)} className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors" title="Details">
                              {detailRow === a._id ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                            </button>
                            {a.submissionCount > 0 && (
                              <button onClick={() => setSubsModal(a)} className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors" title="View Submissions">
                                <FaEye size={12} />
                              </button>
                            )}
                            <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                              <FaPen size={12} />
                            </button>
                            <button onClick={() => handleDelete(a._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* ── Detail expanded row ── */}
                      <AnimatePresence>
                        {detailRow === a._id && (
                          <tr>
                            <td colSpan={9} className="p-0">
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-6 py-5 bg-dark-300/50 space-y-3 text-sm">
                                  <div>
                                    <span className="text-gray-500 text-xs block">Description</span>
                                    <p className="text-gray-300 whitespace-pre-wrap">{a.description}</p>
                                  </div>
                                  <div className="flex gap-6">
                                    <div><span className="text-gray-500 text-xs block">Assigned</span><span className="text-white">{fmtDate(a.assignedDate)}</span></div>
                                    <div><span className="text-gray-500 text-xs block">Created By</span><span className="text-white">{a.createdBy?.name || '—'}</span></div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-800 text-xs text-gray-500">
            Showing {filtered.length} of {assignments.length} assignments
          </div>
        </div>
      )}

      {/* ══════════════════ ADD MODAL ══════════════════ */}
      <AnimatePresence>
        {addModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaPlus className="text-gold" /> New Assignment</h3>
                <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Data Structures Assignment 3"
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Description *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Assignment ke instructions likho..."
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none resize-none focus:border-gold/50" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Course *</label>
                    <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required>
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Subject (optional)</label>
                    <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Operating Systems"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Type</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none">
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Total Marks</label>
                    <input type="number" min="1" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Due Date *</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl bg-gold-gradient text-dark font-bold hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Assignment'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ EDIT MODAL ══════════════════ */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaPen className="text-blue-400" /> Edit Assignment</h3>
                <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Title</label>
                  <input value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Description</label>
                  <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Course</label>
                    <select value={editForm.course || ''} onChange={e => setEditForm({ ...editForm, course: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none">
                      <option value="">Select</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Subject</label>
                    <input value={editForm.subject || ''} onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Type</label>
                    <select value={editForm.type || 'assignment'} onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none">
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Total Marks</label>
                    <input type="number" min="1" value={editForm.totalMarks ?? 100} onChange={e => setEditForm({ ...editForm, totalMarks: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Due Date</label>
                    <input type="date" value={editForm.dueDate || ''} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-400">Active:</label>
                  <button type="button" onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${editForm.isActive ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${editForm.isActive ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Update Assignment'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ SUBMISSIONS MODAL ══════════════════ */}
      <AnimatePresence>
        {subsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaEye className="text-blue-400" /> Submissions</h3>
                  <p className="text-gray-400 text-xs mt-1">{subsModal.title} — {subsModal.submissions?.length || 0} submissions</p>
                </div>
                <button onClick={() => setSubsModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="p-4 space-y-3">
                {(!subsModal.submissions || subsModal.submissions.length === 0) ? (
                  <p className="text-center text-gray-500 py-8">No submissions yet</p>
                ) : (
                  subsModal.submissions.map(sub => (
                    <div key={sub._id} className="bg-dark-300 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-white font-medium text-sm">
                              {sub.student?.firstName} {sub.student?.lastName}
                            </p>
                            <span className="text-gray-500 text-xs">{sub.student?.admissionNumber}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SUB_STATUS[sub.status] || ''}`}>
                              {sub.status}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm whitespace-pre-wrap mb-2">{sub.content}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Submitted: {fmtDate(sub.submittedAt)}</span>
                            {sub.status === 'graded' && (
                              <>
                                <span className="text-gold font-medium">Marks: {sub.marks}/{subsModal.totalMarks}</span>
                                {sub.feedback && <span className="text-gray-400">Feedback: {sub.feedback}</span>}
                              </>
                            )}
                          </div>
                        </div>
                        {sub.status !== 'graded' && (
                          <button onClick={() => { setGradeForm({ marks: '', feedback: '' }); setGradeModal({ assignment: subsModal, submission: sub }); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20 text-xs font-medium hover:bg-gold/20 transition-colors shrink-0">
                            <FaStar size={10} /> Grade
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ GRADE MODAL ══════════════════ */}
      <AnimatePresence>
        {gradeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-700 w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaStar className="text-gold" /> Grade Submission</h3>
                <button onClick={() => setGradeModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="px-6 py-3 bg-dark-300/50 text-sm">
                <p className="text-gray-400">Student: <span className="text-white">{gradeModal.submission?.student?.firstName} {gradeModal.submission?.student?.lastName}</span></p>
                <p className="text-gray-400">Total Marks: <span className="text-gold font-semibold">{gradeModal.assignment?.totalMarks}</span></p>
              </div>
              <form onSubmit={handleGrade} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Marks * (out of {gradeModal.assignment?.totalMarks})</label>
                  <input type="number" min="0" max={gradeModal.assignment?.totalMarks} value={gradeForm.marks}
                    onChange={e => setGradeForm({ ...gradeForm, marks: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Feedback (optional)</label>
                  <textarea value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} rows={3}
                    placeholder="Good work! / Needs improvement..."
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none resize-none" />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl bg-gold-gradient text-dark font-bold hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50">
                  {saving ? 'Grading...' : 'Submit Grade'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
