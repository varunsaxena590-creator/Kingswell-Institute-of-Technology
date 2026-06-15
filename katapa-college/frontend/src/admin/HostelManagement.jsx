// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: HostelManagement.jsx (Admin Page)                    ║
// ║  PATH: frontend/src/admin/HostelManagement.jsx               ║
// ║                                                              ║
// ║  KYA HAI? → Admin hostel management page.                    ║
// ║  → Room allotment create, update, delete karna.             ║
// ║  → Hostel fee payment record karna.                         ║
// ║  → Summary stats: total rooms, occupied, fees collected.    ║
// ╚══════════════════════════════════════════════════════════════╝
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBed, FaPlus, FaSearch, FaTimes, FaCheck,
  FaExclamationTriangle, FaClock, FaGift, FaReceipt,
  FaChevronDown, FaChevronUp, FaPen, FaTrash,
  FaFileCsv, FaPrint, FaDoorOpen, FaBuilding,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

// ── helpers ────────────────────────────────────────────────────
const fmt     = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const FEE_STATUS_STYLE = {
  paid:    'bg-green-500/10 text-green-400 border border-green-500/20',
  partial: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  unpaid:  'bg-red-500/10 text-red-400 border border-red-500/20',
  waived:  'bg-purple-400/10 text-purple-400 border border-purple-400/20',
};
const FEE_ICON = { paid: FaCheck, partial: FaClock, unpaid: FaExclamationTriangle, waived: FaGift };

const STATUS_STYLE = {
  'allotted':    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  'checked-in':  'bg-green-500/10 text-green-400 border border-green-500/20',
  'checked-out': 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
  'cancelled':   'bg-red-500/10 text-red-400 border border-red-500/20',
};

const ROOM_TYPES = ['single', 'double', 'triple', 'dormitory'];
const STATUSES   = ['allotted', 'checked-in', 'checked-out', 'cancelled'];
const METHODS    = ['cash', 'bank_transfer', 'mpesa', 'cheque'];

// ── empty forms ────────────────────────────────────────────────
const emptyForm = {
  student: '', block: '', roomNumber: '', roomType: 'double', floor: 0,
  academicYear: '', checkIn: '', totalFee: '', waiverAmount: '', waiverReason: '', remarks: '',
};
const emptyPayForm = { amount: '', method: 'cash', reference: '', note: '' };

