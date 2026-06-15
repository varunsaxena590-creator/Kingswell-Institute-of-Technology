// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: EventCalendar.jsx (Admin Page)                       ║
// ║  PATH: frontend/src/admin/EventCalendar.jsx                  ║
// ║                                                              ║
// ║  KYA HAI? → Admin event calendar management page.           ║
// ║  → Calendar grid view (month) + events list view.           ║
// ║  → Create / Edit / Delete events (modal form).              ║
// ║  → Category badges, featured toggle, status management.     ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarPlus, FaEdit, FaTrash, FaTimes, FaStar, FaMapMarkerAlt,
  FaClock, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaList, FaTh,
} from 'react-icons/fa';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['academic', 'cultural', 'sports', 'seminar', 'workshop', 'holiday', 'exam', 'other'];
const STATUSES   = ['upcoming', 'ongoing', 'completed', 'cancelled'];

const CAT_COLORS = {
  academic:  'bg-blue-400/15 text-blue-400 border-blue-400/20',
  cultural:  'bg-purple-400/15 text-purple-400 border-purple-400/20',
  sports:    'bg-green-400/15 text-green-400 border-green-400/20',
  seminar:   'bg-cyan-400/15 text-cyan-400 border-cyan-400/20',
  workshop:  'bg-orange-400/15 text-orange-400 border-orange-400/20',
  holiday:   'bg-red-400/15 text-red-400 border-red-400/20',
  exam:      'bg-yellow-400/15 text-yellow-400 border-yellow-400/20',
  other:     'bg-gray-400/15 text-gray-400 border-gray-400/20',
};

const STATUS_COLORS = {
  upcoming:  'text-blue-400',
  ongoing:   'text-green-400',
  completed: 'text-gray-500',
  cancelled: 'text-red-400',
};

