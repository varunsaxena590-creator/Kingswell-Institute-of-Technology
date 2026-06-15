// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Contacts.jsx (Admin Page)                            ║
// ║  PATH: frontend/src/admin/Contacts.jsx                      ║
// ║                                                              ║
// ║  KYA HAI? → Contact enquiries manage karne ka admin page.    ║
// ║  → Public users ke messages dikhata hai.                    ║
// ║  → Status update (unread/read/replied) aur delete karna.    ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/Contacts.jsx — Contact Inquiries Admin Page
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaTrash, FaEye, FaTimes, FaCheckCircle, FaCircle, FaSearch } from 'react-icons/fa';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  unread:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  read:     'bg-blue-500/20 text-blue-400 border-blue-500/40',
  replied:  'bg-green-500/20 text-green-400 border-green-500/40',
};

export default function Contacts() {
  const [contacts, setContacts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null); // view modal

  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/contacts');
      setContacts(data.data);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContacts(); }, []);

  const markStatus = async (id, status) => {
    try {
      await api.put(`/contacts/${id}`, { status });
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts(prev => prev.filter(c => c._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Message deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const openModal = async (contact) => {
    setSelected(contact);
    if (contact.status === 'unread') markStatus(contact._id, 'read');
  };

  const filtered = contacts.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const unreadCount = contacts.filter(c => c.status === 'unread').length;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Contact Inquiries</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {contacts.length} total messages
            {unreadCount > 0 && <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">{unreadCount} unread</span>}
          </p>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or subject..."
            className="w-full bg-dark-200 border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'unread', 'read', 'replied'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${filter === f ? 'bg-gold text-dark' : 'bg-dark-200 text-gray-400 border border-gray-700 hover:border-gold/50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FaEnvelope className="text-4xl text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No messages found</p>
        </div>
      ) : (
        <div className="bg-dark-200 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Sender</th>
                  <th className="text-left px-5 py-3">Subject</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-center px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-gray-800/50 hover:bg-dark-300/50 transition-colors cursor-pointer ${c.status === 'unread' ? 'bg-yellow-500/5' : ''}`}
                    onClick={() => openModal(c)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-dark font-bold text-xs shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${c.status === 'unread' ? 'text-white' : 'text-gray-300'}`}>{c.name}</p>
                          <p className="text-gray-500 text-xs">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-300 max-w-xs truncate">{c.subject}</td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_COLORS[c.status] || STATUS_COLORS.read}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(c)} title="View" className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition">
                          <FaEye className="text-xs" />
                        </button>
                        {c.status !== 'replied' && (
                          <button onClick={() => markStatus(c._id, 'replied')} title="Mark Replied" className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition">
                            <FaCheckCircle className="text-xs" />
                          </button>
                        )}
                        {c.status === 'read' && (
                          <button onClick={() => markStatus(c._id, 'unread')} title="Mark Unread" className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition">
                            <FaCircle className="text-xs" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(c._id)} title="Delete" className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition">
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-dark-200 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                <h3 className="text-white font-heading font-semibold text-lg">Message Details</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white transition">
                  <FaTimes />
                </button>
              </div>
              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center text-dark font-bold text-lg">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{selected.name}</p>
                    <p className="text-gray-400 text-sm">{selected.email}</p>
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_COLORS[selected.status] || STATUS_COLORS.read}`}>
                    {selected.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-white font-medium">{selected.subject}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Message</p>
                  <p className="text-gray-300 text-sm leading-relaxed bg-dark-300 rounded-lg p-4">{selected.message}</p>
                </div>
                <p className="text-gray-600 text-xs">Received: {formatDate(selected.createdAt)}</p>
              </div>
              {/* Modal Footer */}
              <div className="flex gap-2 px-6 py-4 border-t border-gray-700">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  onClick={() => markStatus(selected._id, 'replied')}
                  className="flex-1 bg-gold text-dark font-semibold text-sm py-2.5 rounded-lg text-center hover:bg-gold/90 transition"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => handleDelete(selected._id)}
                  className="px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm hover:bg-red-500/20 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