export default function HostelManagement() {
  const [hostels,  setHostels]  = useState([]);
  const [students, setStudents] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  // filters
  const [search,       setSearch]       = useState('');
  const [blockFilter,  setBlockFilter]  = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [feeFilter,    setFeeFilter]    = useState('all');

  // modals
  const [addModal,  setAddModal]  = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [payModal,  setPayModal]  = useState(null);
  const [detailRow, setDetailRow] = useState(null);

  // forms
  const [form,     setForm]     = useState(emptyForm);
  const [editForm, setEditForm] = useState({});
  const [payForm,  setPayForm]  = useState(emptyPayForm);
  const [saving,   setSaving]   = useState(false);

  // ── fetch ────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, sRes, sumRes] = await Promise.all([
        api.get('/hostels'),
        api.get('/students'),
        api.get('/hostels/summary'),
      ]);
      setHostels(hRes.data || []);
      setStudents(sRes.data?.data || []);
      setSummary(sumRes.data);
    } catch {
      toast.error('Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── unique blocks for filter ─────────────────────────────────
  const uniqueBlocks = [...new Set(hostels.map(h => h.block))].sort();

  // ── filter ───────────────────────────────────────────────────
  const filtered = hostels.filter(h => {
    const name = `${h.student?.firstName || ''} ${h.student?.lastName || ''} ${h.student?.admissionNumber || ''} ${h.roomNumber || ''}`.toLowerCase();
    const matchSearch  = !search || name.includes(search.toLowerCase());
    const matchBlock   = blockFilter  === 'all' || h.block === blockFilter;
    const matchStatus  = statusFilter === 'all' || h.status === statusFilter;
    const matchFee     = feeFilter    === 'all' || h.feeStatus === feeFilter;
    return matchSearch && matchBlock && matchStatus && matchFee;
  });

  // ── create allotment ─────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.student || !form.block || !form.roomNumber || !form.academicYear || !form.totalFee) {
      return toast.error('Required fields fill karo');
    }
    setSaving(true);
    try {
      await api.post('/hostels', { ...form, totalFee: Number(form.totalFee), waiverAmount: Number(form.waiverAmount || 0), floor: Number(form.floor || 0) });
      toast.success('Room allotted successfully');
      setAddModal(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create allotment');
    } finally {
      setSaving(false);
    }
  };

  // ── update allotment ─────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/hostels/${editModal._id}`, {
        ...editForm,
        totalFee: Number(editForm.totalFee),
        waiverAmount: Number(editForm.waiverAmount || 0),
        floor: Number(editForm.floor || 0),
      });
      toast.success('Allotment updated');
      setEditModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ── delete allotment ─────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hostel allotment?')) return;
    try {
      await api.delete(`/hostels/${id}`);
      toast.success('Allotment deleted');
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  // ── record payment ───────────────────────────────────────────
  const handlePay = async (e) => {
    e.preventDefault();
    if (!payForm.amount || !payForm.method) return toast.error('Amount aur method required hain');
    setSaving(true);
    try {
      await api.post(`/hostels/${payModal._id}/pay`, { ...payForm, amount: Number(payForm.amount) });
      toast.success('Payment recorded');
      setPayModal(null);
      setPayForm(emptyPayForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSaving(false);
    }
  };

  // ── open edit modal ──────────────────────────────────────────
  const openEdit = (h) => {
    setEditForm({
      block: h.block, roomNumber: h.roomNumber, roomType: h.roomType,
      floor: h.floor, academicYear: h.academicYear,
      checkIn: h.checkIn ? new Date(h.checkIn).toISOString().split('T')[0] : '',
      checkOut: h.checkOut ? new Date(h.checkOut).toISOString().split('T')[0] : '',
      status: h.status, totalFee: h.totalFee,
      waiverAmount: h.waiverAmount || 0, waiverReason: h.waiverReason || '',
      remarks: h.remarks || '',
    });
    setEditModal(h);
  };

  // ── CSV export ───────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Student', 'Admission #', 'Block', 'Room', 'Type', 'Academic Year', 'Status', 'Total Fee', 'Paid', 'Balance', 'Fee Status'];
    const rows = filtered.map(h => [
      `${h.student?.firstName || ''} ${h.student?.lastName || ''}`,
      h.student?.admissionNumber || '',
      h.block, h.roomNumber, h.roomType, h.academicYear,
      h.status, h.totalFee, h.amountPaid, h.balance, h.feeStatus,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'hostel-allotments.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── receipt print ────────────────────────────────────────────
  const printReceipt = (h) => {
    const w = window.open('', '_blank', 'width=400,height=600');
    w.document.write(`
      <html><head><title>Hostel Receipt</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;color:#222}h2{text-align:center;margin-bottom:5px}
      .line{border-bottom:1px dashed #ccc;margin:10px 0}table{width:100%;border-collapse:collapse}
      td{padding:6px 4px;font-size:13px}td:last-child{text-align:right;font-weight:600}</style></head>
      <body><h2>Hostel Fee Receipt</h2><div class="line"></div>
      <table>
        <tr><td>Student</td><td>${h.student?.firstName || ''} ${h.student?.lastName || ''}</td></tr>
        <tr><td>Admission #</td><td>${h.student?.admissionNumber || ''}</td></tr>
        <tr><td>Block / Room</td><td>${h.block} — ${h.roomNumber}</td></tr>
        <tr><td>Room Type</td><td>${h.roomType}</td></tr>
        <tr><td>Academic Year</td><td>${h.academicYear}</td></tr>
        <tr><td>Total Fee</td><td>${fmt(h.totalFee)}</td></tr>
        <tr><td>Waiver</td><td>${fmt(h.waiverAmount)}</td></tr>
        <tr><td>Paid</td><td>${fmt(h.amountPaid)}</td></tr>
        <tr><td><strong>Balance</strong></td><td><strong>${fmt(h.balance)}</strong></td></tr>
        <tr><td>Status</td><td>${h.feeStatus.toUpperCase()}</td></tr>
      </table>
      <div class="line"></div>
      <p style="font-size:11px;text-align:center;color:#999">Generated on ${new Date().toLocaleString()}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  // ═════════════════════════ RENDER ════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white flex items-center gap-3">
            <FaBed className="text-gold" /> Hostel Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Room allotment aur hostel fees manage karo</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-300 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 transition-all text-sm">
            <FaFileCsv size={14} /> Export
          </button>
          <button onClick={() => { setForm(emptyForm); setAddModal(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-dark font-semibold hover:shadow-lg hover:shadow-gold/20 transition-all text-sm">
            <FaPlus size={13} /> Allot Room
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Allotments', value: summary.totalAllotments, color: 'text-blue-400' },
            { label: 'Active / Occupied', value: summary.active, color: 'text-green-400' },
            { label: 'Total Billed',     value: fmt(summary.totalBilled), color: 'text-gold' },
            { label: 'Pending Fees',     value: fmt(summary.totalPending), color: 'text-red-400' },
          ].map(c => (
            <div key={c.label} className="bg-dark-200 rounded-2xl p-5 border border-gray-800">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student, room..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-dark-200 text-white border border-gray-700 focus:border-gold/50 outline-none text-sm" />
        </div>
        <select value={blockFilter} onChange={e => setBlockFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-dark-200 text-white border border-gray-700 text-sm outline-none">
          <option value="all">All Blocks</option>
          {uniqueBlocks.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-dark-200 text-white border border-gray-700 text-sm outline-none">
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={feeFilter} onChange={e => setFeeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-dark-200 text-white border border-gray-700 text-sm outline-none">
          <option value="all">All Fee Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
          <option value="waived">Waived</option>
        </select>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <FaBed size={48} className="mx-auto mb-4 opacity-30" />
          <p>No hostel allotments found</p>
        </div>
      ) : (
        <div className="bg-dark-200 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-4">Student</th>
                  <th className="text-left px-4 py-4">Block / Room</th>
                  <th className="text-left px-4 py-4">Type</th>
                  <th className="text-left px-4 py-4">Year</th>
                  <th className="text-left px-4 py-4">Status</th>
                  <th className="text-right px-4 py-4">Fee</th>
                  <th className="text-right px-4 py-4">Paid</th>
                  <th className="text-left px-4 py-4">Fee Status</th>
                  <th className="text-center px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => {
                  const FeeIcon = FEE_ICON[h.feeStatus] || FaClock;
                  return (
                    <React.Fragment key={h._id}>
                      <tr className="border-b border-gray-800/50 hover:bg-dark-300/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-white font-medium">{h.student?.firstName} {h.student?.lastName}</p>
                          <p className="text-gray-500 text-xs">{h.student?.admissionNumber}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-white">{h.block}</span>
                          <span className="text-gray-500 ml-1">— {h.roomNumber}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-300 capitalize">{h.roomType}</td>
                        <td className="px-4 py-4 text-gray-300">{h.academicYear}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[h.status] || ''}`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-white font-medium">{fmt(h.totalFee)}</td>
                        <td className="px-4 py-4 text-right text-green-400">{fmt(h.amountPaid)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${FEE_STATUS_STYLE[h.feeStatus] || ''}`}>
                            <FeeIcon size={10} /> {h.feeStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => setDetailRow(detailRow === h._id ? null : h._id)} className="p-2 rounded-lg hover:bg-dark-400 text-gray-400 hover:text-white transition-colors" title="Details">
                              {detailRow === h._id ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                            </button>
                            <button onClick={() => { setPayForm(emptyPayForm); setPayModal(h); }} className="p-2 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition-colors" title="Record Payment">
                              <FaReceipt size={12} />
                            </button>
                            <button onClick={() => openEdit(h)} className="p-2 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors" title="Edit">
                              <FaPen size={12} />
                            </button>
                            <button onClick={() => printReceipt(h)} className="p-2 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-colors" title="Print Receipt">
                              <FaPrint size={12} />
                            </button>
                            <button onClick={() => handleDelete(h._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* ── Expanded detail row ── */}
                      <AnimatePresence>
                        {detailRow === h._id && (
                          <tr>
                            <td colSpan={9} className="p-0">
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-6 py-5 bg-dark-300/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div><span className="text-gray-500 block text-xs">Floor</span><span className="text-white">{h.floor}</span></div>
                                  <div><span className="text-gray-500 block text-xs">Check-in</span><span className="text-white">{fmtDate(h.checkIn)}</span></div>
                                  <div><span className="text-gray-500 block text-xs">Check-out</span><span className="text-white">{fmtDate(h.checkOut)}</span></div>
                                  <div><span className="text-gray-500 block text-xs">Waiver</span><span className="text-yellow-400">{fmt(h.waiverAmount)}{h.waiverReason ? ` — ${h.waiverReason}` : ''}</span></div>
                                  <div><span className="text-gray-500 block text-xs">Balance</span><span className="text-red-400 font-semibold">{fmt(h.balance)}</span></div>
                                  <div className="col-span-2"><span className="text-gray-500 block text-xs">Remarks</span><span className="text-gray-300">{h.remarks || '—'}</span></div>
                                  {h.payments?.length > 0 && (
                                    <div className="col-span-full">
                                      <span className="text-gray-500 block text-xs mb-2">Payment History</span>
                                      <div className="space-y-1">
                                        {h.payments.map((p, i) => (
                                          <div key={i} className="flex items-center gap-4 text-xs bg-dark-200 rounded-lg px-3 py-2">
                                            <span className="text-green-400 font-medium">{fmt(p.amount)}</span>
                                            <span className="text-gray-400 capitalize">{p.method.replace('_', ' ')}</span>
                                            {p.reference && <span className="text-gray-500">Ref: {p.reference}</span>}
                                            <span className="text-gray-600 ml-auto">{fmtDate(p.paidAt)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-800 text-xs text-gray-500">
            Showing {filtered.length} of {hostels.length} allotments
          </div>
        </div>
      )}

      {/* ══════════════════ ADD MODAL ══════════════════ */}
      <AnimatePresence>
        {addModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaDoorOpen className="text-gold" /> Allot Room</h3>
                <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {/* Student */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Student *</label>
                  <select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required>
                    <option value="">Select Student</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.firstName} {s.lastName} — {s.admissionNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Block *</label>
                    <input value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} placeholder="e.g. Block A"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Room Number *</label>
                    <input value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} placeholder="e.g. A-101"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Room Type</label>
                    <select value={form.roomType} onChange={e => setForm({ ...form, roomType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none">
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Floor</label>
                    <input type="number" min="0" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Academic Year *</label>
                    <input value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} placeholder="2025-26"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Check-in Date</label>
                    <input type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Total Hostel Fee *</label>
                    <input type="number" min="0" value={form.totalFee} onChange={e => setForm({ ...form, totalFee: e.target.value })} placeholder="50000"
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Waiver Amount</label>
                    <input type="number" min="0" value={form.waiverAmount} onChange={e => setForm({ ...form, waiverAmount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Waiver Reason</label>
                    <input value={form.waiverReason} onChange={e => setForm({ ...form, waiverReason: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Remarks</label>
                  <textarea value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none resize-none" />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl bg-gold-gradient text-dark font-bold hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50">
                  {saving ? 'Allotting...' : 'Allot Room'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ EDIT MODAL ══════════════════ */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaPen className="text-blue-400" /> Edit Allotment</h3>
                <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Block</label>
                    <input value={editForm.block || ''} onChange={e => setEditForm({ ...editForm, block: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Room Number</label>
                    <input value={editForm.roomNumber || ''} onChange={e => setEditForm({ ...editForm, roomNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Room Type</label>
                    <select value={editForm.roomType || 'double'} onChange={e => setEditForm({ ...editForm, roomType: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none">
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Floor</label>
                    <input type="number" min="0" value={editForm.floor ?? 0} onChange={e => setEditForm({ ...editForm, floor: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Academic Year</label>
                    <input value={editForm.academicYear || ''} onChange={e => setEditForm({ ...editForm, academicYear: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Check-in</label>
                    <input type="date" value={editForm.checkIn || ''} onChange={e => setEditForm({ ...editForm, checkIn: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Check-out</label>
                    <input type="date" value={editForm.checkOut || ''} onChange={e => setEditForm({ ...editForm, checkOut: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Status</label>
                  <select value={editForm.status || 'allotted'} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Total Fee</label>
                    <input type="number" min="0" value={editForm.totalFee ?? ''} onChange={e => setEditForm({ ...editForm, totalFee: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Waiver Amount</label>
                    <input type="number" min="0" value={editForm.waiverAmount ?? 0} onChange={e => setEditForm({ ...editForm, waiverAmount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Waiver Reason</label>
                  <input value={editForm.waiverReason || ''} onChange={e => setEditForm({ ...editForm, waiverReason: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Remarks</label>
                  <textarea value={editForm.remarks || ''} onChange={e => setEditForm({ ...editForm, remarks: e.target.value })} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none resize-none" />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : 'Update Allotment'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════ PAYMENT MODAL ══════════════════ */}
      <AnimatePresence>
        {payModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-700 w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><FaReceipt className="text-green-400" /> Record Payment</h3>
                <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-white"><FaTimes /></button>
              </div>
              <div className="px-6 py-3 bg-dark-300/50 text-sm">
                <p className="text-gray-400">Student: <span className="text-white">{payModal.student?.firstName} {payModal.student?.lastName}</span></p>
                <p className="text-gray-400">Room: <span className="text-white">{payModal.block} — {payModal.roomNumber}</span></p>
                <p className="text-gray-400">Balance: <span className="text-red-400 font-semibold">{fmt(payModal.balance)}</span></p>
              </div>
              <form onSubmit={handlePay} className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Amount *</label>
                  <input type="number" min="1" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none focus:border-gold/50" required />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Method *</label>
                  <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none">
                    {METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Reference #</label>
                  <input value={payForm.reference} onChange={e => setPayForm({ ...payForm, reference: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Note</label>
                  <input value={payForm.note} onChange={e => setPayForm({ ...payForm, note: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-300 text-white border border-gray-700 text-sm outline-none" />
                </div>
                <button type="submit" disabled={saving}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-500 transition-all disabled:opacity-50">
                  {saving ? 'Recording...' : 'Record Payment'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
