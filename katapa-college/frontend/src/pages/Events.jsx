// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Events.jsx (Student/Public Page)                     ║
// ║  PATH: frontend/src/pages/Events.jsx                         ║
// ║                                                              ║
// ║  KYA HAI? → Public event calendar page.                     ║
// ║  → Students/visitors upcoming events dekhte hain.           ║
// ║  → Category filter, featured highlight, timeline layout.    ║
// ║  → Route: /events (public — no login required)              ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStar, FaUser, FaFilter,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

const CATEGORIES = ['academic', 'cultural', 'sports', 'seminar', 'workshop', 'holiday', 'exam', 'other'];

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

const CAT_BG = {
  academic:  'from-blue-500/20 to-blue-500/5',
  cultural:  'from-purple-500/20 to-purple-500/5',
  sports:    'from-green-500/20 to-green-500/5',
  seminar:   'from-cyan-500/20 to-cyan-500/5',
  workshop:  'from-orange-500/20 to-orange-500/5',
  holiday:   'from-red-500/20 to-red-500/5',
  exam:      'from-yellow-500/20 to-yellow-500/5',
  other:     'from-gray-500/20 to-gray-500/5',
};

export default function Events() {
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    api.get('/events')
      .then(({ data }) => setEvents(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const fmtDay  = (d) => new Date(d).getDate();
  const fmtMonth = (d) => new Date(d).toLocaleString('en', { month: 'short' }).toUpperCase();

  const filtered = filterCat === 'all' ? events : events.filter(e => e.category === filterCat);
  const featured = events.filter(e => e.featured);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-5xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="font-heading font-bold text-white text-3xl sm:text-4xl mb-2">Event Calendar</h1>
            <p className="text-gray-400 max-w-md mx-auto">Stay updated with upcoming events, workshops, and activities at Kingswell Institute</p>
          </motion.div>

          {/* Featured Events Banner */}
          {featured.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <FaStar size={14} className="text-gold" />
                <span className="text-gold text-sm font-bold uppercase tracking-widest">Featured Events</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {featured.slice(0, 2).map((ev, i) => (
                  <div key={ev._id} className={`bg-gradient-to-br ${CAT_BG[ev.category] || CAT_BG.other} border border-gold/20 rounded-2xl p-5`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${CAT_COLORS[ev.category]}`}>{ev.category}</span>
                      <FaStar size={10} className="text-gold" />
                    </div>
                    <h3 className="text-white font-heading font-bold text-lg mb-1">{ev.title}</h3>
                    {ev.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{ev.description}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {fmtDate(ev.startDate)}{ev.endDate ? ` — ${fmtDate(ev.endDate)}` : ''}</span>
                      {ev.startTime && <span className="flex items-center gap-1"><FaClock size={10} /> {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}</span>}
                      {ev.venue && <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {ev.venue}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Filter */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex flex-wrap items-center gap-2 mb-8">
            <FaFilter size={12} className="text-gray-500" />
            <button onClick={() => setFilterCat('all')}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${filterCat === 'all' ? 'bg-gold/20 text-gold border-gold/30' : 'text-gray-400 border-gray-700 hover:text-white'}`}>
              All Events
            </button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={`px-3 py-1 rounded-full text-xs border capitalize transition-colors ${filterCat === c ? CAT_COLORS[c] : 'text-gray-400 border-gray-700 hover:text-white'}`}>
                {c}
              </button>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && <div className="text-center py-20 text-gray-500">Loading events...</div>}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-500">
              <FaCalendarAlt size={52} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg text-white mb-1">No Upcoming Events</p>
              <p className="text-sm">Check back later for new events and activities.</p>
            </motion.div>
          )}

          {/* Event Cards - Timeline */}
          {!loading && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((ev, i) => (
                <motion.div key={ev._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 group">
                  {/* Date column */}
                  <div className="shrink-0 w-16 text-center">
                    <div className={`bg-dark-200 border rounded-xl py-2 transition-colors ${
                      ev.status === 'ongoing' ? 'border-green-500/30' : 'border-gray-800 group-hover:border-gold/30'
                    }`}>
                      <span className="text-gold text-xl font-bold font-heading block leading-none">{fmtDay(ev.startDate)}</span>
                      <span className="text-gray-500 text-[10px] font-medium uppercase">{fmtMonth(ev.startDate)}</span>
                    </div>
                    {/* Timeline line */}
                    {i < filtered.length - 1 && (
                      <div className="w-px h-4 bg-gray-800 mx-auto mt-1" />
                    )}
                  </div>

                  {/* Event card */}
                  <div className={`flex-1 bg-dark-200 border rounded-2xl p-5 transition-colors ${
                    ev.status === 'ongoing' ? 'border-green-500/20' : 'border-gray-800 hover:border-gray-700'
                  }`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${CAT_COLORS[ev.category]}`}>{ev.category}</span>
                        {ev.status === 'ongoing' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-green-400 bg-green-400/10 border-green-400/20 animate-pulse">● Ongoing</span>
                        )}
                        {ev.featured && <FaStar size={10} className="text-gold" />}
                      </div>
                    </div>

                    <h3 className="text-white font-heading font-medium text-base mb-1">{ev.title}</h3>
                    {ev.description && <p className="text-gray-500 text-sm mb-3 line-clamp-3">{ev.description}</p>}

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {ev.endDate && (
                        <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {fmtDate(ev.startDate)} — {fmtDate(ev.endDate)}</span>
                      )}
                      {ev.startTime && (
                        <span className="flex items-center gap-1"><FaClock size={10} /> {ev.startTime}{ev.endTime ? ` - ${ev.endTime}` : ''}</span>
                      )}
                      {ev.venue && (
                        <span className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {ev.venue}</span>
                      )}
                      {ev.organizer && (
                        <span className="flex items-center gap-1"><FaUser size={10} /> {ev.organizer}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
