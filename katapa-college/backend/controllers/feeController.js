// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: feeController.js                                     ║
// ║  PATH: backend/controllers/feeController.js                  ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Fee management system — fees create, update, delete.     ║
// ║  → Payment records add karta hai.                           ║
// ║  → Fee summary (total/paid/pending) deta hai.               ║
// ║  → Bulk fee creation aur student's own fees bhi.            ║
// ║                                                              ║
// ║  FUNCTIONS: getAllFees, getStudentFees, getFeeSummary,       ║
// ║    createFee, recordPayment, updateFee, deleteFee,           ║
// ║    bulkCreateFees, getMyFees                                 ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const Fee     = require('../models/Fee');
const Student = require('../models/Student');
const { notifyStudent } = require('../utils/notificationHelper');

// ── GET /api/fees — all fees (admin) ──────────────────────────
const getAllFees = asyncHandler(async (req, res) => {
  const { status, student } = req.query;
  const filter = {};
  if (status)  filter.status  = status;
  if (student) filter.student = student;

  const fees = await Fee.find(filter)
    .populate({
      path: 'student',
      select: 'firstName lastName admissionNumber email courseApplied',
      populate: { path: 'courseApplied', select: 'title level' },
    })
    .sort({ createdAt: -1 });

  res.json(fees);
});

// ── GET /api/fees/student/:studentId — fees for one student ───
const getStudentFees = asyncHandler(async (req, res) => {
  const fees = await Fee.find({ student: req.params.studentId })
    .populate('student', 'firstName lastName admissionNumber email')
    .sort({ createdAt: -1 });
  res.json(fees);
});

// ── GET /api/fees/summary — dashboard stats ───────────────────
const getFeeSummary = asyncHandler(async (req, res) => {
  const all = await Fee.find({});
  const totalBilled  = all.reduce((s, f) => s + f.totalAmount, 0);
  const totalWaived  = all.reduce((s, f) => s + (f.waiverAmount || 0), 0);
  const totalPaid    = all.reduce((s, f) => s + f.amountPaid, 0);
  const totalBalance = all.reduce((s, f) => s + f.balance, 0);

  const now = new Date();
  const overdueCount = all.filter(
    f => (f.status === 'unpaid' || f.status === 'partial') && new Date(f.dueDate) < now
  ).length;

  const byStatus = { unpaid: 0, partial: 0, paid: 0, waived: 0 };
  all.forEach(f => { byStatus[f.status] = (byStatus[f.status] || 0) + 1; });

  res.json({ totalBilled, totalWaived, totalPaid, totalBalance, count: all.length, byStatus, overdueCount });
});

// ── POST /api/fees — create fee record (admin) ────────────────
const createFee = asyncHandler(async (req, res) => {
  const { student, feeType, semester, totalAmount, dueDate, waiverAmount, waiverReason } = req.body;

  if (!student || !semester || !totalAmount || !dueDate) {
    res.status(400);
    throw new Error('student, semester, totalAmount and dueDate are required');
  }

  const studentDoc = await Student.findById(student);
  if (!studentDoc) { res.status(404); throw new Error('Student not found'); }

  const fee = await Fee.create({
    student, feeType: feeType || 'tuition', semester,
    totalAmount, dueDate,
    waiverAmount: waiverAmount || 0,
    waiverReason: waiverReason || '',
  });

  const populated = await Fee.findById(fee._id)
    .populate('student', 'firstName lastName admissionNumber email');

  // Fire-and-forget: notify student about new fee
  if (populated.student) {
    notifyStudent(populated.student, 'fee', 'New Fee Assigned', `A ${populated.feeType} fee of ₹${populated.totalAmount} for Semester ${populated.semester} has been assigned. Due: ${new Date(populated.dueDate).toLocaleDateString()}.`, { feeId: populated._id }).catch(() => {});
  }

  res.status(201).json(populated);
});

