// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyAssignments.jsx (Student Page)                     ║
// ║  PATH: frontend/src/pages/MyAssignments.jsx                  ║
// ║                                                              ║
// ║  KYA HAI? → Student apne assignments dekhta hai             ║
// ║    aur submit karta hai yaha pe.                            ║
// ║  → Assignment details, due date, marks dekhna.              ║
// ║  → Submit karna (text content).                             ║
// ║  → Graded assignments mein marks + feedback dekhna.         ║
// ║  → Route: /my-assignments (protected — login required)      ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClipboardCheck, FaTimes, FaClock, FaCheckCircle,
  FaExclamationTriangle, FaStar, FaPaperPlane, FaCalendarAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

const TYPE_BADGE = {
  homework:   'text-blue-400 bg-blue-400/10 border-blue-400/20',
  assignment: 'text-gold bg-gold/10 border-gold/20',
  project:    'text-purple-400 bg-purple-400/10 border-purple-400/20',
  lab:        'text-green-400 bg-green-400/10 border-green-400/20',
  quiz:       'text-pink-400 bg-pink-400/10 border-pink-400/20',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [submitModal, setSubmitModal] = useState(null);   // assignment obj
  const [content,     setContent]     = useState('');
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    api.get('/assignments/my')
      .then(({ data }) => setAssignments(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error('Answer / submission content likho');
    setSaving(true);
    try {
      const { data } = await api.post(`/assignments/${submitModal._id}/submit`, { content });
      // Update local state
      setAssignments(prev => prev.map(a =>
        a._id === submitModal._id ? { ...a, mySubmission: data.data?.submissions?.find(s => s.content === content) || { content, status: 'submitted', submittedAt: new Date() } } : a
      ));
      toast.success('Assignment submitted successfully! 🎉');
      setSubmitModal(null);
      setContent('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSaving(false); }
  };

  // Stats
  const stats = {
    total:     assignments.length,
    pending:   assignments.filter(a => !a.mySubmission && a.isActive).length,
    submitted: assignments.filter(a => a.mySubmission && a.mySubmission.status !== 'graded').length,
    graded:    assignments.filter(a => a.mySubmission?.status === 'graded').length,
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-4xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-heading font-bold text-white text-3xl mb-1 flex items-center gap-3">
              <FaClipboardCheck className="text-gold" /> My Assignments
            </h1>
            <p className="text-gray-400">View assignments, submit your work, and check grades</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total',     value: stats.total,     color: 'text-white' },
              { label: 'Pending',   value: stats.pending,   color: 'text-yellow-400' },
              { label: 'Submitted', value: stats.submitted, color: 'text-blue-400' },
              { label: 'Graded',    value: stats.graded,    color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-3">
                <p className="text-gray-500 text-xs uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-bold font-heading mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20 text-gray-500">Loading your assignments...</div>
          )}

          {/* Empty */}
          {!loading && assignments.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-500">
              <FaClipboardCheck size={52} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg text-white mb-1">No assignments yet</p>
              <p className="text-sm">Assignments will show up here when your teacher creates one for your course.</p>
            </motion.div>
          )}

          {/* Assignment Cards */}
          {!loading && assignments.length > 0 && (
            <div className="space-y-4">
              {assignments.map((a, i) => {
                const sub = a.mySubmission;
                const isPastDue = a.isPastDue;
                const canSubmit = !sub && a.isActive;

                return (
                  <motion.div key={a._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-dark-200 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                    
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title + badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-white font-medium text-base">{a.title}</h3>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${TYPE_BADGE[a.type] || ''}`}>
                            {a.type}
                          </span>
                          {sub ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              sub.status === 'graded' ? 'text-green-400 bg-green-400/10 border-green-400/20'
                              : sub.status === 'late' ? 'text-red-400 bg-red-400/10 border-red-400/20'
                              : 'text-blue-400 bg-blue-400/10 border-blue-400/20'
                            }`}>
                              {sub.status === 'graded' ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
                              {sub.status}
                            </span>
                          ) : isPastDue ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full border text-red-400 bg-red-400/10 border-red-400/20 flex items-center gap-1">
                              <FaExclamationTriangle size={10} /> overdue
                            </span>
                          ) : null}
                        </div>

                        {/* Description */}
                        <p className="text-gray-400 text-sm mb-3 whitespace-pre-wrap line-clamp-3">{a.description}</p>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><FaCalendarAlt size={11} /> Due: <span className={isPastDue ? 'text-red-400' : 'text-gray-300'}>{fmtDate(a.dueDate)}</span></span>
                          <span>Course: <span className="text-gray-300">{a.course?.title || '—'}</span></span>
                          {a.subject && <span>Subject: <span className="text-gray-300">{a.subject}</span></span>}
                          <span>Marks: <span className="text-gold">{a.totalMarks}</span></span>
                        </div>

                        {/* Graded result */}
                        {sub?.status === 'graded' && (
                          <div className="mt-3 bg-dark-300 rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3 mb-1">
                              <FaStar className="text-gold" size={14} />
                              <span className="text-gold font-bold text-lg">{sub.marks}</span>
                              <span className="text-gray-500">/ {a.totalMarks}</span>
                              <span className="text-gray-600 text-xs ml-auto">Graded: {fmtDate(sub.gradedAt)}</span>
                            </div>
                            {sub.feedback && (
                              <p className="text-gray-400 text-sm mt-1">
                                <span className="text-gray-500">Feedback: </span>{sub.feedback}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Already submitted but not graded */}
                        {sub && sub.status !== 'graded' && (
                          <div className="mt-3 bg-dark-300 rounded-lg px-3 py-2 text-sm">
                            <span className="text-gray-500">Your answer: </span>
                            <span className="text-gray-300 line-clamp-2">{sub.content}</span>
                            <p className="text-gray-600 text-xs mt-1">Submitted: {fmtDate(sub.submittedAt)}</p>
                          </div>
                        )}
                      </div>

                      {/* Submit button */}
                      {canSubmit && (
                        <button onClick={() => { setContent(''); setSubmitModal(a); }}
                          className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5 shrink-0">
                          <FaPaperPlane size={12} /> Submit
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

      {/* ══════════ SUBMIT MODAL ══════════ */}
      <AnimatePresence>
        {submitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-white text-xl">Submit Assignment</h3>
                <button onClick={() => setSubmitModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              
              <div className="bg-dark-300 rounded-xl px-4 py-3 mb-5 text-sm">
                <p className="text-white font-medium mb-1">{submitModal.title}</p>
                <p className="text-gray-400 text-xs">Course: {submitModal.course?.title} | Marks: {submitModal.totalMarks} | Due: {fmtDate(submitModal.dueDate)}</p>
                {submitModal.isPastDue && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><FaExclamationTriangle size={10} /> This assignment is overdue — submission will be marked as late</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Your Answer / Submission *</label>
                  <textarea rows={8} placeholder="Yaha apna answer likho... assignment ka solution, explanation, code, etc."
                    value={content} onChange={e => setContent(e.target.value)}
                    className="input-field w-full resize-none text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSubmitModal(null)}
                    className="flex-1 py-2.5 rounded-xl bg-dark-300 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                    <FaPaperPlane size={12} /> {saving ? 'Submitting...' : 'Submit'}
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
