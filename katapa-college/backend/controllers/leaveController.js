// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: leaveController.js                                   ║
// ║  PATH: backend/controllers/leaveController.js                ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Student leave apply karta hai (create).                  ║
// ║  → Student apni leaves dekh sakta hai (getMyLeaves).        ║
// ║  → Admin saari leaves dekhta hai (getAllLeaves).             ║
// ║  → Admin approve/reject karta hai (reviewLeave).            ║
// ║  → Admin/Student leave delete kar sakta hai (deleteLeave).  ║
// ║                                                              ║
// ║  FUNCTIONS: applyLeave, getMyLeaves, getAllLeaves,           ║
// ║    reviewLeave, deleteLeave                                  ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const Student = require('../models/Student');
const { notifyStudent } = require('../utils/notificationHelper');

// ── APPLY for leave (Student) ───────────────────────────────────
const applyLeave = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found. Please complete admission first.');
  }
  if (student.status !== 'accepted') {
    res.status(403);
    throw new Error('Only accepted students can apply for leave.');
  }

  const { leaveType, subject, reason, startDate, endDate } = req.body;
  if (!subject || !reason || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }
  if (new Date(endDate) < new Date(startDate)) {
    res.status(400);
    throw new Error('End date cannot be before start date');
  }

  const leave = await Leave.create({
    student: student._id,
    leaveType: leaveType || 'casual',
    subject,
    reason,
    startDate,
    endDate,
  });

  res.status(201).json({ success: true, data: leave });
});

// ── GET my leaves (Student) ────────────────────────────────────
const getMyLeaves = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const leaves = await Leave.find({ student: student._id })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: leaves });
});

// ── GET all leaves (Admin) ─────────────────────────────────────
const getAllLeaves = asyncHandler(async (req, res) => {
  const leaves = await Leave.find()
    .populate('student', 'firstName lastName email admissionNumber courseApplied profilePhoto')
    .populate({ path: 'student', populate: { path: 'courseApplied', select: 'title' } })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: leaves });
});

// ── REVIEW leave — approve or reject (Admin) ───────────────────
const reviewLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  const { status, adminRemark } = req.body;
  if (!status || !['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be approved or rejected');
  }

  leave.status = status;
  leave.adminRemark = adminRemark || '';
  leave.reviewedAt = new Date();
  await leave.save();

  const populated = await Leave.findById(leave._id)
    .populate('student', 'firstName lastName email admissionNumber');

  // Fire-and-forget: notify student about leave decision
  if (populated.student) {
    notifyStudent(populated.student, 'leave', `Leave ${status.charAt(0).toUpperCase() + status.slice(1)}`, `Your leave application has been ${status}.${adminRemark ? ' Remark: ' + adminRemark : ''}`, { leaveId: populated._id }).catch(() => {});
  }

  res.json({ success: true, data: populated });
});

// ── DELETE leave (Admin or Student's own pending leave) ─────────
const deleteLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave application not found');
  }

  // If not admin, only allow deleting own pending leaves
  if (req.user.role !== 'admin') {
    const student = await Student.findOne({ user: req.user._id });
    if (!student || leave.student.toString() !== student._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this leave');
    }
    if (leave.status !== 'pending') {
      res.status(400);
      throw new Error('Can only delete pending leave applications');
    }
  }

  await leave.deleteOne();
  res.json({ success: true, message: 'Leave application deleted' });
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  deleteLeave,
};
