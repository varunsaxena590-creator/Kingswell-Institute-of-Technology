// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyFees.jsx (Student Page)                            ║
// ║  PATH: frontend/src/pages/MyFees.jsx                        ║
// ║                                                              ║
// ║  KYA HAI? → Student ki apni fee details dekhne ka page.      ║
// ║  → Total fee, paid amount, pending amount dikhata hai.      ║
// ║  → Payment history aur transactions list.                   ║
// ║  → Route: /my-fees (protected — login required)             ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/MyFees.jsx — Student: My Fees Portal
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMoneyBillWave, FaCheck, FaClock, FaExclamationTriangle,
  FaGift, FaChevronDown, FaChevronUp, FaReceipt, FaFilePdf,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';
import { downloadFeeReceiptPDF, downloadMyFeesPDF } from '../utils/pdfReports';

// ── helpers ────────────────────────────────────────────────────
const fmt     = (n) => `KSh ${Number(n || 0).toLocaleString()}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_STYLE = {
  paid:    'bg-green-500/10 text-green-400 border border-green-500/20',
  partial: 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20',
  unpaid:  'bg-red-500/10 text-red-400 border border-red-500/20',
  waived:  'bg-purple-400/10 text-purple-400 border border-purple-400/20',
};
const STATUS_ICON = { paid: FaCheck, partial: FaClock, unpaid: FaExclamationTriangle, waived: FaGift };

export default function MyFees() {
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [expand,  setExpand]  = useState(null); // fee._id

  useEffect(() => {
    api.get('/fees/my')
      .then(({ data }) => setFees(data || []))
      .catch(() => setFees([]))
      .finally(() => setLoading(false));
  }, []);

  // ── totals ──
  const totalBilled  = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalPaid    = fees.reduce((s, f) => s + (f.amountPaid || 0), 0);
  const totalBalance = fees.reduce((s, f) => s + (f.balance || 0), 0);

  // ── receipt ──
  const downloadReceipt = (fee) => {
    const win = window.open('', '_blank', 'width=720,height=900');
    const txRows = fee.transactions?.length
      ? fee.transactions.map(t => `<tr>
          <td>KSh ${Number(t.amount).toLocaleString()}</td>
          <td style="text-transform:capitalize">${t.method.replace('_', ' ')}</td>
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
        <div class="box"><div class="lbl">Total Paid</div><div class="val" style="color:#16a34a">KSh ${Number(fee.amountPaid || 0).toLocaleString()}</div></div>
        <div class="box"><div class="lbl">Balance Due</div><div class="val" style="color:#dc2626">KSh ${Number(fee.balance || 0).toLocaleString()}</div></div>
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

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-dark-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.08),_transparent_60%)]" />
        <div className="max-w-5xl mx-auto section-padding relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm font-semibold uppercase tracking-widest">Student Portal</span>
            <h1 className="section-title mt-2">My <span className="gold-text">Fees</span></h1>
            <p className="text-gray-400 mt-2">View your fee records, payment history and download receipts.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-dark">
        <div className="max-w-5xl mx-auto section-padding space-y-6">

          {/* Summary Cards */}
          {!loading && fees.length > 0 && (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Billed',    value: fmt(totalBilled),  color: 'text-white' },
                { label: 'Total Paid',      value: fmt(totalPaid),    color: 'text-green-400' },
                { label: 'Balance Due',     value: fmt(totalBalance), color: totalBalance > 0 ? 'text-red-400' : 'text-green-400' },
              ].map(c => (
                <div key={c.label} className="bg-dark-200 rounded-xl p-4 border border-gray-800">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{c.label}</p>
                  <p className={`text-2xl font-bold font-heading ${c.color}`}>{c.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => downloadMyFeesPDF(fees)}
                className="flex items-center gap-2 bg-dark-200 border border-gray-700 text-gray-300 hover:text-gold hover:border-gold/40 font-semibold px-4 py-2 rounded-lg transition-all text-sm">
                <FaFilePdf size={13} /> Download Fee Statement
              </button>
            </div>
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* No record */}
          {!loading && fees.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <FaMoneyBillWave size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium text-gray-400">No fee records found</p>
              <p className="text-sm mt-1">Your fee records will appear here once assigned by the admin.</p>
            </div>
          )}

          {/* Fee Cards */}
          <div className="space-y-4">
            {fees.map((fee, i) => {
              const Icon = STATUS_ICON[fee.status] || FaMoneyBillWave;
              const overdue = (fee.status === 'unpaid' || fee.status === 'partial') && new Date(fee.dueDate) < new Date();
              const isExpanded = expand === fee._id;

              return (
                <motion.div
                  key={fee._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-dark-200 rounded-2xl border transition-colors ${overdue ? 'border-red-500/30' : 'border-gray-800'}`}
                >
                  {/* Card Header */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Left */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[fee.status]}`}>
                          <Icon size={9} /> {fee.status}
                        </span>
                        <span className="capitalize text-gray-400 text-xs bg-dark-300 px-2 py-0.5 rounded">{fee.feeType}</span>
                        {overdue && <span className="text-red-400 text-xs font-semibold">⚠ Overdue</span>}
                      </div>
                      <p className="text-white font-semibold text-base">{fee.semester}</p>
                      <p className="text-gray-500 text-xs">Due: <span className={overdue ? 'text-red-400' : 'text-gray-400'}>{fmtDate(fee.dueDate)}</span></p>
                    </div>

                    {/* Right — amounts */}
                    <div className="flex flex-wrap gap-4 text-right sm:text-left">
                      <div>
                        <p className="text-gray-500 text-xs">Total</p>
                        <p className="text-white font-bold">{fmt(fee.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Paid</p>
                        <p className="text-green-400 font-bold">{fmt(fee.amountPaid)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Balance</p>
                        <p className={`font-bold ${fee.balance > 0 ? 'text-red-400' : 'text-green-400'}`}>{fmt(fee.balance)}</p>
                      </div>
                      <div className="flex items-center gap-2 self-end">
                        <button
                          onClick={() => downloadFeeReceiptPDF(fee)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold bg-dark-300 border border-gray-700 px-3 py-1.5 rounded hover:border-gold/40 transition-colors"
                        >
                          <FaFilePdf size={10} /> PDF
                        </button>
                        <button
                          onClick={() => downloadReceipt(fee)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-dark-300 border border-gray-700 px-3 py-1.5 rounded hover:border-gray-500 transition-colors"
                        >
                          <FaReceipt size={10} /> Receipt
                        </button>
                        <button
                          onClick={() => setExpand(isExpanded ? null : fee._id)}
                          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-dark-300 transition-colors"
                        >
                          {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Waiver info */}
                  {fee.waiverAmount > 0 && (
                    <div className="px-5 pb-2">
                      <p className="text-purple-400 text-xs">
                        Waiver applied: {fmt(fee.waiverAmount)} — {fee.waiverReason || 'No reason given'}
                      </p>
                    </div>
                  )}

                  {/* Expandable Transactions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-800"
                      >
                        <div className="px-5 py-4">
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <FaReceipt size={10} /> Payment History
                          </p>
                          {!fee.transactions?.length ? (
                            <p className="text-gray-600 text-sm">No payments recorded yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {fee.transactions.map((t, idx) => (
                                <div key={idx} className="flex flex-wrap items-center gap-4 text-sm bg-dark-300 rounded-lg px-4 py-3 border border-gray-800">
                                  <span className="text-green-400 font-semibold">{fmt(t.amount)}</span>
                                  <span className="capitalize text-gray-400">{t.method.replace('_', ' ')}</span>
                                  {t.reference && <span className="text-gray-500 text-xs">Ref: {t.reference}</span>}
                                  {t.note      && <span className="text-gray-500 text-xs italic">{t.note}</span>}
                                  <span className="ml-auto text-gray-600 text-xs">{fmtDate(t.paidAt)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
