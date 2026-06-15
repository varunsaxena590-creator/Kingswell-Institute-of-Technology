// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyAttendance.jsx (Student Page)                      ║
// ║  PATH: frontend/src/pages/MyAttendance.jsx                  ║
// ║                                                              ║
// ║  KYA HAI? → Student ki apni attendance dekhne ka page.       ║
// ║  → Subject wise attendance % dikhata hai.                   ║
// ║  → GET /api/attendance/my se data fetch hota hai.           ║
// ║  → Route: /my-attendance (protected — login required)       ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/MyAttendance.jsx — Student Attendance Portal
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaUserCheck, FaUserTimes, FaClock, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

const STATUS_COLOR = {
  present: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  absent:  'text-red-400 bg-red-400/10 border-red-400/20',
  late:    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
};

const STATUS_LABEL = { present: 'Present', absent: 'Absent', late: 'Late' };

function PctBar({ pct }) {
  const color = pct >= 75 ? 'bg-emerald-400' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="w-full bg-dark-300 rounded-full h-1.5 mt-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-1.5 rounded-full ${color}`}
      />
    </div>
  );
}

export default function MyAttendance() {
  const [subjects,  setSubjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);

  useEffect(() => {
    api.get('/attendance/my')
      .then(({ data }) => setSubjects(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const overall = subjects.length
    ? Math.round(subjects.reduce((s, sub) => s + sub.percentage, 0) / subjects.length)
    : 0;

  const totalPresent = subjects.reduce((s, sub) => s + sub.present, 0);
  const totalAbsent  = subjects.reduce((s, sub) => s + sub.absent, 0);
  const totalLate    = subjects.reduce((s, sub) => s + sub.late, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-4xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">My Attendance</h1>
            <p className="text-gray-400">Track your attendance across all subjects</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading attendance...</div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FaCalendarCheck size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg">No attendance records yet.</p>
              <p className="text-sm mt-1">Check back after your classes begin.</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Overall',  value: `${overall}%`,    color: overall >= 75 ? 'text-emerald-400' : overall >= 50 ? 'text-yellow-400' : 'text-red-400' },
                  { label: 'Present',  value: totalPresent,     color: 'text-emerald-400' },
                  { label: 'Absent',   value: totalAbsent,      color: 'text-red-400' },
                  { label: 'Late',     value: totalLate,        color: 'text-yellow-400' },
                ].map(c => (
                  <div key={c.label} className="bg-dark-200 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs uppercase tracking-widest">{c.label}</p>
                    <p className={`text-2xl font-bold font-heading mt-1 ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Attendance warning */}
              {overall < 75 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-6 bg-red-400/10 border border-red-400/30 text-red-300 rounded-xl px-5 py-3 text-sm"
                >
                  ⚠ Your overall attendance is below 75%. Please attend more classes to avoid penalties.
                </motion.div>
              )}

              {/* Subject cards */}
              <div className="space-y-4">
                {subjects.map((sub, i) => {
                  const isOpen = expanded === i;
                  const pctColor = sub.percentage >= 75 ? 'text-emerald-400' : sub.percentage >= 50 ? 'text-yellow-400' : 'text-red-400';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden"
                    >
                      {/* Card header */}
                      <div
                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-dark-300/40 transition-colors"
                        onClick={() => setExpanded(isOpen ? null : i)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-dark-300 border border-gray-700 flex flex-col items-center justify-center">
                            <span className={`text-sm font-bold ${pctColor}`}>{sub.percentage}%</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{sub.subject}</p>
                            <p className="text-gray-400 text-xs">{sub.semester} · {sub.total} classes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex gap-3 text-xs font-medium">
                            <span className="text-emerald-400 flex items-center gap-1"><FaUserCheck size={11} />{sub.present}</span>
                            <span className="text-yellow-400 flex items-center gap-1"><FaClock size={11} />{sub.late}</span>
                            <span className="text-red-400 flex items-center gap-1"><FaUserTimes size={11} />{sub.absent}</span>
                          </div>
                          {isOpen ? <FaChevronUp size={13} className="text-gray-500" /> : <FaChevronDown size={13} className="text-gray-500" />}
                        </div>
                      </div>

                      {/* Progress bar (always visible) */}
                      <div className="px-5 pb-3">
                        <PctBar pct={sub.percentage} />
                      </div>

                      {/* Expanded session history */}
                      {isOpen && sub.sessions?.length > 0 && (
                        <div className="border-t border-gray-800 px-5 py-4">
                          <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Session History</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {sub.sessions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((ses, j) => (
                              <div key={j} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${STATUS_COLOR[ses.status]}`}>
                                <span className="text-xs text-gray-300">{new Date(ses.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                                <span className={`text-xs font-bold ${STATUS_COLOR[ses.status]?.split(' ')[0]}`}>{STATUS_LABEL[ses.status]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
