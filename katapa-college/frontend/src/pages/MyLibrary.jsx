// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyLibrary.jsx (Student Page)                         ║
// ║  PATH: frontend/src/pages/MyLibrary.jsx                      ║
// ║                                                              ║
// ║  KYA HAI? → Student apni issued/returned books dekhta hai.  ║
// ║  → Kaunsi book li, due date, return status, fine dikhata.   ║
// ║  → Overdue books red highlight hoti hain.                   ║
// ║  → Route: /my-library (protected — login required)          ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaBook, FaCalendarAlt, FaCheckCircle, FaClock,
  FaExclamationTriangle, FaMapMarkerAlt,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

const STATUS_CONFIG = {
  issued:   { icon: FaClock,               color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', label: 'Issued' },
  overdue:  { icon: FaExclamationTriangle, color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',    label: 'Overdue' },
  returned: { icon: FaCheckCircle,         color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20', label: 'Returned' },
};

export default function MyLibrary() {
  const [issues,  setIssues]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/library/my')
      .then(({ data }) => setIssues(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const stats = {
    total: issues.length,
    active: issues.filter(i => i.status === 'issued').length,
    overdue: issues.filter(i => i.status === 'overdue').length,
    returned: issues.filter(i => i.status === 'returned').length,
    totalFine: issues.reduce((a, i) => a + (i.fine || 0), 0),
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-4xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">My Library</h1>
            <p className="text-gray-400">Track your issued books, due dates & fines</p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Currently Issued', value: stats.active,   color: 'text-yellow-400' },
              { label: 'Overdue',          value: stats.overdue,  color: 'text-red-400' },
              { label: 'Returned',         value: stats.returned, color: 'text-green-400' },
              { label: 'Total Fine',       value: `₹${stats.totalFine}`, color: stats.totalFine > 0 ? 'text-red-400' : 'text-white' },
            ].map(s => (
              <div key={s.label} className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-3">
                <p className="text-gray-500 text-xs uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-bold font-heading mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20 text-gray-500">Loading your library records...</div>
          )}

          {/* Empty */}
          {!loading && issues.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-500">
              <FaBook size={52} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg text-white mb-1">No Books Issued</p>
              <p className="text-sm">Books issued to you will appear here.</p>
            </motion.div>
          )}

          {/* Book Cards */}
          {!loading && issues.length > 0 && (
            <div className="space-y-4">
              {issues.map((issue, i) => {
                const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.issued;
                const Icon = cfg.icon;
                const daysLeft = issue.status !== 'returned'
                  ? Math.ceil((new Date(issue.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <motion.div key={issue._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-dark-200 border rounded-2xl p-5 transition-colors ${
                      issue.status === 'overdue' ? 'border-red-500/30' : 'border-gray-800 hover:border-gray-700'
                    }`}>
                    <div className="flex items-start gap-4">
                      {/* Book icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        issue.status === 'overdue' ? 'bg-red-400/10 text-red-400' :
                        issue.status === 'returned' ? 'bg-green-400/10 text-green-400' :
                        'bg-gold/10 text-gold'
                      }`}>
                        <FaBook size={20} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="text-white font-medium text-base truncate">{issue.book?.title}</h3>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize shrink-0 flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                            <Icon size={10} /> {cfg.label}
                          </span>
                        </div>

                        <p className="text-gray-400 text-sm mb-3">by {issue.book?.author}</p>

                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt size={10} /> Issued: {fmtDate(issue.issueDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock size={10} /> Due: {fmtDate(issue.dueDate)}
                          </span>
                          {issue.returnDate && (
                            <span className="flex items-center gap-1">
                              <FaCheckCircle size={10} className="text-green-400" /> Returned: {fmtDate(issue.returnDate)}
                            </span>
                          )}
                          {issue.book?.shelfLocation && (
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt size={10} /> {issue.book.shelfLocation}
                            </span>
                          )}
                        </div>

                        {/* Due date warning or fine */}
                        <div className="mt-3 flex flex-wrap gap-3">
                          {issue.status === 'issued' && daysLeft !== null && (
                            <span className={`text-xs px-3 py-1 rounded-full border ${
                              daysLeft <= 2 ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' :
                              'text-blue-400 bg-blue-400/10 border-blue-400/20'
                            }`}>
                              {daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} left` : 'Due today!'}
                            </span>
                          )}
                          {issue.status === 'overdue' && daysLeft !== null && (
                            <span className="text-xs px-3 py-1 rounded-full border text-red-400 bg-red-400/10 border-red-400/20">
                              {Math.abs(daysLeft)} day{Math.abs(daysLeft) > 1 ? 's' : ''} overdue
                            </span>
                          )}
                          {issue.fine > 0 && (
                            <span className="text-xs px-3 py-1 rounded-full border text-red-400 bg-red-400/10 border-red-400/20 font-medium">
                              Fine: ₹{issue.fine}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