const DOT_COLORS = {
  academic:  'bg-blue-400',
  cultural:  'bg-purple-400',
  sports:    'bg-green-400',
  seminar:   'bg-cyan-400',
  workshop:  'bg-orange-400',
  holiday:   'bg-red-400',
  exam:      'bg-yellow-400',
  other:     'bg-gray-400',
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const blankForm = {
  title: '', description: '', category: 'academic', startDate: '', endDate: '',
  startTime: '', endTime: '', venue: '', organizer: '', featured: false, status: 'upcoming',
};

export default function EventCalendar() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState('calendar'); // calendar | list
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState({ ...blankForm });
  const [filterCat, setFilterCat] = useState('all');

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events/all');
      setEvents(data.data || []);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  // ── Calendar helpers ──
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      const start = e.startDate?.slice(0, 10);
      const end   = e.endDate?.slice(0, 10) || start;
      return dateStr >= start && dateStr <= end;
    });
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };
  const goToday = () => { setCalYear(today.getFullYear()); setCalMonth(today.getMonth()); };

  // ── CRUD ──
  const openCreate = () => { setEditId(null); setForm({ ...blankForm }); setShowModal(true); };
  const openEdit = (ev) => {
    setEditId(ev._id);
    setForm({
      title: ev.title, description: ev.description || '', category: ev.category,
      startDate: ev.startDate?.slice(0, 10) || '', endDate: ev.endDate?.slice(0, 10) || '',
      startTime: ev.startTime || '', endTime: ev.endTime || '',
      venue: ev.venue || '', organizer: ev.organizer || '',
      featured: ev.featured, status: ev.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await api.put(`/events/${editId}`, form);
        setEvents(prev => prev.map(ev => ev._id === editId ? data.data : ev));
        toast.success('Event updated');
      } else {
        const { data } = await api.post('/events', form);
        setEvents(prev => [data.data, ...prev]);
        toast.success('Event created');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(prev => prev.filter(ev => ev._id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const filtered = filterCat === 'all' ? events : events.filter(e => e.category === filterCat);

  const isToday = (day) => day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Event Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">{events.length} events total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-dark-300 rounded-lg overflow-hidden border border-gray-800">
            <button onClick={() => setView('calendar')} className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'calendar' ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'}`}>
              <FaTh size={12} /> Calendar
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors ${view === 'list' ? 'bg-gold/20 text-gold' : 'text-gray-400 hover:text-white'}`}>
              <FaList size={12} /> List
            </button>
          </div>
          <button onClick={openCreate} className="btn-gold py-2 px-4 text-sm flex items-center gap-2">
            <FaCalendarPlus size={14} /> Add Event
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterCat('all')}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${filterCat === 'all' ? 'bg-gold/20 text-gold border-gold/30' : 'text-gray-400 border-gray-700 hover:text-white'}`}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-full text-xs border capitalize transition-colors ${filterCat === c ? CAT_COLORS[c] : 'text-gray-400 border-gray-700 hover:text-white'}`}>
            {c}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-20 text-gray-500">Loading events...</div>}

      {/* ═══ CALENDAR VIEW ═══ */}
      {!loading && view === 'calendar' && (
        <div className="bg-dark-200 border border-gray-800 rounded-2xl p-4 sm:p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-white transition-colors"><FaChevronLeft /></button>
            <div className="text-center">
              <h2 className="text-white font-heading text-lg font-bold">{MONTH_NAMES[calMonth]} {calYear}</h2>
              <button onClick={goToday} className="text-gold text-xs hover:underline">Today</button>
            </div>
            <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-white transition-colors"><FaChevronRight /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const filteredDayEvents = filterCat === 'all' ? dayEvents : dayEvents.filter(e => e.category === filterCat);
              return (
                <div key={i} className={`min-h-[70px] sm:min-h-[90px] rounded-lg p-1 transition-colors ${
                  day ? (isToday(day) ? 'bg-gold/10 border border-gold/30' : 'bg-dark-300/50 border border-gray-800/50 hover:border-gray-700') : ''
                }`}>
                  {day && (
                    <>
                      <span className={`text-xs font-medium ${isToday(day) ? 'text-gold' : 'text-gray-400'}`}>{day}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {filteredDayEvents.slice(0, 3).map(ev => (
                          <div key={ev._id} onClick={() => openEdit(ev)}
                            className="flex items-center gap-1 cursor-pointer group">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[ev.category] || 'bg-gray-400'}`}></span>
                            <span className="text-[10px] sm:text-xs text-gray-300 truncate group-hover:text-gold transition-colors">{ev.title}</span>
                          </div>
                        ))}
                        {filteredDayEvents.length > 3 && (
                          <span className="text-[10px] text-gray-500">+{filteredDayEvents.length - 3} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {!loading && view === 'list' && (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <FaCalendarAlt size={40} className="mx-auto mb-3 opacity-10" />
              <p>No events found</p>
            </div>
          )}
          {filtered.map((ev, i) => (
            <motion.div key={ev._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-dark-200 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-4">
                {/* Date badge */}
                <div className="shrink-0 w-14 h-14 bg-dark-300 border border-gray-700 rounded-xl flex flex-col items-center justify-center">
                  <span className="text-gold text-lg font-bold font-heading leading-none">
                    {new Date(ev.startDate).getDate()}
                  </span>
                  <span className="text-gray-500 text-[10px] uppercase">
                    {new Date(ev.startDate).toLocaleString('en', { month: 'short' })}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">{ev.title}</h3>
                    {ev.featured && <FaStar size={12} className="text-gold shrink-0" />}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${CAT_COLORS[ev.category]}`}>{ev.category}</span>
                    <span className={`text-[10px] font-bold capitalize ${STATUS_COLORS[ev.status]}`}>● {ev.status}</span>
                  </div>

                  {ev.description && <p className="text-gray-500 text-xs mb-2 line-clamp-2">{ev.description}</p>}

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {fmtDate(ev.startDate)}{ev.endDate ? ` — ${fmtDate(ev.endDate)}` : ''}</span>
                    {ev.startTime && <span className="flex items-center gap-1"><FaClock size={10} /> {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}</span>}
                    {ev.venue && <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {ev.venue}</span>}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(ev)} className="p-2 text-gray-500 hover:text-blue-400 transition-colors"><FaEdit size={14} /></button>
                  <button onClick={() => handleDelete(ev._id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors"><FaTrash size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ═══ MODAL ═══ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-200 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-white text-lg font-bold">{editId ? 'Edit Event' : 'Add Event'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><FaTimes size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="input-field w-full" placeholder="Event title" />
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-field w-full" placeholder="Event description..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field w-full">
                      {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field w-full">
                      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Start Date *</label>
                    <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">End Date</label>
                    <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Start Time</label>
                    <input value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className="input-field w-full" placeholder="e.g. 09:00 AM" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">End Time</label>
                    <input value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className="input-field w-full" placeholder="e.g. 05:00 PM" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Venue</label>
                    <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="input-field w-full" placeholder="Location" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Organizer</label>
                    <input value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} className="input-field w-full" placeholder="Organized by" />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-gold w-4 h-4" />
                  <FaStar size={12} className="text-gold" /> Mark as featured event
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline-gold py-2 px-4 text-sm flex-1">Cancel</button>
                  <button type="submit" className="btn-gold py-2 px-4 text-sm flex-1">{editId ? 'Update Event' : 'Create Event'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
