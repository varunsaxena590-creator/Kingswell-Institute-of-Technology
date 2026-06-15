// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Attendance.jsx (Admin Page)                          ║
// ║  PATH: frontend/src/admin/Attendance.jsx                    ║
// ║                                                              ║
// ║  KYA HAI? → Admin attendance management page.                ║
// ║  → Students ko select karke present/absent/late mark karna. ║
// ║  → Date, subject, semester wise filter hota hai.            ║
// ║  → Attendance history bhi dekh sakte hain.                  ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/Attendance.jsx — Admin Attendance Management
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarCheck, FaUserCheck, FaUserTimes, FaClock,
  FaFilter, FaSearch, FaSave, FaTrash, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: FaUserCheck },
  absent:  { label: 'Absent',  color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/30',         icon: FaUserTimes },
  late:    { label: 'Late',    color: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/30',   icon: FaClock },
};

const TODAY = new Date().toISOString().split('T')[0];

export default function Attendance() {
  // ── Mark Attendance state ──────────────────────────────────
  const [markDate,     setMarkDate]     = useState(TODAY);
  const [markSubject,  setMarkSubject]  = useState('');
  const [markSemester, setMarkSemester] = useState('');
  const [students,     setStudents]     = useState([]);   // all accepted students
  const [attendance,   setAttendance]   = useState({});   // { studentId: 'present'|'absent'|'late' }
  const [saving,       setSaving]       = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [existingId,   setExistingId]   = useState(null); // existing sheet id if already marked

  // ── Records / History state ────────────────────────────────
  const [tab,          setTab]          = useState('mark');  // 'mark' | 'history'
  const [records,      setRecords]      = useState([]);
  const [loadingRec,   setLoadingRec]   = useState(false);
  const [filterDate,   setFilterDate]   = useState('');
  const [filterSub,    setFilterSub]    = useState('');
  const [filterSem,    setFilterSem]    = useState('');
  const [searchQ,      setSearchQ]      = useState('');
  const [expanded,     setExpanded]     = useState(null);

  // ── Load accepted students once ────────────────────────────
  useEffect(() => {
    setLoadingStudents(true);
    api.get('/attendance/students')
      .then(({ data }) => {
        setStudents(data.data || []);
        // Default all to absent
        const init = {};
        (data.data || []).forEach(s => { init[s._id] = 'absent'; });
        setAttendance(init);
      })
      .catch(() => toast.error('Could not load students'))
      .finally(() => setLoadingStudents(false));
  }, []);

  // ── Check if attendance already marked for this date+subject+semester ──
  useEffect(() => {
    if (!markDate || !markSubject.trim() || !markSemester.trim()) {
      setExistingId(null);
      // Reset to absent
      const init = {};
      students.forEach(s => { init[s._id] = 'absent'; });
      setAttendance(init);
      return;
    }

    api.get('/attendance/check', { params: { date: markDate, subject: markSubject.trim(), semester: markSemester.trim() } })
      .then(({ data }) => {
        if (data.data) {
          setExistingId(data.data._id);
          const map = {};
          data.data.records.forEach(r => {
            const sid = r.student?._id || r.student;
            map[sid] = r.status;
          });
          // fill remaining students as absent
          students.forEach(s => { if (!map[s._id]) map[s._id] = 'absent'; });
          setAttendance(map);
          toast('Attendance already marked — editing existing record', { icon: '✏️' });
        } else {
          setExistingId(null);
          const init = {};
          students.forEach(s => { init[s._id] = 'absent'; });
          setAttendance(init);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markDate, markSubject, markSemester]);

  // ── Load history records ───────────────────────────────────
  const loadRecords = () => {
    setLoadingRec(true);
    const params = {};
    if (filterDate) params.date     = filterDate;
    if (filterSub)  params.subject  = filterSub;
    if (filterSem)  params.semester = filterSem;
    api.get('/attendance', { params })
      .then(({ data }) => setRecords(data.data || []))
      .catch(() => toast.error('Failed to load records'))
      .finally(() => setLoadingRec(false));
  };

  useEffect(() => { if (tab === 'history') loadRecords(); }, [tab]);

  // ── Stats from mark tab ────────────────────────────────────
  const stats = useMemo(() => {
    const vals = Object.values(attendance);
    return {
      total:   vals.length,
      present: vals.filter(v => v === 'present').length,
      absent:  vals.filter(v => v === 'absent').length,
      late:    vals.filter(v => v === 'late').length,
    };
  }, [attendance]);

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendance(updated);
  };

  const toggleStatus = (studentId) => {
    setAttendance(prev => {
      const curr = prev[studentId] || 'absent';
      const next = curr === 'present' ? 'absent' : curr === 'absent' ? 'late' : 'present';
      return { ...prev, [studentId]: next };
    });
  };

  const setStatus = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!markSubject.trim() || !markSemester.trim()) {
      return toast.error('Please enter subject and semester');
    }
    setSaving(true);
    const records = students.map(s => ({ student: s._id, status: attendance[s._id] || 'absent' }));
    try {
      await api.post('/attendance', {
        date:     markDate,
        subject:  markSubject.trim(),
        semester: markSemester.trim(),
        records,
      });
      toast.success(existingId ? 'Attendance updated!' : 'Attendance saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await api.delete(`/attendance/${id}`);
      setRecords(prev => prev.filter(r => r._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ── History filtered records ───────────────────────────────
  const filteredRecords = useMemo(() => {
    if (!searchQ.trim()) return records;
    const q = searchQ.toLowerCase();
    return records.filter(r =>
      r.subject.toLowerCase().includes(q) ||
      r.semester.toLowerCase().includes(q)
    );
  }, [records, searchQ]);

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Attendance</h1>
          <p className="text-gray-400 text-sm mt-0.5">Mark and manage student attendance</p>
        </div>
        {/* Tab switcher */}
        <div className="flex bg-dark-300 border border-gray-800 rounded-xl p-1 gap-1">
          {['mark', 'history'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-gold text-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'mark' ? 'Mark Attendance' : 'History'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mark Attendance Tab ──────────────────────────────── */}
      {tab === 'mark' && (
        <div className="space-y-5">
          {/* Session Details */}
          <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Session Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Date</label>
                <input
                  type="date"
                  value={markDate}
                  onChange={e => setMarkDate(e.target.value)}
                  max={TODAY}
                  className="input-admin w-full"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Subject</label>
                <input
                  type="text"
                  value={markSubject}
                  onChange={e => setMarkSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="input-admin w-full"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Semester</label>
                <input
                  type="text"
                  value={markSemester}
                  onChange={e => setMarkSemester(e.target.value)}
                  placeholder="e.g. Semester 1"
                  className="input-admin w-full"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total',   value: stats.total,   color: 'text-white',         key: 'total' },
              { label: 'Present', value: stats.present, color: 'text-emerald-400',   key: 'present' },
              { label: 'Absent',  value: stats.absent,  color: 'text-red-400',       key: 'absent' },
              { label: 'Late',    value: stats.late,    color: 'text-yellow-400',    key: 'late' },
            ].map(c => (
              <div key={c.key} className="bg-dark-200 border border-gray-800 rounded-xl p-4 text-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest">{c.label}</p>
                <p className={`text-2xl font-bold font-heading mt-1 ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 text-sm">Mark all:</span>
            {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
              <button
                key={s}
                onClick={() => markAll(s)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-80 ${cfg.bg} ${cfg.color}`}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Student list */}
          {loadingStudents ? (
            <div className="text-center py-12 text-gray-500">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No accepted students found.</div>
          ) : (
            <div className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 text-xs px-5 py-3 font-medium">Student</th>
                    <th className="text-left text-gray-500 text-xs px-5 py-3 font-medium hidden sm:table-cell">Adm No.</th>
                    <th className="text-left text-gray-500 text-xs px-5 py-3 font-medium hidden md:table-cell">Course</th>
                    <th className="text-center text-gray-500 text-xs px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const status = attendance[s._id] || 'absent';
                    const cfg    = STATUS_CONFIG[status];
                    return (
                      <tr
                        key={s._id}
                        className={`border-b border-gray-800/50 transition-colors ${i % 2 === 0 ? '' : 'bg-dark-300/20'}`}
                      >
                        <td className="px-5 py-3">
                          <p className="text-white font-medium">{s.firstName} {s.lastName}</p>
                          <p className="text-gray-500 text-xs">{s.email}</p>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <span className="text-xs bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-mono">
                            {s.admissionNumber || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">
                          {s.courseApplied?.title || '—'}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {/* 3-button toggle */}
                          <div className="inline-flex rounded-lg overflow-hidden border border-gray-700">
                            {Object.entries(STATUS_CONFIG).map(([st, c]) => (
                              <button
                                key={st}
                                onClick={() => setStatus(s._id, st)}
                                title={c.label}
                                className={`px-3 py-1.5 text-xs font-medium transition-all ${
                                  status === st
                                    ? `${c.bg} ${c.color}`
                                    : 'text-gray-500 hover:text-white bg-transparent'
                                }`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !markSubject.trim() || !markSemester.trim()}
              className="btn-admin-primary flex items-center gap-2"
            >
              <FaSave size={14} />
              {saving ? 'Saving...' : existingId ? 'Update Attendance' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}

      {/* ── History Tab ─────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Date</label>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="input-admin w-full" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Subject</label>
                <input type="text" value={filterSub} onChange={e => setFilterSub(e.target.value)} placeholder="Any" className="input-admin w-full" />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1.5">Semester</label>
                <input type="text" value={filterSem} onChange={e => setFilterSem(e.target.value)} placeholder="Any" className="input-admin w-full" />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={loadRecords} className="btn-admin-primary w-full flex items-center justify-center gap-2">
                  <FaFilter size={12} /> Apply
                </button>
              </div>
            </div>
            {/* Search */}
            <div className="mt-3 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              <input
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search subject or semester..."
                className="input-admin w-full pl-9"
              />
            </div>
          </div>

          {loadingRec ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No records found.</div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map(rec => {
                const isOpen   = expanded === rec._id;
                const present  = rec.records.filter(r => r.status === 'present').length;
                const late     = rec.records.filter(r => r.status === 'late').length;
                const absent   = rec.records.filter(r => r.status === 'absent').length;
                const total    = rec.records.length;
                const pct      = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

                return (
                  <motion.div key={rec._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
                    {/* Header row */}
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-dark-300/30 transition-colors"
                      onClick={() => setExpanded(isOpen ? null : rec._id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                          <FaCalendarCheck className="text-gold" size={16} />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{rec.subject}</p>
                          <p className="text-gray-400 text-xs">{rec.semester} · {new Date(rec.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex gap-3 text-xs font-medium">
                          <span className="text-emerald-400">{present}P</span>
                          <span className="text-yellow-400">{late}L</span>
                          <span className="text-red-400">{absent}A</span>
                          <span className="text-gray-400">({pct}%)</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteRecord(rec._id); }}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1"
                        >
                          <FaTrash size={13} />
                        </button>
                        {isOpen ? <FaChevronUp size={13} className="text-gray-500" /> : <FaChevronDown size={13} className="text-gray-500" />}
                      </div>
                    </div>

                    {/* Expanded student breakdown */}
                    {isOpen && (
                      <div className="border-t border-gray-800 px-5 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {rec.records.map((r, j) => {
                            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.absent;
                            const stu = r.student;
                            return (
                              <div key={j} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${cfg.bg}`}>
                                <div>
                                  <p className="text-white text-xs font-medium">
                                    {stu ? `${stu.firstName} ${stu.lastName}` : 'Unknown'}
                                  </p>
                                  <p className="text-gray-500 text-xs">{stu?.admissionNumber || '—'}</p>
                                </div>
                                <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
