// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Emails.jsx (Admin Page)                              ║
// ║  PATH: frontend/src/admin/Emails.jsx                        ║
// ║                                                              ║
// ║  KYA HAI? → Admin email broadcast & notifications page.      ║
// ║  → All students ya course-wise email bhej sakte hain.       ║
// ║  → Fee reminders aur test emails bhi bhej sakte hain.       ║
// ║  → POST /api/email/broadcast, /fee-reminder, /test          ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEnvelope, FaPaperPlane, FaCheckCircle, FaExclamationTriangle,
  FaVials, FaUsers, FaBell, FaMoneyBillWave, FaChevronDown, FaChevronUp,
  FaSpinner, FaInfoCircle, FaTimes,
} from 'react-icons/fa';
import api from '../utils/axios';

// ── Variants ────────────────────────────────────────────────────
const RECIPIENT_TYPES = [
  { value: 'all',    label: 'All Accepted Students', icon: <FaUsers /> },
  { value: 'course', label: 'Specific Course',       icon: <FaEnvelope /> },
];

const QUICK_TEMPLATES = [
  {
    label: 'Fee Reminder',
    icon: <FaMoneyBillWave />,
    subject: 'Important: Fee Payment Reminder',
    body: 'Dear Student,\n\nThis is a reminder that your fee payment is due. Please login to the student portal to view your fee details and make the payment at the earliest convenience.\n\nThank you for your prompt attention.\n\nWarm regards,\nKingswell College Administration',
  },
  {
    label: 'Exam Notice',
    icon: <FaBell />,
    subject: 'Upcoming Examinations — Important Notice',
    body: 'Dear Student,\n\nThis is to inform you that end-semester examinations are scheduled to begin soon. Please check the timetable on your student portal and ensure you are well prepared.\n\nBest wishes for your examinations.\n\nKingswell College Examination Cell',
  },
  {
    label: 'Holiday Notice',
    icon: <FaBell />,
    subject: 'College Holiday Announcement',
    body: 'Dear Student,\n\nThe college will be closed for a public holiday. Regular classes will resume thereafter.\n\nPlease stay safe and enjoy the break.\n\nKingswell College Administration',
  },
  {
    label: 'Results Reminder',
    icon: <FaCheckCircle />,
    subject: 'Your Semester Results Are Now Available',
    body: 'Dear Student,\n\nPlease be informed that your semester results have been uploaded to the student portal. Login to view your subject-wise marks and grades.\n\nFor any discrepancies, please contact the examination cell within 7 days.\n\nKingswell College',
  },
];

