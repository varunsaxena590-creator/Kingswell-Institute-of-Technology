// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyExams.jsx                                          ║
// ║  PATH: frontend/src/pages/MyExams.jsx                       ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → Student ke liye Online Exam page                          ║
// ║  → Available exams dikhata hai, exam de sakte hain           ║
// ║  → Timed MCQ interface with countdown timer                  ║
// ║  → Results aur correct answers dekh sakte hain              ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClock, FaCheckCircle, FaTimesCircle, FaPlay, FaEye,
  FaQuestionCircle, FaHourglassHalf, FaArrowLeft, FaArrowRight,
  FaPaperPlane, FaTrophy, FaBook,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function MyExams() {
  const { t } = useLanguage();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('available'); // available | completed

  // Exam taking state
  const [examMode, setExamMode] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  // Result view
  const [resultModal, setResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  /* ── Fetch ──────────────────────────────────── */
  const fetchExams = useCallback(async () => {
    try {
      const { data } = await api.get('/exams/my/list');
      setExams(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  /* ── Timer ──────────────────────────────────── */
  useEffect(() => {
    if (!examMode || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true); // auto-submit on time up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [examMode]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  /* ── Start Exam ─────────────────────────────── */
  const handleStart = async (examId) => {
    try {
      const { data } = await api.get(`/exams/my/${examId}/start`);
      const exam = data.data;
      setCurrentExam(exam);
      setAnswers(exam.questions.map((_, i) => ({ questionIndex: i, selectedOption: -1 })));
      setCurrentQ(0);
      setTimeLeft(exam.duration * 60);
      setStartedAt(new Date().toISOString());
      setExamMode(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot start exam');
    }
  };

  /* ── Submit Exam ────────────────────────────── */
  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      const unanswered = answers.filter(a => a.selectedOption === -1).length;
      if (unanswered > 0) {
        if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
      } else {
        if (!window.confirm('Submit your exam?')) return;
      }
    }

    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const { data } = await api.post(`/exams/my/${currentExam._id}/submit`, { answers, startedAt });
      toast.success(data.message || 'Exam submitted!');
      setExamMode(false);
      setCurrentExam(null);
      fetchExams();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── View Result ────────────────────────────── */
  const viewResult = async (examId) => {
    setResultLoading(true);
    try {
      const { data } = await api.get(`/exams/my/${examId}/result`);
      setResultData(data.data);
      setResultModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load result');
    } finally {
      setResultLoading(false);
    }
  };

  /* ── Select Answer ──────────────────────────── */
  const selectAnswer = (optionIndex) => {
    const updated = [...answers];
    updated[currentQ] = { questionIndex: currentQ, selectedOption: optionIndex };
    setAnswers(updated);
  };

  /* ── Categorize ─────────────────────────────── */
  const available = exams.filter(e => e.isOngoing && !e.hasSubmitted);
  const upcoming = exams.filter(e => e.isUpcoming);
  const completed = exams.filter(e => e.hasSubmitted);
  const expired = exams.filter(e => e.isExpired && !e.hasSubmitted);

  const stats = [
    { label: t('exams.available') || 'Available', value: available.length, icon: FaPlay, color: 'text-green-400' },
    { label: t('exams.upcoming') || 'Upcoming', value: upcoming.length, icon: FaHourglassHalf, color: 'text-blue-400' },
    { label: t('exams.completed') || 'Completed', value: completed.length, icon: FaCheckCircle, color: 'text-gold' },
  ];

  /* ═══════════════════════════════════════════════ */
  /* ── EXAM TAKING UI ──────────────────────────── */
  /* ═══════════════════════════════════════════════ */
  if (examMode && currentExam) {
    const question = currentExam.questions[currentQ];
    const answered = answers.filter(a => a.selectedOption !== -1).length;
    const totalQ = currentExam.questions.length;
    const isLow = timeLeft < 60;

    return (
      <>
        <div className="min-h-screen bg-dark flex flex-col">
          {/* Timer Bar */}
          <div className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between ${isLow ? 'bg-red-900/80' : 'bg-dark-card/95'} backdrop-blur border-b border-gold/10`}>
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold text-sm truncate max-w-[200px]">{currentExam.title}</h2>
              <span className="text-xs text-gray-400 hidden sm:block">{currentExam.subject}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">{answered}/{totalQ} answered</span>
              <div className={`flex items-center gap-1.5 font-mono font-bold text-lg ${isLow ? 'text-red-400 animate-pulse' : 'text-gold'}`}>
                <FaClock size={14} />
                {formatTime(timeLeft)}
              </div>
              <button onClick={() => handleSubmit(false)} disabled={submitting}
                className="flex items-center gap-1.5 bg-gold text-dark font-semibold px-4 py-1.5 rounded-lg text-sm hover:bg-gold/90 transition disabled:opacity-50"
              >
                <FaPaperPlane size={12} /> {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Question Navigator (sidebar) */}
            <div className="lg:w-64 bg-dark-card/50 border-r border-gold/10 p-4 lg:min-h-screen">
              <p className="text-xs text-gray-400 mb-3 font-semibold uppercase">Questions</p>
              <div className="flex flex-wrap gap-2">
                {currentExam.questions.map((_, i) => {
                  const isAnswered = answers[i]?.selectedOption !== -1;
                  const isCurrent = i === currentQ;
                  return (
                    <button key={i} onClick={() => setCurrentQ(i)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                        isCurrent ? 'bg-gold text-dark ring-2 ring-gold/50' :
                        isAnswered ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        'bg-dark-lighter text-gray-500 border border-gold/10 hover:border-gold/30'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 text-xs space-y-1">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500/30 border border-green-500/40 inline-block" /> Answered</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-dark-lighter border border-gold/10 inline-block" /> Unanswered</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-gold inline-block" /> Current</div>
              </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-gold text-sm font-bold">Question {currentQ + 1} of {totalQ}</span>
                      <span className="text-xs text-gray-400 bg-dark-card px-3 py-1 rounded-full">{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
                    </div>

                    <h3 className="text-white text-lg font-medium mb-6 leading-relaxed">{question.questionText}</h3>

                    <div className="space-y-3">
                      {question.options.map((opt, oi) => {
                        const isSelected = answers[currentQ]?.selectedOption === oi;
                        return (
                          <button key={oi} onClick={() => selectAnswer(oi)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-gold bg-gold/10 text-white'
                                : 'border-gold/10 bg-dark-card/50 text-gray-300 hover:border-gold/30 hover:bg-dark-card'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 ${
                                isSelected ? 'border-gold bg-gold text-dark' : 'border-gold/30 text-gray-500'
                              }`}>
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span className="text-sm">{opt}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Prev / Next */}
                    <div className="flex justify-between mt-8">
                      <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/20 text-gray-400 hover:text-white transition disabled:opacity-30 text-sm"
                      >
                        <FaArrowLeft size={12} /> Previous
                      </button>
                      {currentQ < totalQ - 1 ? (
                        <button onClick={() => setCurrentQ(currentQ + 1)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 text-gold hover:bg-gold/20 transition text-sm"
                        >
                          Next <FaArrowRight size={12} />
                        </button>
                      ) : (
                        <button onClick={() => handleSubmit(false)} disabled={submitting}
                          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gold text-dark font-semibold hover:bg-gold/90 transition text-sm disabled:opacity-50"
                        >
                          <FaPaperPlane size={12} /> Submit Exam
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ═══════════════════════════════════════════════ */
  /* ── MAIN LIST VIEW ──────────────────────────── */
  /* ═══════════════════════════════════════════════ */
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-4xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              📝 {t('exams.title') || 'My Exams'}
            </h1>
            <p className="text-gray-400 mt-2">{t('exams.subtitle') || 'Take MCQ exams online and view your results'}</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-dark-card border border-gold/10 rounded-xl p-4 text-center"
              >
                <s.icon className={`mx-auto mb-2 ${s.color}`} size={24} />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { key: 'available', label: t('exams.availableTab') || 'Available / Upcoming' },
              { key: 'completed', label: t('exams.completedTab') || 'Completed' },
            ].map(tb => (
              <button key={tb.key} onClick={() => setTab(tb.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  tab === tb.key ? 'bg-gold text-dark' : 'bg-dark-card text-gray-400 hover:text-white border border-gold/10'
                }`}
              >
                {tb.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold" /></div>
          ) : (
            <AnimatePresence mode="wait">
              {tab === 'available' ? (
                <motion.div key="available" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {available.length === 0 && upcoming.length === 0 && expired.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <FaBook size={40} className="mx-auto mb-4 opacity-30" />
                      <p>{t('exams.noExams') || 'No exams available right now'}</p>
                    </div>
                  ) : (
                    <>
                      {/* Available NOW */}
                      {available.map((ex, i) => (
                        <motion.div key={ex._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="bg-dark-card border-2 border-green-500/30 rounded-xl p-5"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-bold">{ex.title}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 font-bold animate-pulse">LIVE</span>
                              </div>
                              <p className="text-gray-400 text-sm mt-1">{ex.description}</p>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                                <span>📚 {ex.course?.name}</span>
                                <span>📖 {ex.subject}</span>
                                <span>⏱ {ex.duration} min</span>
                                <span>📊 {ex.totalMarks} marks</span>
                                <span>❓ {ex.questionCount} questions</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Ends: {fmtDate(ex.endTime)}</p>
                            </div>
                            <button onClick={() => {
                              if (window.confirm(`Start "${ex.title}"?\n\nDuration: ${ex.duration} min\nTotal: ${ex.totalMarks} marks\nPassing: ${ex.passingMarks} marks\n\nOnce started, the timer cannot be paused.`)) {
                                handleStart(ex._id);
                              }
                            }}
                              className="flex items-center gap-2 bg-green-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-600 transition text-sm shrink-0"
                            >
                              <FaPlay size={12} /> Start Exam
                            </button>
                          </div>
                        </motion.div>
                      ))}

                      {/* Upcoming */}
                      {upcoming.map((ex, i) => (
                        <motion.div key={ex._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-dark-card border border-blue-500/20 rounded-xl p-5 opacity-80"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-semibold">{ex.title}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">UPCOMING</span>
                              </div>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                                <span>📚 {ex.course?.name}</span>
                                <span>📖 {ex.subject}</span>
                                <span>⏱ {ex.duration} min</span>
                                <span>📊 {ex.totalMarks} marks</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Starts: {fmtDate(ex.startTime)}</p>
                            </div>
                            <span className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg"><FaHourglassHalf className="inline mr-1" /> Not yet started</span>
                          </div>
                        </motion.div>
                      ))}

                      {/* Expired (missed) */}
                      {expired.map((ex) => (
                        <div key={ex._id} className="bg-dark-card border border-gray-600/20 rounded-xl p-5 opacity-50">
                          <div className="flex items-center gap-2">
                            <h3 className="text-gray-400 font-semibold">{ex.title}</h3>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-500 border border-gray-500/30 font-bold">MISSED</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">Ended: {fmtDate(ex.endTime)}</p>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {completed.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <FaTrophy size={40} className="mx-auto mb-4 opacity-30" />
                      <p>{t('exams.noCompleted') || 'No completed exams yet'}</p>
                    </div>
                  ) : (
                    completed.map((ex, i) => (
                      <motion.div key={ex._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-dark-card border border-gold/10 rounded-xl p-5"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-white font-semibold">{ex.title}</h3>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                              <span>📚 {ex.course?.name}</span>
                              <span>📖 {ex.subject}</span>
                              <span>⏱ {Math.round(ex.submission.timeTaken / 60)} min taken</span>
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <span className={`text-lg font-bold ${ex.submission.passed ? 'text-green-400' : 'text-red-400'}`}>
                                {ex.submission.score}/{ex.submission.totalMarks}
                              </span>
                              <span className={`text-sm ${ex.submission.passed ? 'text-green-400' : 'text-red-400'}`}>
                                ({ex.submission.percentage}%)
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                ex.submission.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {ex.submission.passed ? '✅ PASSED' : '❌ FAILED'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Submitted: {fmtDate(ex.submission.submittedAt)}</p>
                          </div>
                          <button onClick={() => viewResult(ex._id)} disabled={resultLoading}
                            className="flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-xl hover:bg-gold/20 transition text-sm shrink-0"
                          >
                            <FaEye size={12} /> View Details
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── RESULT MODAL ──────────────────────────── */}
      <AnimatePresence>
        {resultModal && resultData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setResultModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}
              className="bg-dark-card border border-gold/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-dark-card border-b border-gold/10 px-6 py-4 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-white">{resultData.exam.title}</h2>
                  <button onClick={() => setResultModal(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
                </div>
                {/* Score Summary */}
                <div className="flex items-center gap-4 mt-3">
                  <div className={`text-3xl font-bold ${resultData.submission.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {resultData.submission.score}/{resultData.submission.totalMarks}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${resultData.submission.passed ? 'text-green-400' : 'text-red-400'}`}>
                      {resultData.submission.percentage}% — {resultData.submission.passed ? 'PASSED' : 'FAILED'}
                    </p>
                    <p className="text-xs text-gray-400">Time: {Math.round(resultData.submission.timeTaken / 60)} min | Passing: {resultData.exam.passingMarks} marks</p>
                  </div>
                </div>
              </div>

              {/* Questions Review */}
              <div className="p-6 space-y-4">
                {resultData.questions.map((q, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${q.isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex items-start gap-2 mb-3">
                      <span className={`mt-0.5 ${q.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {q.isCorrect ? <FaCheckCircle size={16} /> : <FaTimesCircle size={16} />}
                      </span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Q{i + 1}. {q.questionText}</p>
                        <span className="text-xs text-gray-500">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 ml-6">
                      {q.options.map((opt, oi) => {
                        const isCorrect = oi === q.correctOption;
                        const isSelected = oi === q.selectedOption;
                        return (
                          <div key={oi} className={`px-3 py-2 rounded-lg text-xs border ${
                            isCorrect ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                            isSelected && !isCorrect ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                            'border-gold/10 text-gray-500'
                          }`}>
                            <span className="font-bold mr-1">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                            {isCorrect && ' ✓'}
                            {isSelected && !isCorrect && ' ✗'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
