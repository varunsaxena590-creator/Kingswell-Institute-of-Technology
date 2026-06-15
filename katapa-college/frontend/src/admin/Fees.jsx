// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Fees.jsx (Admin Page)                                ║
// ║  PATH: frontend/src/admin/Fees.jsx                          ║
// ║                                                              ║
// ║  KYA HAI? → Admin fee management page.                       ║
// ║  → Students ki fees create, update, delete karna.           ║
// ║  → Payment record karna aur fee summary dekhna.             ║
// ║  → Bulk fee creation bhi supported hai.                     ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/Fees.jsx — Fee Management Admin Page
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMoneyBillWave, FaPlus, FaSearch, FaTimes, FaCheck,
  FaExclamationTriangle, FaClock, FaGift, FaReceipt, FaChevronDown, FaChevronUp,
  FaPen, FaBolt, FaFileCsv, FaPrint, FaFilePdf,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';
import { downloadFeeReceiptPDF, downloadAllFeesPDF } from '../utils/pdfReports';

// ── helpers ────────────────────────────────────────────────────
const fmt  = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const STATUS_STYLE = {
  paid:    'bg-green-500/10 text-green-400 border border-green-500/20',
  partial: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  unpaid:  'bg-red-500/10 text-red-400 border border-red-500/20',
  waived:  'bg-purple-400/10 text-purple-400 border border-purple-400/20',
};
const STATUS_ICON = { paid: FaCheck, partial: FaClock, unpaid: FaExclamationTriangle, waived: FaGift };

const METHODS = ['cash','bank_transfer','mpesa','cheque'];
const FEE_TYPES = ['tuition','exam','library','hostel','lab','other'];

// ── empty form state ───────────────────────────────────────────
const emptyFeeForm = {
  student:'', feeType:'tuition', semester:'', totalAmount:'', dueDate:'', waiverAmount:'', waiverReason:'',
};
const emptyPayForm = { amount:'', method:'cash', reference:'', note:'' };