// ── POST /api/fees/:id/pay — record a payment ─────────────────
const recordPayment = asyncHandler(async (req, res) => {
  const { amount, method, reference, note } = req.body;

  if (!amount || amount <= 0) { res.status(400); throw new Error('Valid amount is required'); }
  if (!method)                { res.status(400); throw new Error('Payment method is required'); }

  const fee = await Fee.findById(req.params.id);
  if (!fee) { res.status(404); throw new Error('Fee record not found'); }
  if (fee.status === 'paid' || fee.status === 'waived') {
    res.status(400); throw new Error('Fee is already settled');
  }

  fee.transactions.push({ amount, method, reference: reference || '', note: note || '', recordedBy: req.user._id });
  await fee.save();

  const populated = await Fee.findById(fee._id)
    .populate('student', 'firstName lastName admissionNumber email');

  // Fire-and-forget: notify student about payment recorded
  if (populated.student) {
    notifyStudent(populated.student, 'payment', 'Payment Recorded', `Your payment of ₹${amount} has been recorded. Remaining balance: ₹${populated.balance}.`, { feeId: populated._id }).catch(() => {});
  }

  res.json(populated);
});

// ── POST /api/fees/bulk — create fees for all accepted students ──
const bulkCreateFees = asyncHandler(async (req, res) => {
  const { feeType, semester, totalAmount, dueDate } = req.body;
  if (!semester || !totalAmount || !dueDate) {
    res.status(400);
    throw new Error('semester, totalAmount and dueDate are required');
  }

  const students = await Student.find({ status: 'accepted' });
  if (students.length === 0) {
    res.status(400);
    throw new Error('No accepted students found');
  }

  // Skip students already assigned this semester + feeType
  const existing = await Fee.find({ semester, feeType: feeType || 'tuition' }).select('student');
  const existingIds = new Set(existing.map(f => f.student.toString()));
  const newStudents = students.filter(s => !existingIds.has(s._id.toString()));

  if (newStudents.length === 0) {
    res.status(400);
    throw new Error('All accepted students already have a fee record for this semester and type');
  }

  const docs = newStudents.map(s => ({
    student: s._id, feeType: feeType || 'tuition', semester, totalAmount, dueDate,
  }));
  await Fee.insertMany(docs);
  res.status(201).json({ message: `Created ${docs.length} fee records`, count: docs.length });
});

// ── GET /api/fees/my — fees for logged-in student ─────────────
const getMyFees = asyncHandler(async (req, res) => {
  // Match by user._id or by email
  const student = await Student.findOne({
    $or: [{ user: req.user._id }, { email: req.user.email }],
  });
  if (!student) return res.json([]);

  const fees = await Fee.find({ student: student._id })
    .populate('student', 'firstName lastName admissionNumber email courseApplied')
    .sort({ createdAt: -1 });
  res.json(fees);
});

// ── PUT /api/fees/:id — update fee (waiver, dueDate, etc.) ────
const updateFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) { res.status(404); throw new Error('Fee record not found'); }

  const { totalAmount, dueDate, waiverAmount, waiverReason, status } = req.body;
  if (totalAmount  !== undefined) fee.totalAmount  = totalAmount;
  if (dueDate      !== undefined) fee.dueDate      = dueDate;
  if (waiverAmount !== undefined) fee.waiverAmount = waiverAmount;
  if (waiverReason !== undefined) fee.waiverReason = waiverReason;
  if (status       === 'waived')  fee.status       = 'waived';

  await fee.save();

  const populated = await Fee.findById(fee._id)
    .populate('student', 'firstName lastName admissionNumber email');
  res.json(populated);
});

// ── DELETE /api/fees/:id — delete fee record ──────────────────
const deleteFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) { res.status(404); throw new Error('Fee record not found'); }
  await fee.deleteOne();
  res.json({ message: 'Fee record deleted' });
});

module.exports = { getAllFees, getStudentFees, getFeeSummary, createFee, recordPayment, updateFee, deleteFee, bulkCreateFees, getMyFees };