// ── Stat card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-[#141420] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[rgba(255,255,255,0.4)] text-xs uppercase tracking-widest">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-xs
        ${isSuccess ? 'bg-[#0f2318] border-[rgba(52,211,153,.3)] text-[#34d399]' : 'bg-[#2b1111] border-[rgba(248,113,113,.3)] text-[#f87171]'}`}
    >
      {isSuccess ? <FaCheckCircle /> : <FaExclamationTriangle />}
      <span className="text-sm">{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><FaTimes /></button>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function Emails() {
  const [courses, setCourses]           = useState([]);
  const [stats, setStats]               = useState({ accepted: 0, emailConfigured: false });
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [sendingTest, setSendingTest]   = useState(false);
  const [sendingFee, setSendingFee]     = useState(false);
  const [toast, setToast]               = useState(null);
  const [result, setResult]             = useState(null); // broadcast result

  // Form state
  const [subject, setSubject]     = useState('');
  const [body, setBody]           = useState('');
  const [recipientType, setType]  = useState('all');
  const [courseId, setCourseId]   = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ── Load courses + accepted student count ─────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, studentsRes] = await Promise.all([
          api.get('/courses'),
          api.get('/students?status=accepted&limit=1'),
        ]);
        setCourses(coursesRes.data.data || []);
        setStats((prev) => ({ ...prev, accepted: studentsRes.data.count || 0 }));
      } catch {
        // silently handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Apply quick template ──────────────────────────────────────
  const applyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    setShowTemplates(false);
  };

  // ── Send broadcast ────────────────────────────────────────────
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      showToast('Subject and message body are required', 'error');
      return;
    }
    if (recipientType === 'course' && !courseId) {
      showToast('Please select a course', 'error');
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const res = await api.post('/email/broadcast', {
        subject: subject.trim(),
        body: body.trim(),
        recipientType,
        courseId: recipientType === 'course' ? courseId : undefined,
      });
      setResult(res.data);
      showToast(`Email sent to ${res.data.sent} student(s)!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send broadcast', 'error');
    } finally {
      setSending(false);
    }
  };

  // ── Send test email ───────────────────────────────────────────
  const handleTest = async () => {
    setSendingTest(true);
    try {
      const res = await api.post('/email/test');
      showToast(res.data.message);
    } catch (err) {
      showToast(err.response?.data?.message || 'Test email failed', 'error');
    } finally {
      setSendingTest(false);
    }
  };

  // ── Send fee reminders ────────────────────────────────────────
  const handleFeeReminders = async () => {
    setSendingFee(true);
    try {
      const res = await api.post('/email/fee-reminder');
      showToast(`Fee reminders sent to ${res.data.sent} student(s)!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send fee reminders', 'error');
    } finally {
      setSendingFee(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#a0821a] flex items-center justify-center text-black">
            <FaEnvelope />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Email Notifications</h1>
            <p className="text-[rgba(255,255,255,0.4)] text-sm">Broadcast messages & manage automated notifications</p>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FaUsers />}    label="Accepted Students"       value={loading ? '...' : stats.accepted}   color="bg-[rgba(212,175,55,0.1)] text-[#d4af37]" />
        <StatCard icon={<FaCheckCircle />} label="Auto-Notified Events" value="4"   color="bg-[rgba(52,211,153,.1)] text-[#34d399]" />
        <StatCard icon={<FaBell />}     label="Notification Types"      value="6"   color="bg-[rgba(96,165,250,.1)] text-[#60a5fa]" />
        <StatCard icon={<FaMoneyBillWave />} label="Fee Reminder"       value="1-Click" color="bg-[rgba(251,146,60,.1)] text-[#fb923c]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Compose ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Quick actions */}
          <div className="bg-[#141420] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5">
            <h2 className="text-[#d4af37] font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
              <FaPaperPlane /> Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTest}
                disabled={sendingTest}
                className="flex items-center gap-2 px-4 py-2 bg-[rgba(96,165,250,.1)] border border-[rgba(96,165,250,.3)] text-[#60a5fa] rounded-xl text-sm hover:bg-[rgba(96,165,250,.2)] transition-colors disabled:opacity-50"
              >
                {sendingTest ? <FaSpinner className="animate-spin" /> : <FaVials />}
                Send Test Email to Me
              </button>
              <button
                onClick={handleFeeReminders}
                disabled={sendingFee}
                className="flex items-center gap-2 px-4 py-2 bg-[rgba(251,146,60,.1)] border border-[rgba(251,146,60,.3)] text-[#fb923c] rounded-xl text-sm hover:bg-[rgba(251,146,60,.2)] transition-colors disabled:opacity-50"
              >
                {sendingFee ? <FaSpinner className="animate-spin" /> : <FaMoneyBillWave />}
                Send All Fee Reminders
              </button>
            </div>
          </div>

          {/* Compose form */}
          <div className="bg-[#141420] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[#d4af37] font-semibold flex items-center gap-2 text-sm uppercase tracking-widest">
                <FaEnvelope /> Compose Broadcast
              </h2>
              <button
                onClick={() => setShowTemplates((p) => !p)}
                className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.5)] hover:text-[#d4af37] transition-colors border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded-lg"
              >
                Quick Templates {showTemplates ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>

            {/* Template picker */}
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-5"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.label}
                        onClick={() => applyTemplate(tpl)}
                        className="flex items-center gap-2 p-3 bg-[#0f0f1a] border border-[rgba(212,175,55,0.1)] rounded-xl text-left hover:border-[rgba(212,175,55,0.4)] transition-colors group"
                      >
                        <span className="text-[#d4af37] text-sm">{tpl.icon}</span>
                        <span className="text-sm text-[rgba(255,255,255,0.7)] group-hover:text-white transition-colors">{tpl.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleBroadcast} className="space-y-4">
              {/* Recipients */}
              <div>
                <label className="block text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-2">Recipients</label>
                <div className="flex gap-2">
                  {RECIPIENT_TYPES.map((rt) => (
                    <button
                      key={rt.value}
                      type="button"
                      onClick={() => setType(rt.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-all
                        ${recipientType === rt.value
                          ? 'bg-[rgba(212,175,55,0.15)] border-[#d4af37] text-[#d4af37]'
                          : 'bg-transparent border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] hover:border-[rgba(212,175,55,0.3)]'
                        }`}
                    >
                      {rt.icon} {rt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course selector */}
              <AnimatePresence>
                {recipientType === 'course' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-2">Select Course</label>
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full bg-[#0f0f1a] border border-[rgba(255,255,255,0.08)] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="">-- Select a course --</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Subject */}
              <div>
                <label className="block text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-2">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full bg-[#0f0f1a] border border-[rgba(255,255,255,0.08)] text-white rounded-xl px-4 py-2.5 text-sm placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-[#d4af37] transition-colors"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-2">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  placeholder="Write your message here..."
                  className="w-full bg-[#0f0f1a] border border-[rgba(255,255,255,0.08)] text-white rounded-xl px-4 py-3 text-sm placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-[#d4af37] transition-colors resize-none leading-relaxed"
                />
                <p className="mt-1 text-xs text-[rgba(255,255,255,0.3)]">{body.length} characters</p>
              </div>

              {/* Preview snippet */}
              {body && (
                <div className="bg-[#0a0a0f] border border-[rgba(212,175,55,0.1)] rounded-xl p-4">
                  <p className="text-xs text-[rgba(255,255,255,0.3)] uppercase tracking-widest mb-2">Preview</p>
                  <p className="text-sm text-[rgba(255,255,255,0.6)] leading-relaxed whitespace-pre-line line-clamp-4">{body}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a0821a] text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? (
                  <><FaSpinner className="animate-spin" /> Sending...</>
                ) : (
                  <><FaPaperPlane /> Send Broadcast Email</>
                )}
              </button>
            </form>

            {/* Result banner */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.2)] rounded-xl p-4 text-sm"
                >
                  <p className="text-[#34d399] font-semibold mb-2 flex items-center gap-2">
                    <FaCheckCircle /> Broadcast Complete
                  </p>
                  <div className="flex gap-6 text-xs text-[rgba(255,255,255,0.5)]">
                    <span>Total: <b className="text-white">{result.total}</b></span>
                    <span>Sent: <b className="text-[#34d399]">{result.sent}</b></span>
                    {result.failed > 0 && <span>Failed: <b className="text-[#f87171]">{result.failed}</b></span>}
                    {result.skipped > 0 && <span>Skipped (not configured): <b className="text-[#fb923c]">{result.skipped}</b></span>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Right: Info panel ── */}
        <div className="space-y-5">

          {/* Auto-notification info */}
          <div className="bg-[#141420] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5">
            <h2 className="text-[#d4af37] font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
              <FaBell /> Auto Notifications
            </h2>
            <ul className="space-y-3">
              {[
                { label: 'Application Received',  desc: 'Sent when student submits application', color: 'text-[#60a5fa]' },
                { label: 'Admission Accepted',    desc: 'Sent when admin accepts a student',     color: 'text-[#34d399]' },
                { label: 'Admission Rejected',    desc: 'Sent when admin rejects a student',     color: 'text-[#f87171]' },
                { label: 'Result Published',      desc: 'Sent when admin publishes result',      color: 'text-[#d4af37]' },
                { label: 'New Notice',            desc: 'Sent to all students on notice creation', color: 'text-[#a78bfa]' },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${item.color.replace('text-', 'bg-')}`} />
                  <div>
                    <p className={`text-sm font-medium ${item.color}`}>{item.label}</p>
                    <p className="text-xs text-[rgba(255,255,255,0.3)] mt-0.5">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Config notice */}
          <div className="bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] rounded-2xl p-5">
            <h2 className="text-[#d4af37] font-semibold mb-3 flex items-center gap-2 text-sm">
              <FaInfoCircle /> Email Setup
            </h2>
            <p className="text-xs text-[rgba(255,255,255,0.4)] leading-relaxed mb-3">
              To enable emails, update your <code className="text-[#d4af37]">.env</code> file with Gmail credentials:
            </p>
            <div className="bg-[#0a0a0f] rounded-xl p-3 font-mono text-xs text-[rgba(255,255,255,0.6)] space-y-1">
              <p>EMAIL_USER=your@gmail.com</p>
              <p>EMAIL_PASS=16char_app_password</p>
            </div>
            <p className="text-xs text-[rgba(255,255,255,0.3)] mt-3">
              Generate an App Password from your Google Account → Security → 2-Step Verification → App Passwords.
            </p>
            <button
              onClick={handleTest}
              disabled={sendingTest}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[rgba(212,175,55,0.3)] text-[#d4af37] text-xs hover:bg-[rgba(212,175,55,0.08)] transition-colors disabled:opacity-50"
            >
              {sendingTest ? <FaSpinner className="animate-spin" /> : <FaVials />}
              Send Test Email
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </AnimatePresence>
    </div>
  );
}