export default function Fees() {
  const [fees,     setFees]     = useState([]);
  const [students, setStudents] = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [studentSearch,  setStudentSearch]  = useState('');
  const [courseSearch,   setCourseSearch]   = useState('');
  const [semesterSearch, setSemesterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // modals
  const [addModal,  setAddModal]  = useState(false);
  const [payModal,  setPayModal]  = useState(null);   // fee object
  const [editModal, setEditModal] = useState(null);   // fee object
  const [bulkModal, setBulkModal] = useState(false);
  const [detailRow, setDetailRow] = useState(null);   // fee _id expanded

  // forms
  const [feeForm,  setFeeForm]  = useState(emptyFeeForm);
  const [payForm,  setPayForm]  = useState(emptyPayForm);
  const [editForm, setEditForm] = useState({ totalAmount: '', dueDate: '', waiverAmount: '', waiverReason: '' });
  const [bulkForm, setBulkForm] = useState({ feeType: 'tuition', semester: '', totalAmount: '', dueDate: '' });
  const [saving,   setSaving]   = useState(false);

  // ── fetch ────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [feesRes, studRes, sumRes] = await Promise.all([
        api.get('/fees'),
        api.get('/students'),
        api.get('/fees/summary'),
      ]);
      setFees(feesRes.data || []);
      setStudents(studRes.data?.data || []);
      setSummary(sumRes.data);
    } catch {
      toast.error('Failed to load fees data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── filter ───────────────────────────────────────────────────
  const filtered = fees.filter(f => {
    const name      = `${f.student?.firstName || ''} ${f.student?.lastName || ''} ${f.student?.admissionNumber || ''}`.toLowerCase();
    const course    = (f.student?.courseApplied?.title || '').toLowerCase();
    const semester  = (f.semester || '').toLowerCase();
    const matchStudent  = !studentSearch  || name.includes(studentSearch.toLowerCase());
    const matchCourse   = !courseSearch   || course.includes(courseSearch.toLowerCase());
    const matchSemester = !semesterSearch || semester.includes(semesterSearch.toLowerCase());
    const matchStatus   = statusFilter === 'all' || f.status === statusFilter;
    return matchStudent && matchCourse && matchSemester && matchStatus;
  });

  // ── create fee ───────────────────────────────────────────────
  const handleCreateFee = async (e) => {
    e.preventDefault();
    if (!feeForm.student || !feeForm.semester || !feeForm.totalAmount || !feeForm.dueDate) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      await api.post('/fees', {
        ...feeForm,
        totalAmount:  Number(feeForm.totalAmount),
        waiverAmount: Number(feeForm.waiverAmount || 0),
      });
      toast.success('Fee record created');
      setAddModal(false);
      setFeeForm(emptyFeeForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fee');
    } finally {
      setSaving(false);
    }
  };

  // ── record payment ───────────────────────────────────────────
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payForm.amount || !payForm.method) { toast.error('Amount and method required'); return; }
    setSaving(true);
    try {
      await api.post(`/fees/${payModal._id}/pay`, {
        ...payForm, amount: Number(payForm.amount),
      });
      toast.success('Payment recorded');
      setPayModal(null);
      setPayForm(emptyPayForm);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  // ── waive fee ─────────────────────────────────────────────────
  const handleWaive = async (fee) => {
    if (!window.confirm(`Mark this fee as waived for ${fee.student?.firstName}₹`)) return;
    try {
      await api.put(`/fees/${fee._id}`, { status: 'waived' });
      toast.success('Fee waived');
      fetchAll();
    } catch { toast.error('Failed to waive fee'); }
  };

  // ── delete ───────────────────────────────────────────────────
const handleDelete = async (id) => {
    if (!window.confirm('Delete this fee record₹')) return;
    try {
      await api.delete(`/fees/${id}`);
      toast.success('Deleted');
      fetchAll();
    } catch { toast.error('Failed to delete'); }
  };

  // ── edit fee ───────────────────────────────────────
  const openEdit = (fee) => {
    setEditForm({
      totalAmount:  String(fee.totalAmount),
      dueDate:      fee.dueDate ? fee.dueDate.substring(0, 10) : '',
      waiverAmount: String(fee.waiverAmount || 0),
      waiverReason: fee.waiverReason || '',
    });
    setEditModal(fee);
  };

  const handleEditFee = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/fees/${editModal._id}`, {
        totalAmount:  Number(editForm.totalAmount),
        dueDate:      editForm.dueDate,
        waiverAmount: Number(editForm.waiverAmount || 0),
        waiverReason: editForm.waiverReason,
      });
      toast.success('Fee record updated');
      setEditModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update fee');
    } finally { setSaving(false); }
  };

  // ── bulk assign ─────────────────────────────────────
  const handleBulkAssign = async (e) => {
    e.preventDefault();
    if (!bulkForm.semester || !bulkForm.totalAmount || !bulkForm.dueDate) {
      toast.error('Please fill all required fields'); return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/fees/bulk', {
        ...bulkForm, totalAmount: Number(bulkForm.totalAmount),
      });
      toast.success(data.message);
      setBulkModal(false);
      setBulkForm({ feeType: 'tuition', semester: '', totalAmount: '', dueDate: '' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk assign failed');
    } finally { setSaving(false); }
  };

  // ── export CSV ────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Student Name','Admission No','Semester','Fee Type','Total (₹)','Paid (₹)','Balance (₹)','Due Date','Status'];
    const rows = filtered.map(f => [
      `${f.student?.firstName || ''} ${f.student?.lastName || ''}`.trim(),
      f.student?.admissionNumber || '',
      f.semester,
      f.feeType,
      f.totalAmount,
      f.amountPaid || 0,
      f.balance || 0,
      f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '',
      f.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `fees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── receipt download (print window) ──────────────────────
  const downloadReceipt = (fee) => {
    const win = window.open('', '_blank', 'width=720,height=900');
    const txRows = fee.transactions?.length
      ? fee.transactions.map(t => `<tr>
          <td>KSh ${Number(t.amount).toLocaleString()}</td>
          <td style="text-transform:capitalize">${t.method.replace('_',' ')}</td>
          <td>${t.reference || '—'}</td>
          <td>${t.note || '—'}</td>
          <td>${new Date(t.paidAt).toLocaleDateString()}</td>
        </tr>`).join('')
      : '<tr><td colspan="5" style="text-align:center;color:#999">No payments recorded</td></tr>';
    win.document.write(`<!DOCTYPE html><html><head><title>Fee Receipt</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a;max-width:680px;margin:auto}
        h1{color:#d4af37;border-bottom:2px solid #d4af37;padding-bottom:10px;margin-bottom:4px}
        .sub{color:#666;margin:0 0 20px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}
        .box{padding:10px 12px;background:#f9f9f9;border-radius:6px;border:1px solid #eee}
        .lbl{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.5px}
        .val{font-weight:600;margin-top:3px;font-size:14px}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th{background:#d4af37;color:#fff;padding:9px 12px;text-align:left;font-size:13px}
        td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}
        .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
        .paid{background:#d1fae5;color:#065f46}.partial{background:#fef3c7;color:#92400e}.unpaid{background:#fee2e2;color:#991b1b}.waived{background:#ede9fe;color:#5b21b6}
        .footer{margin-top:36px;text-align:center;color:#aaa;font-size:12px;border-top:1px solid #eee;padding-top:16px}
        @media print{.no-print{display:none}}
      </style></head><body>
      <h1>Kingswell Institute of Technology</h1>
      <p class="sub">Official Fee Receipt — Generated ${new Date().toLocaleString()}</p>
      <div class="grid">
        <div class="box"><div class="lbl">Student Name</div><div class="val">${fee.student?.firstName} ${fee.student?.lastName}</div></div>
        <div class="box"><div class="lbl">Admission No.</div><div class="val">${fee.student?.admissionNumber || 'N/A'}</div></div>
        <div class="box"><div class="lbl">Semester</div><div class="val">${fee.semester}</div></div>
        <div class="box"><div class="lbl">Fee Type</div><div class="val" style="text-transform:capitalize">${fee.feeType}</div></div>
        <div class="box"><div class="lbl">Total Amount</div><div class="val">KSh ${Number(fee.totalAmount).toLocaleString()}</div></div>
        <div class="box"><div class="lbl">Total Paid</div><div class="val" style="color:#16a34a">KSh ${Number(fee.amountPaid||0).toLocaleString()}</div></div>
        <div class="box"><div class="lbl">Balance Due</div><div class="val" style="color:#dc2626">KSh ${Number(fee.balance||0).toLocaleString()}</div></div>
        <div class="box"><div class="lbl">Status</div><div class="val"><span class="badge ${fee.status}">${fee.status.toUpperCase()}</span></div></div>
        ${fee.waiverAmount > 0 ? `<div class="box" style="grid-column:span 2"><div class="lbl">Waiver</div><div class="val">KSh ${Number(fee.waiverAmount).toLocaleString()} — ${fee.waiverReason || 'N/A'}</div></div>` : ''}
        <div class="box"><div class="lbl">Due Date</div><div class="val">${new Date(fee.dueDate).toLocaleDateString()}</div></div>
      </div>
      <h3>Payment Transactions</h3>
      <table><thead><tr><th>Amount</th><th>Method</th><th>Reference</th><th>Note</th><th>Date</th></tr></thead>
      <tbody>${txRows}</tbody></table>
      <div class="footer">
        <p>Kingswell Institute of Technology &nbsp;•&nbsp; Official Document</p>
        <button class="no-print" onclick="window.print()" style="margin-top:10px;background:#d4af37;border:none;padding:8px 24px;border-radius:4px;cursor:pointer;font-weight:700;font-size:14px">Print / Save PDF</button>
      </div>
      </body></html>`);
    win.document.close();
  };

  // ── render ───────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Fee Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">Track, collect and manage student fees</p>
        </div>
        <div className="sm:ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-dark-300 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-semibold px-3 py-2 rounded-lg transition-all text-sm"
          >
            <FaFileCsv size={13} /> Export CSV
          </button>
          <button
            onClick={() => downloadAllFeesPDF(fees, summary)}
            disabled={!fees.length}
            className="flex items-center gap-2 bg-dark-300 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 font-semibold px-3 py-2 rounded-lg transition-all text-sm disabled:opacity-40"
          >
            <FaFilePdf size={13} /> Export PDF
          </button>
          <button
            onClick={() => setBulkModal(true)}
            className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 font-semibold px-3 py-2 rounded-lg transition-all text-sm"
          >
            <FaBolt size={12} /> Bulk Assign
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 bg-gold-gradient text-dark font-semibold px-4 py-2 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
          >
            <FaPlus size={13} /> Add Fee Record
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Billed',   value: fmt(summary.totalBilled),   color: 'text-white' },
            { label: 'Total Collected',value: fmt(summary.totalPaid),     color: 'text-green-400' },
            { label: 'Outstanding',    value: fmt(summary.totalBalance),  color: 'text-red-400' },
            { label: 'Total Waived',   value: fmt(summary.totalWaived),   color: 'text-purple-400' },
          ].map(c => (
            <div key={c.label} className="bg-dark-200 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{c.label}</p>
              <p className={`text-xl font-bold font-heading ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status pill summary */}
      {summary && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(summary.byStatus).map(([s, count]) => {
            const Icon = STATUS_ICON[s] || FaMoneyBillWave;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(prev => prev === s ? 'all' : s)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${STATUS_STYLE[s]} ${statusFilter === s ? 'ring-2 ring-offset-1 ring-offset-dark ring-current' : ''}`}
              >
                <Icon size={10} /> {s} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Student Name */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
          <input
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            placeholder="Search by student name…"
            className="w-full bg-dark-200 border border-gray-700 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
          />
          {studentSearch && (
            <button onClick={() => setStudentSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <FaTimes size={11}/>
            </button>
          )}
        </div>
        {/* Course */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
          <input
            value={courseSearch}
            onChange={e => setCourseSearch(e.target.value)}
            placeholder="Search by course name…"
            className="w-full bg-dark-200 border border-gray-700 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
          />
          {courseSearch && (
            <button onClick={() => setCourseSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <FaTimes size={11}/>
            </button>
          )}
        </div>
        {/* Semester */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
          <input
            value={semesterSearch}
            onChange={e => setSemesterSearch(e.target.value)}
            placeholder="Search by semester…"
            className="w-full bg-dark-200 border border-gray-700 rounded-lg pl-9 pr-8 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold"
          />
          {semesterSearch && (
            <button onClick={() => setSemesterSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <FaTimes size={11}/>
            </button>
          )}
        </div>
      </div>
      {/* Active filter badges */}
      {(studentSearch || courseSearch || semesterSearch) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-gray-500 text-xs">Active filters:</span>
          {studentSearch  && <span className="flex items-center gap-1 text-xs bg-gold/10 text-gold border border-gold/20 px-2.5 py-1 rounded-full">Student: {studentSearch} <button onClick={() => setStudentSearch('')}><FaTimes size={9}/></button></span>}
          {courseSearch   && <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full">Course: {courseSearch} <button onClick={() => setCourseSearch('')}><FaTimes size={9}/></button></span>}
          {semesterSearch && <span className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full">Semester: {semesterSearch} <button onClick={() => setSemesterSearch('')}><FaTimes size={9}/></button></span>}
          <button onClick={() => { setStudentSearch(''); setCourseSearch(''); setSemesterSearch(''); }} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear all</button>
        </div>
      )}

      {/* Fee Table */}
      <div className="bg-dark-200 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Student</th>
                <th className="text-left px-4 py-3">Course</th>
                <th className="text-left px-4 py-3">Semester</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-right px-4 py-3">Paid</th>
                <th className="text-right px-4 py-3">Balance</th>
                <th className="text-left px-4 py-3">Due</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-500">
                    <FaMoneyBillWave size={28} className="mx-auto mb-2 opacity-30" />
                    No fee records found
                  </td>
                </tr>
              )}
              {filtered.map(fee => {
                const Icon = STATUS_ICON[fee.status] || FaMoneyBillWave;
                const isExpanded = detailRow === fee._id;
                const overdue = fee.status !== 'paid' && fee.status !== 'waived' && new Date(fee.dueDate) < new Date();
                return (
                  <>
                    <motion.tr
                      key={fee._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-800/50 hover:bg-dark-300/40 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{fee.student?.firstName} {fee.student?.lastName}</p>
                        <p className="text-gray-500 text-xs">{fee.student?.admissionNumber || 'No Adm#'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-300 text-xs max-w-[160px] leading-snug">
                          {fee.student?.courseApplied?.title || <span className="text-gray-600">—</span>}
                        </p>
                        {fee.student?.courseApplied?.level && (
                          <span className="text-gray-500 text-xs">{fee.student.courseApplied.level}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{fee.semester}</td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-gray-400 text-xs bg-dark-300 px-2 py-0.5 rounded">{fee.feeType}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-white font-medium">{fmt(fee.totalAmount)}</td>
                      <td className="px-4 py-3 text-right text-green-400">{fmt(fee.amountPaid)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${fee.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>{fmt(fee.balance)}</td>
                      <td className={`px-4 py-3 text-xs ${overdue ? 'text-red-400 font-semibold' : 'text-gray-400'}`}>
                        {fmtDate(fee.dueDate)}{overdue && ' ⚠'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[fee.status]}`}>
                          <Icon size={9} /> {fee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Pay button */}
                          {(fee.status === 'unpaid' || fee.status === 'partial') && (
                            <button
                              onClick={() => { setPayModal(fee); setPayForm(emptyPayForm); }}
                              className="px-2 py-1 rounded bg-gold/10 text-gold border border-gold/20 text-xs hover:bg-gold/20 transition-colors"
                            >Pay</button>
                          )}
                          {/* Waive */}
                          {fee.status !== 'waived' && fee.status !== 'paid' && (
                            <button
                              onClick={() => handleWaive(fee)}
                              className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs hover:bg-purple-500/20 transition-colors"
                            >Waive</button>
                          )}
                          {/* Expand transactions */}
                          <button
                            onClick={() => setDetailRow(isExpanded ? null : fee._id)}
                            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-dark-300 transition-colors"
                          >
                            {isExpanded ? <FaChevronUp size={11}/> : <FaChevronDown size={11}/>}
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(fee)}
                            className="p-1.5 rounded text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                            title="Edit fee"
                          >
                            <FaPen size={10}/>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(fee._id)}
                            className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <FaTimes size={11}/>
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded transactions row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          key={`${fee._id}-expand`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={10} className="px-6 pb-4 bg-dark-300/30">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 mt-2 flex items-center gap-1.5">
                              <FaReceipt size={10}/> Payment History
                            </p>
                            {fee.transactions?.length === 0 ? (
                              <p className="text-gray-600 text-xs">No payments recorded yet.</p>
                            ) : (
                              <div className="space-y-1">
                                {fee.transactions.map((t, i) => (
                                  <div key={i} className="flex items-center gap-4 text-xs text-gray-300 bg-dark-200 rounded px-3 py-2 border border-gray-800">
                                    <span className="text-green-400 font-semibold w-24">{fmt(t.amount)}</span>
                                    <span className="capitalize text-gray-400 w-24">{t.method.replace('_',' ')}</span>
                                    {t.reference && <span className="text-gray-500">Ref: {t.reference}</span>}
                                    {t.note      && <span className="text-gray-500 italic">{t.note}</span>}
                                    <span className="ml-auto text-gray-600">{fmtDate(t.paidAt)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {fee.waiverAmount > 0 && (
                              <p className="text-purple-400 text-xs mt-2">
                                Waiver: {fmt(fee.waiverAmount)} — {fee.waiverReason || 'No reason given'}
                              </p>
                            )}
                            <button
                              onClick={() => downloadReceipt(fee)}
                              className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-dark-200 border border-gray-700 px-3 py-1.5 rounded hover:border-gray-500 transition-colors"
                            >
                              <FaPrint size={10}/> Print Receipt
                            </button>
                            <button
                              onClick={() => downloadFeeReceiptPDF(fee)}
                              className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold bg-dark-200 border border-gray-700 px-3 py-1.5 rounded hover:border-gold/40 transition-colors"
                            >
                              <FaFilePdf size={10}/> Download PDF
                            </button>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Fee Modal ── */}
      <AnimatePresence>
        {addModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setAddModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-800 w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                  <FaPlus size={14} className="text-gold" /> Add Fee Record
                </h2>
                <button onClick={() => setAddModal(false)} className="text-gray-500 hover:text-white">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleCreateFee} className="space-y-4">
                {/* Student */}
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Student *</label>
                  <select
                    value={feeForm.student}
                    onChange={e => setFeeForm(p => ({ ...p, student: e.target.value }))}
                    className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                    required
                  >
                    <option value="">— Select student —</option>
                    {students.filter(s => s.status === 'accepted').map(s => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} ({s.admissionNumber || 'No Adm#'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Fee type */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Fee Type</label>
                    <select
                      value={feeForm.feeType}
                      onChange={e => setFeeForm(p => ({ ...p, feeType: e.target.value }))}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold capitalize"
                    >
                      {FEE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                  </div>
                  {/* Semester */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Semester *</label>
                    <input
                      value={feeForm.semester}
                      onChange={e => setFeeForm(p => ({ ...p, semester: e.target.value }))}
                      placeholder="e.g. Sem 1 — 2025"
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Total amount */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Total Amount (₹) *</label>
                    <input
                      type="number" min="0"
                      value={feeForm.totalAmount}
                      onChange={e => setFeeForm(p => ({ ...p, totalAmount: e.target.value }))}
                      placeholder="e.g. 45000"
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  {/* Due date */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Due Date *</label>
                    <input
                      type="date"
                      value={feeForm.dueDate}
                      onChange={e => setFeeForm(p => ({ ...p, dueDate: e.target.value }))}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Waiver */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Waiver Amount (₹)</label>
                    <input
                      type="number" min="0"
                      value={feeForm.waiverAmount}
                      onChange={e => setFeeForm(p => ({ ...p, waiverAmount: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Waiver Reason</label>
                    <input
                      value={feeForm.waiverReason}
                      onChange={e => setFeeForm(p => ({ ...p, waiverReason: e.target.value }))}
                      placeholder="e.g. Scholarship"
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setAddModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-lg bg-gold-gradient text-dark font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-60">
                    {saving ? 'Creating…' : 'Create Fee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Fee Modal ── */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setEditModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-800 w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                  <FaPen size={13} className="text-blue-400" /> Edit Fee Record
                </h2>
                <button onClick={() => setEditModal(null)} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>
              <p className="text-gray-400 text-xs mb-5">
                {editModal.student?.firstName} {editModal.student?.lastName} — {editModal.semester}
              </p>
              <form onSubmit={handleEditFee} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Total Amount (₹) *</label>
                    <input type="number" min="0" value={editForm.totalAmount}
                      onChange={e => setEditForm(p => ({ ...p, totalAmount: e.target.value }))}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Due Date *</label>
                    <input type="date" value={editForm.dueDate}
                      onChange={e => setEditForm(p => ({ ...p, dueDate: e.target.value }))}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Waiver Amount (₹)</label>
                    <input type="number" min="0" value={editForm.waiverAmount}
                      onChange={e => setEditForm(p => ({ ...p, waiverAmount: e.target.value }))}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Waiver Reason</label>
                    <input value={editForm.waiverReason}
                      onChange={e => setEditForm(p => ({ ...p, waiverReason: e.target.value }))}
                      placeholder="e.g. Scholarship"
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditModal(null)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bulk Assign Modal ── */}
      <AnimatePresence>
        {bulkModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setBulkModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-800 w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                  <FaBolt size={13} className="text-blue-400" /> Bulk Fee Assign
                </h2>
                <button onClick={() => setBulkModal(false)} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>
              <p className="text-gray-500 text-xs mb-5">Assigns the same fee to <span className="text-white font-semibold">all accepted students</span>. Students who already have a record for this semester + type are skipped.</p>
              <form onSubmit={handleBulkAssign} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Fee Type</label>
                    <select value={bulkForm.feeType} onChange={e => setBulkForm(p => ({ ...p, feeType: e.target.value }))}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400">
                      {FEE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Semester *</label>
                    <input value={bulkForm.semester} onChange={e => setBulkForm(p => ({ ...p, semester: e.target.value }))}
                      placeholder="e.g. Sem 1 — 2025"
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-400" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Total Amount (₹) *</label>
                    <input type="number" min="0" value={bulkForm.totalAmount}
                      onChange={e => setBulkForm(p => ({ ...p, totalAmount: e.target.value }))}
                      placeholder="e.g. 45000"
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-400" required />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Due Date *</label>
                    <input type="date" value={bulkForm.dueDate}
                      onChange={e => setBulkForm(p => ({ ...p, dueDate: e.target.value }))}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-400" required />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setBulkModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-60">
                    {saving ? 'Assigning…' : 'Assign to All Accepted Students'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Record Payment Modal ── */}
      <AnimatePresence>
        {payModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setPayModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 rounded-2xl border border-gray-800 w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                  <FaMoneyBillWave size={14} className="text-gold"/> Record Payment
                </h2>
                <button onClick={() => setPayModal(null)} className="text-gray-500 hover:text-white"><FaTimes /></button>
              </div>
              <p className="text-gray-400 text-xs mb-5">
                {payModal.student?.firstName} {payModal.student?.lastName} — {payModal.semester}&nbsp;&nbsp;
                <span className="text-red-400 font-semibold">Balance: {fmt(payModal.balance)}</span>
              </p>

              <form onSubmit={handlePayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Amount (₹) *</label>
                    <input
                      type="number" min="1"
                      value={payForm.amount}
                      onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder={`Max ${payModal.balance}`}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Method *</label>
                    <select
                      value={payForm.method}
                      onChange={e => setPayForm(p => ({ ...p, method: e.target.value }))}
                      className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gold capitalize"
                    >
                      {METHODS.map(m => <option key={m} value={m} className="capitalize">{m.replace('_',' ')}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Reference / Receipt No.</label>
                  <input
                    value={payForm.reference}
                    onChange={e => setPayForm(p => ({ ...p, reference: e.target.value }))}
                    placeholder="e.g. MPE12345678"
                    className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Note</label>
                  <input
                    value={payForm.note}
                    onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="Optional note"
                    className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setPayModal(null)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 rounded-lg bg-gold-gradient text-dark font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-60">
                    {saving ? 'Saving…' : 'Confirm Payment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
