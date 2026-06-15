// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Library.jsx (Admin Page)                             ║
// ║  PATH: frontend/src/admin/Library.jsx                        ║
// ║                                                              ║
// ║  KYA HAI? → Admin library management page.                   ║
// ║  → Tab 1: Books — add, edit, delete, search books.          ║
// ║  → Tab 2: Issues — issue book to student, return, fines.    ║
// ║  → Route: /admin/library (admin only)                       ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBook, FaPlus, FaEdit, FaTrash, FaTimes, FaSearch,
  FaExchangeAlt, FaUndo, FaCheck, FaExclamationTriangle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const CATEGORIES = ['textbook', 'reference', 'fiction', 'non-fiction', 'journal', 'magazine', 'other'];

const emptyBookForm = {
  title: '', author: '', isbn: '', category: 'textbook',
  publisher: '', publishYear: '', description: '', totalCopies: 1, shelfLocation: '',
};

export default function Library() {
  const [tab, setTab] = useState('books');

  // ── Books state ──────────────────────────────────────────────
  const [books,   setBooks]   = useState([]);
  const [bLoading, setBLoading] = useState(true);
  const [bSearch,  setBSearch]  = useState('');
  const [bModal,   setBModal]   = useState(false);
  const [bEditId,  setBEditId]  = useState(null);
  const [bForm,    setBForm]    = useState(emptyBookForm);
  const [bSaving,  setBSaving]  = useState(false);

  // ── Issues state ─────────────────────────────────────────────
  const [issues,   setIssues]   = useState([]);
  const [students, setStudents] = useState([]);
  const [iLoading, setILoading] = useState(true);
  const [iSearch,  setISearch]  = useState('');
  const [iModal,   setIModal]   = useState(false);
  const [iForm,    setIForm]    = useState({ book: '', student: '', dueDate: '' });
  const [iSaving,  setISaving]  = useState(false);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchBooks = useCallback(async () => {
    try {
      const { data } = await api.get('/library/books');
      setBooks(data.data || []);
    } catch { toast.error('Failed to load books'); }
    finally { setBLoading(false); }
  }, []);

  const fetchIssues = useCallback(async () => {
    try {
      const [iRes, sRes] = await Promise.all([
        api.get('/library/issues'),
        api.get('/students'),
      ]);
      setIssues(iRes.data.data || []);
      setStudents((sRes.data.data || []).filter(s => s.status === 'accepted'));
    } catch { toast.error('Failed to load issues'); }
    finally { setILoading(false); }
  }, []);

  useEffect(() => { fetchBooks(); fetchIssues(); }, [fetchBooks, fetchIssues]);

  // ══════════════════════════════════════════════════════════════
  //  BOOKS TAB
  // ══════════════════════════════════════════════════════════════
  const filteredBooks = books.filter(b => {
    const q = bSearch.toLowerCase();
    return !bSearch || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.isbn || '').toLowerCase().includes(q);
  });

  const openAddBook = () => { setBForm(emptyBookForm); setBEditId(null); setBModal(true); };
  const openEditBook = (b) => {
    setBForm({
      title: b.title, author: b.author, isbn: b.isbn || '', category: b.category,
      publisher: b.publisher || '', publishYear: b.publishYear || '',
      description: b.description || '', totalCopies: b.totalCopies, shelfLocation: b.shelfLocation || '',
    });
    setBEditId(b._id);
    setBModal(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bForm.title || !bForm.author) { toast.error('Title and author required'); return; }
    setBSaving(true);
    try {
      if (bEditId) {
        const { data } = await api.put(`/library/books/${bEditId}`, bForm);
        setBooks(prev => prev.map(b => b._id === bEditId ? data.data : b));
        toast.success('Book updated');
      } else {
        const { data } = await api.post('/library/books', bForm);
        setBooks(prev => [data.data, ...prev]);
        toast.success('Book added');
      }
      setBModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setBSaving(false); }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try {
      await api.delete(`/library/books/${id}`);
      setBooks(prev => prev.filter(b => b._id !== id));
      toast.success('Book deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  // ══════════════════════════════════════════════════════════════
  //  ISSUES TAB
  // ══════════════════════════════════════════════════════════════
  const filteredIssues = issues.filter(i => {
    const q = iSearch.toLowerCase();
    const sName = `${i.student?.firstName || ''} ${i.student?.lastName || ''}`.toLowerCase();
    return !iSearch || sName.includes(q) || (i.book?.title || '').toLowerCase().includes(q) || (i.student?.admissionNumber || '').toLowerCase().includes(q);
  });

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!iForm.book || !iForm.student || !iForm.dueDate) { toast.error('All fields required'); return; }
    setISaving(true);
    try {
      const { data } = await api.post('/library/issues', iForm);
      setIssues(prev => [data.data, ...prev]);
      // update available copies locally
      setBooks(prev => prev.map(b => b._id === iForm.book ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b));
      toast.success('Book issued');
      setIModal(false);
      setIForm({ book: '', student: '', dueDate: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setISaving(false); }
  };

  const handleReturn = async (issue) => {
    if (!window.confirm(`Return "${issue.book?.title}"?`)) return;
    try {
      const { data } = await api.put(`/library/issues/${issue._id}/return`);
      setIssues(prev => prev.map(i => i._id === issue._id ? data.data : i));
      setBooks(prev => prev.map(b => b._id === (issue.book?._id || issue.book) ? { ...b, availableCopies: b.availableCopies + 1 } : b));
      toast.success(data.data.fine > 0 ? `Returned with fine ₹${data.data.fine}` : 'Book returned');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ── Stats ────────────────────────────────────────────────────
  const bookStats = [
    { label: 'Total Books', value: books.length, color: 'text-white' },
    { label: 'Total Copies', value: books.reduce((a, b) => a + b.totalCopies, 0), color: 'text-blue-400' },
    { label: 'Available', value: books.reduce((a, b) => a + b.availableCopies, 0), color: 'text-green-400' },
    { label: 'Issued Out', value: issues.filter(i => i.status !== 'returned').length, color: 'text-yellow-400' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-heading font-bold text-white text-2xl">Library Management</h2>
        <p className="text-gray-400 text-sm mt-1">Manage books, issue & return tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {bookStats.map(s => (
          <div key={s.label} className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-gray-500 text-xs uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold font-heading mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'books', label: 'Books', icon: FaBook },
          { key: 'issues', label: 'Issue / Return', icon: FaExchangeAlt },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-gold/15 text-gold border border-gold/30' : 'bg-dark-200 text-gray-400 border border-gray-800 hover:text-white'
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════ BOOKS TAB ════════════════════ */}
      {tab === 'books' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              <input type="text" placeholder="Search by title, author or ISBN..." value={bSearch}
                onChange={e => setBSearch(e.target.value)} className="input-field pl-9 text-sm w-full" />
            </div>
            <button onClick={openAddBook} className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5">
              <FaPlus size={12} /> Add Book
            </button>
          </div>

          <div className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Book</th>
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden sm:table-cell">Category</th>
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden md:table-cell">ISBN</th>
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium">Available</th>
                    <th className="text-right text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bLoading ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-500">Loading books...</td></tr>
                  ) : filteredBooks.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-500">
                      <FaBook size={32} className="mx-auto mb-3 opacity-20" />No books found
                    </td></tr>
                  ) : filteredBooks.map((b, i) => (
                    <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-800 hover:bg-dark-300/40 transition-colors">
                      <td className="py-4 px-5">
                        <p className="text-white text-sm font-medium">{b.title}</p>
                        <p className="text-gray-500 text-xs">{b.author}</p>
                      </td>
                      <td className="py-4 px-3 hidden sm:table-cell">
                        <span className="text-xs capitalize text-gray-400">{b.category}</span>
                      </td>
                      <td className="py-4 px-3 hidden md:table-cell">
                        <span className="text-xs text-gray-400 font-mono">{b.isbn || '—'}</span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`text-sm font-bold ${b.availableCopies > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {b.availableCopies}/{b.totalCopies}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditBook(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold hover:bg-gold/10 transition-colors" title="Edit">
                            <FaEdit size={13} />
                          </button>
                          <button onClick={() => handleDeleteBook(b._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                            <FaTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════ ISSUES TAB ════════════════════ */}
      {tab === 'issues' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
              <input type="text" placeholder="Search by student name, ADM no or book title..." value={iSearch}
                onChange={e => setISearch(e.target.value)} className="input-field pl-9 text-sm w-full" />
            </div>
            <button onClick={() => { setIForm({ book: '', student: '', dueDate: '' }); setIModal(true); }}
              className="btn-gold flex items-center gap-2 text-sm px-4 py-2.5">
              <FaPlus size={12} /> Issue Book
            </button>
          </div>

          <div className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Student</th>
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium">Book</th>
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden sm:table-cell">Issued</th>
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium hidden md:table-cell">Due</th>
                    <th className="text-left text-gray-400 text-xs uppercase tracking-widest py-4 px-3 font-medium">Status</th>
                    <th className="text-right text-gray-400 text-xs uppercase tracking-widest py-4 px-5 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {iLoading ? (
                    <tr><td colSpan={6} className="text-center py-16 text-gray-500">Loading issues...</td></tr>
                  ) : filteredIssues.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-16 text-gray-500">
                      <FaExchangeAlt size={32} className="mx-auto mb-3 opacity-20" />No issue records found
                    </td></tr>
                  ) : filteredIssues.map((issue, i) => (
                    <motion.tr key={issue._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-800 hover:bg-dark-300/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold text-xs font-bold shrink-0">
                            {issue.student?.firstName?.[0]}{issue.student?.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{issue.student?.firstName} {issue.student?.lastName}</p>
                            <p className="text-gray-500 text-xs">{issue.student?.admissionNumber || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <p className="text-gray-300 text-sm truncate max-w-[160px]">{issue.book?.title}</p>
                        <p className="text-gray-600 text-xs">{issue.book?.author}</p>
                      </td>
                      <td className="py-4 px-3 hidden sm:table-cell text-gray-400 text-xs">{fmtDate(issue.issueDate)}</td>
                      <td className="py-4 px-3 hidden md:table-cell text-gray-400 text-xs">{fmtDate(issue.dueDate)}</td>
                      <td className="py-4 px-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${
                          issue.status === 'returned' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                          issue.status === 'overdue'  ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                                                        'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                        }`}>
                          {issue.status}
                        </span>
                        {issue.fine > 0 && <span className="text-red-400 text-xs ml-2">Fine: ₹{issue.fine}</span>}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {issue.status !== 'returned' && (
                          <button onClick={() => handleReturn(issue)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-colors" title="Return">
                            <FaUndo size={13} />
                          </button>
                        )}
                        {issue.status === 'returned' && (
                          <span className="text-green-400/50 text-xs flex items-center justify-end gap-1"><FaCheck size={10} /> Done</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════════ Add/Edit Book Modal ════════════ */}
      <AnimatePresence>
        {bModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-white text-xl">{bEditId ? 'Edit Book' : 'Add Book'}</h3>
                <button onClick={() => setBModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <form onSubmit={handleSaveBook} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Title *</label>
                    <input type="text" placeholder="Book title" value={bForm.title}
                      onChange={e => setBForm(p => ({ ...p, title: e.target.value }))} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Author *</label>
                    <input type="text" placeholder="Author name" value={bForm.author}
                      onChange={e => setBForm(p => ({ ...p, author: e.target.value }))} className="input-field w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">ISBN</label>
                    <input type="text" placeholder="ISBN number" value={bForm.isbn}
                      onChange={e => setBForm(p => ({ ...p, isbn: e.target.value }))} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Category</label>
                    <select value={bForm.category} onChange={e => setBForm(p => ({ ...p, category: e.target.value }))} className="input-field w-full capitalize">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Total Copies</label>
                    <input type="number" min={1} value={bForm.totalCopies}
                      onChange={e => setBForm(p => ({ ...p, totalCopies: e.target.value }))} className="input-field w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Publisher</label>
                    <input type="text" placeholder="Publisher" value={bForm.publisher}
                      onChange={e => setBForm(p => ({ ...p, publisher: e.target.value }))} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Year</label>
                    <input type="number" placeholder="2026" value={bForm.publishYear}
                      onChange={e => setBForm(p => ({ ...p, publishYear: e.target.value }))} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Shelf Location</label>
                    <input type="text" placeholder="e.g. Rack A-3" value={bForm.shelfLocation}
                      onChange={e => setBForm(p => ({ ...p, shelfLocation: e.target.value }))} className="input-field w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs mb-1">Description</label>
                  <textarea rows={2} placeholder="Short description..." value={bForm.description}
                    onChange={e => setBForm(p => ({ ...p, description: e.target.value }))} className="input-field w-full resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setBModal(false)} className="flex-1 py-2.5 rounded-xl bg-dark-300 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={bSaving} className="flex-1 btn-gold py-2.5 text-sm disabled:opacity-50">
                    {bSaving ? 'Saving...' : bEditId ? 'Update Book' : 'Add Book'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════ Issue Book Modal ════════════ */}
      <AnimatePresence>
        {iModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-white text-xl">Issue Book</h3>
                <button onClick={() => setIModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>

              <form onSubmit={handleIssueBook} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Book *</label>
                  <select value={iForm.book} onChange={e => setIForm(p => ({ ...p, book: e.target.value }))} className="input-field w-full text-sm">
                    <option value="">— Select Book —</option>
                    {books.filter(b => b.availableCopies > 0).map(b => (
                      <option key={b._id} value={b._id}>{b.title} — {b.author} ({b.availableCopies} avail)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Student *</label>
                  <select value={iForm.student} onChange={e => setIForm(p => ({ ...p, student: e.target.value }))} className="input-field w-full text-sm">
                    <option value="">— Select Student —</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.firstName} {s.lastName} {s.admissionNumber ? `(${s.admissionNumber})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Due Date *</label>
                  <input type="date" value={iForm.dueDate}
                    onChange={e => setIForm(p => ({ ...p, dueDate: e.target.value }))} className="input-field w-full text-sm" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIModal(false)} className="flex-1 py-2.5 rounded-xl bg-dark-300 border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={iSaving} className="flex-1 btn-gold py-2.5 text-sm disabled:opacity-50">
                    {iSaving ? 'Issuing...' : 'Issue Book'}
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
