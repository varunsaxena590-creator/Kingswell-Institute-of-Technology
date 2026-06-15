// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Results.jsx (Admin Page)                             ║
// ║  PATH: frontend/src/admin/Results.jsx                       ║
// ║                                                              ║
// ║  KYA HAI? → Admin student results/marks manage karne ka page.║
// ║  → Results create, edit, delete, publish karna.             ║
// ║  → Publish pe student ko email jaata hai.                   ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/Results.jsx — Admin Results/Marks Manager
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartBar, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck,
  FaEye, FaSearch, FaGraduationCap, FaGlobe, FaFilePdf,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';
import { downloadResultPDF, downloadAllResultsPDF } from '../utils/pdfReports';

const EXAM_TYPES = ['midterm', 'final', 'assignment', 'practical'];

const GRADE_COLOR = {
  'A+': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'A':  'text-green-400 bg-green-400/10 border-green-400/20',
  'B+': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  'B':  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'C':  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'D':  'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'F':  'text-red-400 bg-red-400/10 border-red-400/20',
};

const emptySubject = { subject: '', marksObtained: '', totalMarks: 100 };
const emptyForm = { student: '', semester: '', examType: 'final', subjects: [{ ...emptySubject }], remarks: '' };

export default function Results() {
  const [results,  setResults]  = useState([]);
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [modal,    setModal]    = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [rRes, sRes] = await Promise.all([
        api.get('/results'),
        api.get('/students'),
      ]);
      setResults(rRes.data.data || []);
      setStudents((sRes.data.data || []).filter(s => s.status === 'accepted'));
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filter ───────────────────────────────────────────────────
  const filtered = results.filter(r => {
    const name = `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.toLowerCase();
    const admNo = (r.student?.admissionNumber || '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || admNo.includes(search.toLowerCase());
    const matchSem = !semFilter || r.semester.toLowerCase().includes(semFilter.toLowerCase());
    return matchSearch && matchSem;
  });

  // ── Form helpers ─────────────────────────────────────────────
  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (r) => {
    setForm({
      student:  r.student?._id || '',
      semester: r.semester,
      examType: r.examType,
      subjects: r.subjects.map(s => ({ subject: s.subject, marksObtained: s.marksObtained, totalMarks: s.totalMarks })),
      remarks:  r.remarks || '',
    });
    setEditId(r._id);
    setModal(true);
  };

  const addSubjectRow = () => setForm(p => ({ ...p, subjects: [...p.subjects, { ...emptySubject }] }));
  const removeSubjectRow = (i) => setForm(p => ({ ...p, subjects: p.subjects.filter((_, idx) => idx !== i) }));
  const updateSubject = (i, field, val) => setForm(p => ({
    ...p,
    subjects: p.subjects.map((s, idx) => idx === i ? { ...s, [field]: val } : s),
  }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.student || !form.semester) { toast.error('Select student and semester'); return; }
    if (form.subjects.some(s => !s.subject || s.marksObtained === '')) { toast.error('Fill all subject fields'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        subjects: form.subjects.map(s => ({
          subject: s.subject,
          marksObtained: Number(s.marksObtained),
          totalMarks: Number(s.totalMarks),
        })),
      };
      if (editId) {
        const { data } = await api.put(`/results/${editId}`, payload);
        setResults(prev => prev.map(r => r._id === editId ? data.data : r));
        toast.success('Result updated');
      } else {
        const { data } = await api.post('/results', payload);
        setResults(prev => [data.data, ...prev]);
        toast.success('Result added');
      }
      setModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save result');
    } finally { setSaving(false); }
  };

  const handlePublish = async (r) => {
    try {
      const { data } = await api.put(`/results/${r._id}/publish`);
      setResults(prev => prev.map(x => x._id === r._id ? data.data : x));
      toast.success('Result published — student can now see it');
    } catch { toast.error('Failed to publish'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await api.delete(`/results/${id}`);
      setResults(prev => prev.filter(r => r._id !== id));
      toast.success('Result deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-bold text-white text-2xl">Results & Marks</h2>
          <p className="text-gray-400 text-sm mt-1">Manage student exam results and publish to students</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => downloadAllResultsPDF(filtered)} disabled={!filtered.length}
            className="flex items-center gap-2 bg-dark-300 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-semibold px-3 py-2.5 rounded-lg transition-all text-sm disabled:opacity-40">
            <FaFilePdf size={13} /> Export PDF
          </button>
          <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5">
            <FaPlus size={12} /> Add Result
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Results', value: results.length, color: 'text-white' },
          { label: 'Published',     value: results.filter(r => r.publishedAt).length, color: 'text-green-400' },
          { label: 'Unpublished',   value: results.filter(r => !r.publishedAt).length, color: 'text-yellow-400' },
          { label: 'Failed (F)',    value: results.filter(r => r.overallGrade === 'F').length, color: 'text-red-400' },
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
          <input type="text" placeholder="Search by student name or ADM no..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm w-full" />
        </div>
        <input type="text" placeholder="Filter by semester..." value={semFilter}
          onChange={e => setSemFilter(e.target.value)} className="input-field text-sm sm:w-56" />
      </div>

      {/* Table */}
      <div className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Student</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden sm:table-cell">Semester</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden md:table-cell">Exam</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium">Overall</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden sm:table-cell">Status</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">Loading results...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">
                  <FaChartBar size={32} className="mx-auto mb-3 opacity-20" />
                  No results found
                </td></tr>
              ) : filtered.map((r, i) => (
                <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-800 hover:bg-dark-300/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                        {r.student?.firstName?.[0]}{r.student?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{r.student?.firstName} {r.student?.lastName}</p>
                        <p className="text-gray-500 text-xs">{r.student?.admissionNumber || r.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 hidden sm:table-cell">
                    <p className="text-gray-300 text-sm">{r.semester}</p>
                  </td>
                  <td className="py-4 px-3 hidden md:table-cell">
                    <span className="text-xs capitalize text-gray-400">{r.examType}</span>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_COLOR[r.overallGrade] || ''}`}>
                        {r.overallGrade}
                      </span>
                      <span className="text-gray-400 text-xs">{r.overallPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 hidden sm:table-cell">
                    {r.publishedAt
                      ? <span className="text-xs text-green-400 flex items-center gap-1"><FaCheck size={10} /> Published</span>
                      : <span className="text-xs text-yellow-400">Draft</span>}
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewModal(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors" title="View">
                        <FaEye size={13} />
                      </button>
                      {!r.publishedAt && (
                        <button onClick={() => handlePublish(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-colors" title="Publish">
                          <FaGlobe size={13} />
                        </button>
                      )}
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors" title="Edit">
                        <FaEdit size={13} />
                      </button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
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
                  <h3 className="font-heading font-bold text-white text-xl">Result Details</h3>
                  <p className="text-gray-400 text-sm">{viewModal.student?.firstName} {viewModal.student?.lastName} · {viewModal.semester}</p>
                </div>
                <button onClick={() => setViewModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              {/* Overall */}
              <div className="flex gap-3 mb-5">
                <div className="flex-1 bg-dark-300 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-xs">Overall %</p>
                  <p className="text-white text-2xl font-bold mt-1">{viewModal.overallPercentage}%</p>
                </div>
                <div className="flex-1 bg-dark-300 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-xs">Grade</p>
                  <p className={`text-2xl font-bold mt-1 ${GRADE_COLOR[viewModal.overallGrade]?.split(' ')[0] || 'text-white'}`}>{viewModal.overallGrade}</p>
                </div>
                <div className="flex-1 bg-dark-300 rounded-xl p-3 text-center">
                  <p className="text-gray-500 text-xs">Exam Type</p>
                  <p className="text-white text-sm font-semibold mt-1 capitalize">{viewModal.examType}</p>
                </div>
              </div>

              {/* Subjects table */}
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-500 text-xs py-2 font-medium">Subject</th>
                    <th className="text-center text-gray-500 text-xs py-2 font-medium">Marks</th>
                    <th className="text-center text-gray-500 text-xs py-2 font-medium">%</th>
                    <th className="text-center text-gray-500 text-xs py-2 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {viewModal.subjects.map((s, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-2.5 text-gray-300">{s.subject}</td>
                      <td className="py-2.5 text-center text-gray-400">{s.marksObtained}/{s.totalMarks}</td>
                      <td className="py-2.5 text-center text-gray-400">{s.percentage}%</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_COLOR[s.grade] || ''}`}>{s.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {viewModal.remarks && (
                <p className="text-gray-400 text-sm bg-dark-300 rounded-xl px-4 py-3">
                  <span className="text-gray-500">Remarks: </span>{viewModal.remarks}
                </p>
              )}
              <p className="text-gray-600 text-xs mt-3 text-center">
                {viewModal.publishedAt ? `Published on ${new Date(viewModal.publishedAt).toLocaleDateString()}` : 'Not yet published'}
              </p>
              <button onClick={() => downloadResultPDF(viewModal)}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-dark-300 border border-gray-700 text-gray-300 hover:text-gold hover:border-gold/40 font-semibold py-2.5 rounded-xl transition-all text-sm">
                <FaFilePdf size={13} /> Download PDF
              </button>
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
                <h3 className="font-heading font-bold text-white text-xl">{editId ? 'Edit Result' : 'Add Result'}</h3>
                <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Student + Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Student *</label>
                    <select value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} className="input-field w-full">
                      <option value="">— Select Accepted Student —</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.firstName} {s.lastName} {s.admissionNumber ? `(${s.admissionNumber})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Semester *</label>
                    <input type="text" placeholder="e.g. Semester 1 — 2026" value={form.semester}
                      onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} className="input-field w-full" />
                  </div>
                </div>

                {/* Exam type */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Exam Type</label>
                  <select value={form.examType} onChange={e => setForm(p => ({ ...p, examType: e.target.value }))} className="input-field w-full capitalize">
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Subjects */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-400 text-xs">Subjects & Marks *</label>
                    <button type="button" onClick={addSubjectRow} className="text-gold text-xs flex items-center gap-1 hover:underline">
                      <FaPlus size={10} /> Add Subject
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.subjects.map((s, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <input type="text" placeholder="Subject name" value={s.subject}
                          onChange={e => updateSubject(i, 'subject', e.target.value)}
                          className="input-field text-sm col-span-5" />
                        <input type="number" placeholder="Marks" min={0} max={s.totalMarks} value={s.marksObtained}
                          onChange={e => updateSubject(i, 'marksObtained', e.target.value)}
                          className="input-field text-sm col-span-3" />
                        <input type="number" placeholder="Total" min={1} value={s.totalMarks}
                          onChange={e => updateSubject(i, 'totalMarks', e.target.value)}
                          className="input-field text-sm col-span-3" />
                        <button type="button" onClick={() => removeSubjectRow(i)} disabled={form.subjects.length === 1}
                          className="col-span-1 text-red-400/50 hover:text-red-400 disabled:opacity-20 transition-colors flex justify-center">
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-600 text-xs mt-1">Grades auto-calculated on save</p>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Remarks (optional)</label>
                  <input type="text" placeholder="e.g. Good performance" value={form.remarks}
                    onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))} className="input-field w-full" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl bg-dark-300 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-gold py-2.5 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : editId ? 'Update Result' : 'Save Result'}
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
