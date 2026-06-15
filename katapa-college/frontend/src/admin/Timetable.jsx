// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Timetable.jsx (Admin Page)                           ║
// ║  PATH: frontend/src/admin/Timetable.jsx                     ║
// ║                                                              ║
// ║  KYA HAI? → Admin timetable manager page.                    ║
// ║  → Class slots create, edit, delete karna.                  ║
// ║  → Day, time, subject, teacher, room set karna.             ║
// ║  → Course aur semester wise manage hota hai.                ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/Timetable.jsx — Admin Timetable Manager
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaClock, FaChalkboard, FaFilter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TYPE_COLOR = {
  lecture:  'bg-blue-400/10 text-blue-400 border-blue-400/20',
  lab:      'bg-purple-400/10 text-purple-400 border-purple-400/20',
  tutorial: 'bg-teal-400/10 text-teal-400 border-teal-400/20',
  exam:     'bg-red-400/10 text-red-400 border-red-400/20',
};

const EMPTY_FORM = { day: 'Monday', subject: '', teacher: '', room: '', startTime: '09:00', endTime: '10:00', semester: '', course: '', type: 'lecture' };

export default function Timetable() {
  const [slots,     setSlots]     = useState([]);
  const [courses,   setCourses]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [filterSem, setFilterSem] = useState('');
  const [filterCrs, setFilterCrs] = useState('');
  const [viewMode,  setViewMode]  = useState('grid'); // 'grid' | 'list'

  const loadSlots = () => {
    setLoading(true);
    const params = {};
    if (filterSem) params.semester = filterSem;
    if (filterCrs) params.course   = filterCrs;
    api.get('/timetable', { params })
      .then(({ data }) => setSlots(data.data || []))
      .catch(() => toast.error('Failed to load timetable'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/courses').then(({ data }) => setCourses(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { loadSlots(); }, [filterSem, filterCrs]);

  // Group slots by day
  const byDay = useMemo(() => {
    const map = {};
    DAYS.forEach(d => { map[d] = []; });
    slots.forEach(s => { if (map[s.day]) map[s.day].push(s); });
    return map;
  }, [slots]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (slot) => {
    setEditing(slot._id);
    setForm({
      day:       slot.day,
      subject:   slot.subject,
      teacher:   slot.teacher,
      room:      slot.room || '',
      startTime: slot.startTime,
      endTime:   slot.endTime,
      semester:  slot.semester,
      course:    slot.course?._id || '',
      type:      slot.type || 'lecture',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.subject.trim() || !form.teacher.trim() || !form.semester.trim() || !form.startTime || !form.endTime) {
      return toast.error('Subject, teacher, semester and times are required');
    }
    setSaving(true);
    const payload = { ...form, course: form.course || undefined };
    try {
      if (editing) {
        const { data } = await api.put(`/timetable/${editing}`, payload);
        setSlots(prev => prev.map(s => s._id === editing ? data.data : s));
        toast.success('Slot updated');
      } else {
        const { data } = await api.post('/timetable', payload);
        setSlots(prev => [...prev, data.data]);
        toast.success('Slot added');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      setSlots(prev => prev.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const semesterOptions = [...new Set(slots.map(s => s.semester))].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Timetable</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage weekly class schedule</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-dark-300 border border-gray-800 rounded-xl p-1 gap-1">
            {['grid', 'list'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${viewMode === v ? 'bg-gold text-dark' : 'text-gray-400 hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={openAdd} className="btn-admin-primary flex items-center gap-2">
            <FaPlus size={12} /> Add Slot
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="input-admin text-sm">
          <option value="">All Semesters</option>
          {semesterOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCrs} onChange={e => setFilterCrs(e.target.value)} className="input-admin text-sm">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
        {(filterSem || filterCrs) && (
          <button onClick={() => { setFilterSem(''); setFilterCrs(''); }} className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg border border-gray-700">
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Slots',  value: slots.length,                                   color: 'text-white' },
          { label: 'Lectures',     value: slots.filter(s => s.type === 'lecture').length,  color: 'text-blue-400' },
          { label: 'Labs',         value: slots.filter(s => s.type === 'lab').length,      color: 'text-purple-400' },
          { label: 'Active Days',  value: DAYS.filter(d => byDay[d]?.length > 0).length,  color: 'text-gold' },
        ].map(c => (
          <div key={c.label} className="bg-dark-200 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-xs uppercase tracking-widest">{c.label}</p>
            <p className={`text-2xl font-bold font-heading mt-1 ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading timetable...</div>
      ) : slots.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <FaChalkboard size={40} className="mx-auto mb-3 opacity-10" />
          <p>No slots yet. Click "Add Slot" to get started.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID VIEW — weekly calendar ── */
        <div className="space-y-4">
          {DAYS.map(day => {
            const daySlots = byDay[day] || [];
            if (!daySlots.length) return null;
            return (
              <div key={day} className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Day header */}
                <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">{day}</span>
                  <span className="text-gray-500 text-xs">{daySlots.length} class{daySlots.length !== 1 ? 'es' : ''}</span>
                </div>
                {/* Slots */}
                <div className="p-4 flex flex-wrap gap-3">
                  {daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(slot => (
                    <motion.div key={slot._id} layout
                      className="bg-dark-300 border border-gray-700 rounded-xl p-3 min-w-[180px] flex-1 relative group">
                      {/* Type badge */}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${TYPE_COLOR[slot.type]}`}>
                        {slot.type}
                      </span>
                      <p className="text-white font-semibold mt-2 text-sm">{slot.subject}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{slot.teacher}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <FaClock size={10} />
                        <span>{slot.startTime} – {slot.endTime}</span>
                        {slot.room && <span>· {slot.room}</span>}
                      </div>
                      {slot.semester && <p className="text-gray-600 text-xs mt-1">{slot.semester}</p>}
                      {/* Hover actions */}
                      <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                        <button onClick={() => openEdit(slot)} className="bg-dark-200 text-gray-400 hover:text-gold p-1.5 rounded-lg transition-colors">
                          <FaEdit size={11} />
                        </button>
                        <button onClick={() => handleDelete(slot._id)} className="bg-dark-200 text-gray-400 hover:text-red-400 p-1.5 rounded-lg transition-colors">
                          <FaTrash size={11} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Day', 'Subject', 'Teacher', 'Time', 'Room', 'Semester', 'Type', ''].map(h => (
                  <th key={h} className="text-left text-gray-500 text-xs px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.startTime.localeCompare(b.startTime))
                .map((slot, i) => (
                  <tr key={slot._id} className={`border-b border-gray-800/50 ${i % 2 === 0 ? '' : 'bg-dark-300/20'}`}>
                    <td className="px-4 py-3 text-white font-medium">{slot.day}</td>
                    <td className="px-4 py-3 text-gray-200">{slot.subject}</td>
                    <td className="px-4 py-3 text-gray-400">{slot.teacher}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{slot.startTime} – {slot.endTime}</td>
                    <td className="px-4 py-3 text-gray-500">{slot.room || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{slot.semester}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${TYPE_COLOR[slot.type]}`}>{slot.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(slot)} className="text-gray-500 hover:text-gold transition-colors p-1">
                          <FaEdit size={13} />
                        </button>
                        <button onClick={() => handleDelete(slot._id)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
            <motion.div className="bg-dark-200 border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}>
              <h2 className="text-white font-heading font-bold text-lg mb-6">{editing ? 'Edit Slot' : 'Add Slot'}</h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Day */}
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Day *</label>
                  <select value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className="input-admin w-full">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* Type */}
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input-admin w-full">
                    {['lecture', 'lab', 'tutorial', 'exam'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                {/* Subject */}
                <div className="col-span-2">
                  <label className="text-gray-400 text-xs block mb-1.5">Subject *</label>
                  <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Mathematics" className="input-admin w-full" />
                </div>
                {/* Teacher */}
                <div className="col-span-2">
                  <label className="text-gray-400 text-xs block mb-1.5">Teacher *</label>
                  <input type="text" value={form.teacher} onChange={e => setForm(p => ({ ...p, teacher: e.target.value }))} placeholder="e.g. Dr. Ahmed" className="input-admin w-full" />
                </div>
                {/* Start time */}
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Start Time *</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="input-admin w-full" />
                </div>
                {/* End time */}
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">End Time *</label>
                  <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="input-admin w-full" />
                </div>
                {/* Room */}
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Room / Lab</label>
                  <input type="text" value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} placeholder="e.g. Room 101" className="input-admin w-full" />
                </div>
                {/* Semester */}
                <div>
                  <label className="text-gray-400 text-xs block mb-1.5">Semester *</label>
                  <input type="text" value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} placeholder="e.g. Semester 1" className="input-admin w-full" />
                </div>
                {/* Course */}
                <div className="col-span-2">
                  <label className="text-gray-400 text-xs block mb-1.5">Link to Course (optional)</label>
                  <select value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} className="input-admin w-full">
                    <option value="">— Not linked —</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-admin-primary">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Add Slot'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
