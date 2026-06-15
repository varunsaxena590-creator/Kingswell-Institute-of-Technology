// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyTimetable.jsx (Student Page)                       ║
// ║  PATH: frontend/src/pages/MyTimetable.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Student ka weekly timetable dekhne ka page.      ║
// ║  → Day wise classes, time, subject, room dikhata hai.       ║
// ║  → GET /api/timetable/my se data fetch hota hai.            ║
// ║  → Route: /my-timetable (protected — login required)        ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/MyTimetable.jsx — Student Weekly Timetable View
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaChalkboardTeacher, FaDoorOpen } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TYPE_STYLE = {
  lecture:  { bg: 'bg-blue-400/10 border-blue-400/20',   text: 'text-blue-400',    dot: 'bg-blue-400' },
  lab:      { bg: 'bg-purple-400/10 border-purple-400/20', text: 'text-purple-400', dot: 'bg-purple-400' },
  tutorial: { bg: 'bg-teal-400/10 border-teal-400/20',   text: 'text-teal-400',    dot: 'bg-teal-400' },
  exam:     { bg: 'bg-red-400/10 border-red-400/20',     text: 'text-red-400',     dot: 'bg-red-400' },
};

// Get today's short day name for highlighting
const TODAY_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

export default function MyTimetable() {
  const [slots,    setSlots]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeDay, setActiveDay] = useState(TODAY_DAY);

  useEffect(() => {
    api.get('/timetable/my')
      .then(({ data }) => setSlots(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group by day
  const byDay = {};
  DAYS.forEach(d => { byDay[d] = []; });
  slots.forEach(s => { if (byDay[s.day]) byDay[s.day].push(s); });

  const activeDaySlots = (byDay[activeDay] || []).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalClasses    = slots.length;
  const activeDayCount  = DAYS.filter(d => byDay[d]?.length > 0).length;
  const todaySlots      = (byDay[TODAY_DAY] || []).length;

  // All unique subjects
  const subjects = [...new Set(slots.map(s => s.subject))];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-4xl mx-auto section-padding">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">My Timetable</h1>
            <p className="text-gray-400">Your weekly class schedule</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading timetable...</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FaCalendarAlt size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg">No timetable assigned yet.</p>
              <p className="text-sm mt-1">Check back once your admin sets up the class schedule.</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Weekly Classes', value: totalClasses,  color: 'text-white' },
                  { label: "Today's Classes",  value: todaySlots,   color: todaySlots > 0 ? 'text-gold' : 'text-gray-500' },
                  { label: 'Active Days',    value: activeDayCount, color: 'text-emerald-400' },
                ].map(c => (
                  <div key={c.label} className="bg-dark-200 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs uppercase tracking-widest">{c.label}</p>
                    <p className={`text-2xl font-bold font-heading mt-1 ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Day tab selector */}
              <div className="flex gap-2 flex-wrap mb-6">
                {DAYS.map(day => {
                  const count  = byDay[day]?.length || 0;
                  const isToday   = day === TODAY_DAY;
                  const isActive  = day === activeDay;
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        isActive
                          ? 'bg-gold text-dark border-gold'
                          : count === 0
                          ? 'text-gray-600 border-gray-800 bg-dark-200 cursor-default'
                          : 'text-gray-300 border-gray-700 bg-dark-200 hover:border-gold/40 hover:text-gold'
                      }`}
                    >
                      {day.slice(0, 3)}
                      {isToday && !isActive && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full" />
                      )}
                      {count > 0 && (
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-dark/20' : 'bg-dark-300'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active day classes */}
              {activeDaySlots.length === 0 ? (
                <div className="text-center py-12 text-gray-600 bg-dark-200 border border-gray-800 rounded-2xl">
                  <p>No classes on {activeDay}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeDaySlots.map((slot, i) => {
                    const style = TYPE_STYLE[slot.type] || TYPE_STYLE.lecture;
                    return (
                      <motion.div
                        key={slot._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className={`border rounded-2xl p-5 flex items-center gap-5 ${style.bg}`}
                      >
                        {/* Time column */}
                        <div className="text-center min-w-[64px]">
                          <p className={`text-base font-bold font-heading ${style.text}`}>{slot.startTime}</p>
                          <div className={`w-px h-4 mx-auto my-1 ${style.dot}`} />
                          <p className="text-gray-500 text-xs">{slot.endTime}</p>
                        </div>

                        {/* Divider line */}
                        <div className={`w-1 self-stretch rounded-full ${style.dot}`} />

                        {/* Subject details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-dark/30 capitalize ${style.text}`}>
                              {slot.type}
                            </span>
                            {slot.course?.title && (
                              <span className="text-xs text-gray-500">{slot.course.title}</span>
                            )}
                          </div>
                          <p className="text-white font-semibold text-base">{slot.subject}</p>
                          <div className="flex flex-wrap gap-4 mt-1.5">
                            <span className="text-gray-400 text-xs flex items-center gap-1.5">
                              <FaChalkboardTeacher size={11} /> {slot.teacher}
                            </span>
                            {slot.room && (
                              <span className="text-gray-400 text-xs flex items-center gap-1.5">
                                <FaDoorOpen size={11} /> {slot.room}
                              </span>
                            )}
                            <span className="text-gray-500 text-xs flex items-center gap-1.5">
                              <FaClock size={10} />
                              {(() => {
                                const [sh, sm] = slot.startTime.split(':').map(Number);
                                const [eh, em] = slot.endTime.split(':').map(Number);
                                return `${(eh * 60 + em) - (sh * 60 + sm)} min`;
                              })()}
                            </span>
                          </div>
                          {slot.semester && <p className="text-gray-600 text-xs mt-1">{slot.semester}</p>}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Subject legend */}
              {subjects.length > 0 && (
                <div className="mt-8 bg-dark-200 border border-gray-800 rounded-2xl p-5">
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Subjects this week</p>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(sub => (
                      <span key={sub} className="text-xs bg-dark-300 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Type legend */}
              <div className="mt-4 flex flex-wrap gap-3">
                {Object.entries(TYPE_STYLE).map(([type, s]) => (
                  <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                    <span className="capitalize">{type}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
