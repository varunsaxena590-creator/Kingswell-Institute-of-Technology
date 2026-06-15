// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Students.jsx (Admin Page)                            ║
// ║  PATH: frontend/src/admin/Students.jsx                      ║
// ║                                                              ║
// ║  KYA HAI? → Admin student applications manager.              ║
// ║  → Students ki list dikhata hai (pending/accepted/rejected).║
// ║  → Accept/reject karne pe student ko email jaata hai.       ║
// ║  → Student details modal mein dikhte hain.                  ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/Students.jsx — Student Applications Manager
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaUserGraduate, FaCheckCircle, FaTimesCircle, FaClock, FaEye, FaIdCard } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const STATUS_OPTS = ['all', 'pending', 'under_review', 'accepted', 'rejected'];
const statusStyle = {
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  under_review: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  accepted: 'bg-green-400/10 text-green-400 border-green-400/20',
  rejected: 'bg-red-400/10 text-red-400 border-red-400/20',
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null); // detail modal
  const [updating, setUpdating] = useState(false);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data.data || []);
      setFiltered(data.data || []);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    let res = students;
    if (search) res = res.filter(s => `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') res = res.filter(s => s.status === statusFilter);
    setFiltered(res);
  }, [search, statusFilter, students]);

  const updateStatus = async (id, status) => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/students/${id}`, { status });
      const updated = data.data;
      toast.success(`Status updated to ${status}`);
      setStudents(prev => prev.map(s => s._id === id ? { ...s, ...updated } : s));
      if (selected?._id === id) setSelected(prev => ({ ...prev, ...updated }));
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-bold text-white text-2xl">Applications</h2>
          <p className="text-gray-400 text-sm mt-1">Manage student admission applications</p>
        </div>
        <span className="bg-gold/10 text-gold text-sm font-semibold px-4 py-1.5 rounded-full border border-gold/20">
          {students.length} Total
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-gold text-dark' : 'bg-dark-300 text-gray-400 hover:text-gold border border-gray-700 hover:border-gold'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Student</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden lg:table-cell">Adm No.</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden sm:table-cell">Course</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden md:table-cell">Applied</th>
                <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium">Status</th>
                <th className="text-right text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-16 text-gray-500">Loading applications...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-500">
                  <FaUserGraduate size={32} className="mx-auto mb-3 opacity-20" />
                  No applications found
                </td></tr>
              ) : filtered.map((s, i) => (
                <motion.tr
                  key={s._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-800 hover:bg-dark-300/50 transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                        {s.firstName?.[0]}{s.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{s.firstName} {s.lastName}</p>
                        <p className="text-gray-500 text-xs">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 hidden lg:table-cell">
                    {s.admissionNumber
                      ? <span className="text-xs font-mono bg-gold/10 text-gold border border-gold/20 px-2 py-1 rounded-md">{s.admissionNumber}</span>
                      : <span className="text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="py-4 px-3 hidden sm:table-cell">
                    <p className="text-gray-300 text-sm">{s.courseApplied?.title || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-3 hidden md:table-cell">
                    <p className="text-gray-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-4 px-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusStyle[s.status] || ''}`}>
                      {s.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelected(s)} className="text-gray-400 hover:text-gold transition-colors p-1.5 rounded-lg hover:bg-gold/10" title="View details">
                        <FaEye size={14} />
                      </button>
                      {s.status === 'accepted' && (
                        <a href={`/my-id-card`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-400/10" title="View ID Card">
                          <FaIdCard size={14} />
                        </a>
                      )}
                      {s.status !== 'accepted' && (
                        <button onClick={() => updateStatus(s._id, 'accepted')} disabled={updating} className="text-gray-400 hover:text-green-400 transition-colors p-1.5 rounded-lg hover:bg-green-400/10" title="Accept">
                          <FaCheckCircle size={14} />
                        </button>
                      )}
                      {s.status !== 'rejected' && (
                        <button onClick={() => updateStatus(s._id, 'rejected')} disabled={updating} className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10" title="Reject">
                          <FaTimesCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-dark-200 border border-gray-700 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-white text-xl">Application Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Name', `${selected.firstName} ${selected.lastName}`],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Date of Birth', selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : '—'],
                ['Gender', selected.gender],
                ['Address', `${selected.address}, ${selected.city}, ${selected.country}`],
                ['Course Applied', selected.courseApplied?.title || selected.courseApplied || '—'],
                ['Previous School', selected.previousSchool || '—'],
                ['Previous Grade', selected.previousGrade || '—'],
                ['Application Date', new Date(selected.createdAt).toLocaleDateString()],
                ['Admission Number', selected.admissionNumber || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-white text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              {selected.admissionNumber && (
                <div className="flex justify-between border-b border-gold/30 pb-2 bg-gold/5 px-2 rounded">
                  <span className="text-gold font-semibold">Admission No.</span>
                  <span className="text-gold font-bold font-mono">{selected.admissionNumber}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">Status</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusStyle[selected.status] || ''}`}>
                  {selected.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              {['pending', 'under_review', 'accepted', 'rejected'].filter(s => s !== selected.status).map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(selected._id, status)}
                  disabled={updating}
                  className="flex-1 py-2 text-xs capitalize bg-dark-300 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gold transition-colors disabled:opacity-50"
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
