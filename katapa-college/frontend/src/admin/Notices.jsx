// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Notices.jsx (Admin Page)                             ║
// ║  PATH: frontend/src/admin/Notices.jsx                       ║
// ║                                                              ║
// ║  KYA HAI? → Admin notice board manager page.                 ║
// ║  → Notices create, edit, delete, pin/unpin karna.           ║
// ║  → Category: general/exam/holiday/urgent/event.             ║
// ║  → Create pe students ko email notification jaati hai.      ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/Notices.jsx — Admin Notice Board Manager
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaThumbtack, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const CATEGORIES = ['general', 'exam', 'holiday', 'urgent', 'event'];

const CAT_STYLE = {
  general:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  exam:     'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  holiday:  'bg-green-500/10 text-green-400 border-green-500/20',
  urgent:   'bg-red-500/10 text-red-400 border-red-500/20',
  event:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const CAT_ICON = {
  general: '📋', exam: '📝', holiday: '🏖️', urgent: '🚨', event: '🎉',
};

const emptyForm = { title: '', message: '', category: 'general', pinned: false, expiresAt: '' };

export default function Notices() {
  const [notices, setNotices]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);   // add/edit modal
  const [editId, setEditId]     = useState(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/notices/all');
      setNotices(data.data || []);
    } catch { toast.error('Failed to load notices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setModal(true); };
  const openEdit = (n) => {
    setForm({
      title:     n.title,
      message:   n.message,
      category:  n.category,
      pinned:    n.pinned,
      expiresAt: n.expiresAt ? n.expiresAt.substring(0, 10) : '',
    });
    setEditId(n._id);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { toast.error('Title and message required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, expiresAt: form.expiresAt || null };
      if (editId) {
        const { data } = await api.put(`/notices/${editId}`, payload);
        setNotices(prev => prev.map(n => n._id === editId ? data.data : n));
        toast.success('Notice updated');
      } else {
        const { data } = await api.post('/notices', payload);
        setNotices(prev => [data.data, ...prev]);
        toast.success('Notice posted');
      }
      setModal(false);
    } catch { toast.error('Failed to save notice'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    setDeleting(id);
    try {
      await api.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n._id !== id));
      toast.success('Notice deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const togglePin = async (n) => {
    try {
      const { data } = await api.put(`/notices/${n._id}`, { pinned: !n.pinned });
      setNotices(prev => prev.map(x => x._id === n._id ? data.data : x));
    } catch { toast.error('Failed to update'); }
  };

  const isExpired = (n) => n.expiresAt && new Date(n.expiresAt) < new Date();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-bold text-white text-2xl">Notice Board</h2>
          <p className="text-gray-400 text-sm mt-1">Post announcements visible to students and visitors</p>
        </div>
        <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5">
          <FaPlus size={12} /> New Notice
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',   value: notices.length,                            color: 'text-white' },
          { label: 'Active',  value: notices.filter(n => !isExpired(n)).length, color: 'text-green-400' },
          { label: 'Pinned',  value: notices.filter(n => n.pinned).length,      color: 'text-yellow-400' },
          { label: 'Urgent',  value: notices.filter(n => n.category === 'urgent').length, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-gray-500 text-xs uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold font-heading mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Notices list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FaBullhorn size={32} className="mx-auto mb-3 opacity-20" />
            <p>No notices yet. Post your first announcement!</p>
          </div>
        ) : notices.map((n, i) => (
          <motion.div
            key={n._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-dark-200 border rounded-xl p-4 flex gap-4 items-start transition-all ${
              isExpired(n) ? 'opacity-50 border-gray-800' : n.pinned ? 'border-gold/30' : 'border-gray-800'
            }`}
          >
            {/* Category icon */}
            <span className="text-2xl mt-0.5 shrink-0">{CAT_ICON[n.category]}</span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {n.pinned && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                    <FaThumbtack size={10} /> Pinned
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${CAT_STYLE[n.category]}`}>
                  {n.category}
                </span>
                {isExpired(n) && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-500/10 text-gray-500 border-gray-500/20">
                    Expired
                  </span>
                )}
              </div>
              <h3 className="text-white font-semibold text-sm">{n.title}</h3>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{n.message}</p>
              <div className="flex items-center gap-3 mt-2 text-gray-600 text-xs">
                <span>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                {n.expiresAt && <span>· Expires {new Date(n.expiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => togglePin(n)}
                title={n.pinned ? 'Unpin' : 'Pin'}
                className={`p-1.5 rounded-lg transition-colors ${n.pinned ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-400/10' : 'text-gray-600 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
              >
                <FaThumbtack size={13} />
              </button>
              <button onClick={() => openEdit(n)} className="p-1.5 rounded-lg text-gray-600 hover:text-gold hover:bg-gold/10 transition-colors">
                <FaEdit size={13} />
              </button>
              <button
                onClick={() => handleDelete(n._id)}
                disabled={deleting === n._id}
                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <FaTrash size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-white text-xl">
                  {editId ? 'Edit Notice' : 'New Notice'}
                </h3>
                <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="input-field w-full"
                    placeholder="e.g. Exam Schedule Released"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="input-field w-full resize-none"
                    rows={4}
                    placeholder="Write the full announcement here..."
                  />
                </div>

                {/* Category + Expires */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="input-field w-full capitalize"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Expires On (optional)</label>
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                {/* Pinned toggle */}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setForm(p => ({ ...p, pinned: !p.pinned }))}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.pinned ? 'bg-gold' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.pinned ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-gray-300 text-sm">Pin this notice (show at top)</span>
                </label>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl bg-dark-300 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 btn-gold py-2.5 text-sm disabled:opacity-50">
                    {saving ? 'Saving...' : editId ? 'Update Notice' : 'Post Notice'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
