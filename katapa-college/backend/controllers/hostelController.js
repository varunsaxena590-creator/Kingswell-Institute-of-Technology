// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: hostelController.js                                  ║
// ║  PATH: backend/controllers/hostelController.js               ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Hostel room allotment — create, update, delete.          ║
// ║  → Hostel fee payment record karta hai.                     ║
// ║  → Summary stats (total rooms, occupied, fees) deta hai.    ║
// ║  → Student apna hostel info dekh sakta hai.                 ║
// ║                                                              ║
// ║  FUNCTIONS: getAllHostels, getHostelSummary, createHostel,   ║
// ║    updateHostel, deleteHostel, recordPayment, getMyHostel    ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Hostel  = require('../models/Hostel');
const Student = require('../models/Student');

// ── GET /api/hostels — all hostel allotments (admin) ──────────
const getAllHostels = asyncHandler(async (req, res) => {
  const { status, feeStatus, block } = req.query;
  const filter = {};
  if (status)    filter.status    = status;
  if (feeStatus) filter.feeStatus = feeStatus;
  if (block)     filter.block     = block;

  const hostels = await Hostel.find(filter)
    .populate({
      path: 'student',
      select: 'firstName lastName admissionNumber email courseApplied phone',
      populate: { path: 'courseApplied', select: 'title level' },
    })
    .sort({ createdAt: -1 });

  res.json(hostels);
});

// ── GET /api/hostels/summary — dashboard stats ────────────────
const getHostelSummary = asyncHandler(async (req, res) => {
  const all = await Hostel.find({});
  const totalAllotments = all.length;
  const active          = all.filter(h => h.status === 'allotted' || h.status === 'checked-in').length;
  const checkedOut      = all.filter(h => h.status === 'checked-out').length;
  const cancelled       = all.filter(h => h.status === 'cancelled').length;

  const totalBilled = all.reduce((s, h) => s + h.totalFee, 0);
  const totalWaived = all.reduce((s, h) => s + (h.waiverAmount || 0), 0);
  const totalPaid   = all.reduce((s, h) => s + h.amountPaid, 0);
  const totalPending = totalBilled - totalWaived - totalPaid;

  // Room type breakdown
  const roomTypes = {};
  all.forEach(h => { roomTypes[h.roomType] = (roomTypes[h.roomType] || 0) + 1; });

  // Block breakdown
  const blocks = {};
  all.forEach(h => { blocks[h.block] = (blocks[h.block] || 0) + 1; });

  res.json({
    totalAllotments, active, checkedOut, cancelled,
    totalBilled, totalWaived, totalPaid, totalPending: Math.max(0, totalPending),
    roomTypes, blocks,
  });
});

// ── POST /api/hostels — allot room to student ─────────────────
const createHostel = asyncHandler(async (req, res) => {
  const { student, block, roomNumber, roomType, floor, academicYear, checkIn, totalFee, waiverAmount, waiverReason, remarks } = req.body;

  if (!student || !block || !roomNumber || !academicYear || totalFee === undefined) {
    res.status(400);
    throw new Error('Student, block, room number, academic year aur total fee required hain');
  }

  // Check student exists
  const stud = await Student.findById(student);
  if (!stud) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Check duplicate active allotment for same student + academic year
  const existing = await Hostel.findOne({
    student, academicYear,
    status: { $in: ['allotted', 'checked-in'] },
  });
  if (existing) {
    res.status(400);
    throw new Error(`Student already has room ${existing.roomNumber} allotted for ${academicYear}`);
  }

  const hostel = await Hostel.create({
    student, block, roomNumber, roomType: roomType || 'double',
    floor: floor || 0, academicYear,
    checkIn: checkIn || new Date(),
    totalFee, waiverAmount: waiverAmount || 0,
    waiverReason: waiverReason || '', remarks: remarks || '',
  });

  const populated = await Hostel.findById(hostel._id).populate({
    path: 'student',
    select: 'firstName lastName admissionNumber email courseApplied phone',
    populate: { path: 'courseApplied', select: 'title level' },
  });

  res.status(201).json(populated);
});

// ── PUT /api/hostels/:id — update allotment ───────────────────
const updateHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) {
    res.status(404);
    throw new Error('Hostel allotment not found');
  }

  const allowed = ['block', 'roomNumber', 'roomType', 'floor', 'academicYear', 'checkIn', 'checkOut', 'status', 'totalFee', 'waiverAmount', 'waiverReason', 'remarks'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) hostel[key] = req.body[key];
  });

  const updated = await hostel.save();
  const populated = await Hostel.findById(updated._id).populate({
    path: 'student',
    select: 'firstName lastName admissionNumber email courseApplied phone',
    populate: { path: 'courseApplied', select: 'title level' },
  });

  res.json(populated);
});

// ── DELETE /api/hostels/:id — remove allotment ────────────────
const deleteHostel = asyncHandler(async (req, res) => {
  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) {
    res.status(404);
    throw new Error('Hostel allotment not found');
  }
  await hostel.deleteOne();
  res.json({ message: 'Hostel allotment deleted' });
});

// ── POST /api/hostels/:id/pay — record payment ───────────────
const recordPayment = asyncHandler(async (req, res) => {
  const { amount, method, reference, note } = req.body;
  if (!amount || !method) {
    res.status(400);
    throw new Error('Amount aur payment method required hain');
  }

  const hostel = await Hostel.findById(req.params.id);
  if (!hostel) {
    res.status(404);
    throw new Error('Hostel allotment not found');
  }

  hostel.payments.push({
    amount: Number(amount),
    method,
    reference: reference || '',
    note: note || '',
    recordedBy: req.user._id,
    paidAt: new Date(),
  });

  const updated = await hostel.save();
  const populated = await Hostel.findById(updated._id).populate({
    path: 'student',
    select: 'firstName lastName admissionNumber email courseApplied phone',
    populate: { path: 'courseApplied', select: 'title level' },
  });

  res.json(populated);
});

// ── GET /api/hostels/my — student's own hostel info ───────────
const getMyHostel = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const hostels = await Hostel.find({ student: student._id })
    .populate('student', 'firstName lastName admissionNumber email')
    .sort({ createdAt: -1 });

  res.json(hostels);
});

module.exports = {
  getAllHostels,
  getHostelSummary,
  createHostel,
  updateHostel,
  deleteHostel,
  recordPayment,
  getMyHostel,
};
