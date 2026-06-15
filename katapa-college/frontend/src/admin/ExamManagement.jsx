// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: ExamManagement.jsx                                   ║
// ║  PATH: frontend/src/admin/ExamManagement.jsx                ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → Admin panel mein Online Exams manage karne ka page        ║
// ║  → Create, edit, delete MCQ exams                            ║
// ║  → View submissions & results                                ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus, FaTimes, FaEdit, FaTrash, FaSearch, FaEye,
  FaClipboardCheck, FaQuestionCircle, FaClock, FaUsers,
  FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const emptyQuestion = { questionText: '', options: ['', '', '', ''], correctOption: 0, marks: 1 };

const emptyForm = {
  title: '', description: '', course: '', subject: '', duration: 60,
  totalMarks: 100, passingMarks: 40, questions: [{ ...emptyQuestion }],
  startTime: '', endTime: '', isPublished: false,
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [subsModal, setSubsModal] = useState(false);
  const [detailExam, setDetailExam] = useState(null);

  // Forms
  const [form, setForm] = useState({ ...emptyForm, questions: [{ ...emptyQuestion }] });
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  /* ── Fetch ──────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    try {
      const [exRes, cRes, sRes] = await Promise.all([
        api.get('/exams'),
        api.get('/courses'),
        api.get('/exams/stats'),
      ]);
      setExams(exRes.data.data || []);
      setCourses(cRes.data.data || cRes.data || []);
      setStats(sRes.data.data || {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Create ─────────────────────────────────── */
  const handleCreate = async () => {
    if (!form.title || !form.course || !form.subject || !form.startTime || !form.endTime) {
      return toast.error('Fill all required fields');
    }
    if (form.questions.length === 0) return toast.error('Add at least one question');
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.questionText || q.options.some(o => !o.trim())) {
        return toast.error(`Complete question ${i + 1}`);
      }
    }
    setSaving(true);
    try {
      await api.post('/exams', form);
      toast.success('Exam created!');
      setAddModal(false);
      setForm({ ...emptyForm, questions: [{ ...emptyQuestion }] });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  /* ── Update ─────────────────────────────────── */
  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/exams/${editForm._id}`, editForm);
      toast.success('Exam updated!');
      setEditModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ─────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam deleted');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  /* ── Submissions ────────────────────────────── */
  const viewSubmissions = async (id) => {
    try {
      const { data } = await api.get(`/exams/${id}`);
      setDetailExam(data.data);
      setSubsModal(true);
    } catch (err) {
      toast.error('Failed to load submissions');
    }
  };

  /* ── Question helpers ───────────────────────── */
  const addQuestion = (formSetter, formVal) => {
    formSetter({ ...formVal, questions: [...formVal.questions, { ...emptyQuestion }] });
  };
  const removeQuestion = (formSetter, formVal, idx) => {
    const qs = formVal.questions.filter((_, i) => i !== idx);
    formSetter({ ...formVal, questions: qs });
  };
  const updateQuestion = (formSetter, formVal, idx, field, value) => {
    const qs = [...formVal.questions];
    qs[idx] = { ...qs[idx], [field]: value };
    formSetter({ ...formVal, questions: qs });
  };
  const updateOption = (formSetter, formVal, qIdx, oIdx, value) => {
    const qs = [...formVal.questions];
    const opts = [...qs[qIdx].options];
    opts[oIdx] = value;
    qs[qIdx] = { ...qs[qIdx], options: opts };
    formSetter({ ...formVal, questions: qs });
  };

  /* ── Filter ─────────────────────────────────── */
  const filtered = exams.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.subject?.toLowerCase().includes(q);
    const matchCourse = !courseFilter || (e.course?._id || e.course) === courseFilter;
    return matchSearch && matchCourse;
  });

  /* ── Stat Cards ─────────────────────────────── */
  const statCards = [
    { label: 'Total Exams', value: stats.total || 0, icon: FaClipboardCheck, color: 'blue' },
    { label: 'Published', value: stats.published || 0, icon: FaCheckCircle, color: 'green' },
    { label: 'Active Now', value: stats.active || 0, icon: FaClock, color: 'yellow' },
    { label: 'Submissions', value: stats.totalSubmissions || 0, icon: FaUsers, color: 'purple' },
  ];
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 text-green-400 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 text-yellow-400 border-yellow-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30',
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold" /></div>;

  /* ── Question Form Block (reused for add/edit) ── */
  const QuestionBlock = ({ qs, formVal, formSetter }) => (
    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
      {qs.map((q, idx) => (
        <div key={idx} className="bg-dark-card/50 rounded-xl p-4 border border-gold/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gold font-semibold text-sm">Q{idx + 1}</span>
            {qs.length > 1 && (
              <button onClick={() => removeQuestion(formSetter, formVal, idx)} className="text-red-400 hover:text-red-300 text-xs">
                <FaTrash />
              </button>
            )}
          </div>
          <input
            className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:border-gold outline-none"
            placeholder="Question text..."
            value={q.questionText}
            onChange={e => updateQuestion(formSetter, formVal, idx, 'questionText', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${idx}`}
                  checked={q.correctOption === oi}
                  onChange={() => updateQuestion(formSetter, formVal, idx, 'correctOption', oi)}
                  className="accent-gold"
                />
                <input
                  className="flex-1 bg-dark-lighter border border-gold/20 rounded-lg px-2 py-1.5 text-white text-sm focus:border-gold outline-none"
                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  value={opt}
                  onChange={e => updateOption(formSetter, formVal, idx, oi, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-xs">Marks:</label>
            <input
              type="number" min="1"
              className="w-16 bg-dark-lighter border border-gold/20 rounded px-2 py-1 text-white text-sm focus:border-gold outline-none"
              value={q.marks}
              onChange={e => updateQuestion(formSetter, formVal, idx, 'marks', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      ))}
      <button onClick={() => addQuestion(formSetter, formVal)} className="w-full py-2 border-2 border-dashed border-gold/30 rounded-xl text-gold/60 hover:text-gold hover:border-gold/60 transition text-sm flex items-center justify-center gap-2">
        <FaPlus size={12} /> Add Question
      </button>
    </div>
  );

  /* ── Exam Form Fields (reused) ── */
  const FormFields = ({ f, setter }) => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Title *</label>
          <input className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none" value={f.title} onChange={e => setter({ ...f, title: e.target.value })} />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Subject *</label>
          <input className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none" value={f.subject} onChange={e => setter({ ...f, subject: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="text-gray-400 text-xs mb-1 block">Description</label>
        <textarea rows={2} className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none resize-none" value={f.description} onChange={e => setter({ ...f, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Course *</label>
          <select className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none" value={f.course} onChange={e => setter({ ...f, course: e.target.value })}>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Duration (min) *</label>
          <input type="number" min="1" className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none" value={f.duration} onChange={e => setter({ ...f, duration: parseInt(e.target.value) || 60 })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Total Marks *</label>
          <input type="number" min="1" className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none" value={f.totalMarks} onChange={e => setter({ ...f, totalMarks: parseInt(e.target.value) || 100 })} />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Passing Marks *</label>
          <input type="number" min="1" className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none" value={f.passingMarks} onChange={e => setter({ ...f, passingMarks: parseInt(e.target.value) || 40 })} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" checked={f.isPublished} onChange={e => setter({ ...f, isPublished: e.target.checked })} className="accent-gold" />
            Publish
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-400 text-xs mb-1 block">Start Time *</label>
          <input type="datetime-local" className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none" value={f.startTime?.slice?.(0, 16) || f.startTime} onChange={e => setter({ ...f, startTime: e.target.value })} />
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1 block">End Time *</label>
          <input type="datetime-local" className="w-full bg-dark-lighter border border-gold/20 rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none" value={f.endTime?.slice?.(0, 16) || f.endTime} onChange={e => setter({ ...f, endTime: e.target.value })} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">📝 Online Exams</h1>
          <p className="text-gray-400 text-sm mt-1">Create & manage MCQ exams for students</p>
        </div>
        <button onClick={() => setAddModal(true)} className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-dark font-semibold px-4 py-2 rounded-xl transition text-sm">
          <FaPlus /> Create Exam
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${colorMap[s.color]} border rounded-xl p-4`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value}</p>
              </div>
              <s.icon size={24} className="opacity-60" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input className="w-full bg-dark-card border border-gold/20 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-gold outline-none" placeholder="Search exams..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="bg-dark-card border border-gold/20 rounded-xl px-4 py-2.5 text-white text-sm focus:border-gold outline-none" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {/* Exams Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FaClipboardCheck size={48} className="mx-auto mb-4 opacity-30" />
          <p>No exams found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ex, i) => {
            const now = new Date();
            const isUpcoming = now < new Date(ex.startTime);
            const isOngoing = now >= new Date(ex.startTime) && now <= new Date(ex.endTime);
            const isExpired = now > new Date(ex.endTime);
            const badge = isOngoing ? { text: 'LIVE', cls: 'bg-green-500/20 text-green-400 border-green-500/30' }
              : isUpcoming ? { text: 'UPCOMING', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
              : { text: 'ENDED', cls: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };

            return (
              <motion.div key={ex._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-dark-card border border-gold/10 rounded-xl p-4 hover:border-gold/30 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold truncate">{ex.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${badge.cls}`}>{badge.text}</span>
                      {ex.isPublished && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">PUBLISHED</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-400">
                      <span>📚 {ex.course?.name || 'N/A'}</span>
                      <span>📖 {ex.subject}</span>
                      <span>⏱ {ex.duration} min</span>
                      <span>📊 {ex.totalMarks} marks (pass: {ex.passingMarks})</span>
                      <span>❓ {ex.questions?.length || 0} questions</span>
                      <span>👥 {ex.submissionCount || 0} submissions</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {fmtDate(ex.startTime)} → {fmtDate(ex.endTime)}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => viewSubmissions(ex._id)} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition" title="View Submissions">
                      <FaEye size={14} />
                    </button>
                    <button onClick={() => { setEditForm({ ...ex, course: ex.course?._id || ex.course, startTime: ex.startTime?.slice?.(0, 16) || new Date(ex.startTime).toISOString().slice(0, 16), endTime: ex.endTime?.slice?.(0, 16) || new Date(ex.endTime).toISOString().slice(0, 16) }); setEditModal(true); }} className="p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition" title="Edit">
                      <FaEdit size={14} />
                    </button>
                    <button onClick={() => handleDelete(ex._id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition" title="Delete">
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── ADD MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {addModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAddModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
              className="bg-dark-card border border-gold/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-dark-card border-b border-gold/10 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-lg font-bold text-white">Create New Exam</h2>
                <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="p-6 space-y-4">
                <FormFields f={form} setter={setForm} />
                <div>
                  <h3 className="text-gold font-semibold text-sm mb-2 flex items-center gap-2"><FaQuestionCircle /> Questions ({form.questions.length})</h3>
                  <QuestionBlock qs={form.questions} formVal={form} formSetter={setForm} />
                </div>
              </div>
              <div className="sticky bottom-0 bg-dark-card border-t border-gold/10 px-6 py-4 flex justify-end gap-3">
                <button onClick={() => setAddModal(false)} className="px-4 py-2 rounded-xl border border-gold/20 text-gray-400 hover:text-white transition text-sm">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="px-6 py-2 rounded-xl bg-gold text-dark font-semibold hover:bg-gold/90 transition text-sm disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
              className="bg-dark-card border border-gold/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-dark-card border-b border-gold/10 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-lg font-bold text-white">Edit Exam</h2>
                <button onClick={() => setEditModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="p-6 space-y-4">
                <FormFields f={editForm} setter={setEditForm} />
                {editForm.questions && (
                  <div>
                    <h3 className="text-gold font-semibold text-sm mb-2 flex items-center gap-2"><FaQuestionCircle /> Questions ({editForm.questions.length})</h3>
                    <QuestionBlock qs={editForm.questions} formVal={editForm} formSetter={setEditForm} />
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-dark-card border-t border-gold/10 px-6 py-4 flex justify-end gap-3">
                <button onClick={() => setEditModal(false)} className="px-4 py-2 rounded-xl border border-gold/20 text-gray-400 hover:text-white transition text-sm">Cancel</button>
                <button onClick={handleUpdate} disabled={saving} className="px-6 py-2 rounded-xl bg-gold text-dark font-semibold hover:bg-gold/90 transition text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SUBMISSIONS MODAL ──────────────────────── */}
      <AnimatePresence>
        {subsModal && detailExam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSubsModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
              className="bg-dark-card border border-gold/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-dark-card border-b border-gold/10 px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-lg font-bold text-white">{detailExam.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{detailExam.submissions?.length || 0} submissions</p>
                </div>
                <button onClick={() => setSubsModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="p-6">
                {(!detailExam.submissions || detailExam.submissions.length === 0) ? (
                  <div className="text-center py-12 text-gray-500">
                    <FaUsers size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detailExam.submissions.map((sub, i) => (
                      <div key={i} className="flex items-center justify-between bg-dark-lighter rounded-xl p-3 border border-gold/10">
                        <div>
                          <p className="text-white text-sm font-medium">{sub.student?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{sub.student?.enrollmentNumber || sub.student?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${sub.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {sub.score}/{sub.totalMarks} ({sub.percentage}%)
                          </p>
                          <p className="text-xs text-gray-500">
                            {sub.passed ? '✅ Passed' : '❌ Failed'} • {Math.round(sub.timeTaken / 60)} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
