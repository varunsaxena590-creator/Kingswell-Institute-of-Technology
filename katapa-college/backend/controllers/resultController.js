// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: resultController.js                                  ║
// ║  PATH: backend/controllers/resultController.js               ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Student exam results ka CRUD handle karta hai.           ║
// ║  → Result publish karne pe email jaata hai student ko.      ║
// ║  → Student apne results dekh sakta hai.                     ║
// ║                                                              ║
// ║  FUNCTIONS: getAllResults, getMyResults, createResult,       ║
// ║    updateResult, publishResult, deleteResult                 ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const Result  = require('../models/Result');
const Student = require('../models/Student');
const emailService = require('../utils/emailService');
const { notifyStudent } = require('../utils/notificationHelper');

// @desc   Get all results (admin)
// @route  GET /api/results
// @access Admin
const getAllResults = asyncHandler(async (req, res) => {
  const { semester, student } = req.query;
  const filter = {};
  if (semester) filter.semester = { $regex: semester, $options: 'i' };
  if (student)  filter.student  = student;

  const results = await Result.find(filter)
    .populate('student', 'firstName lastName email admissionNumber courseApplied')
    .populate({ path: 'student', populate: { path: 'courseApplied', select: 'title' } })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: results });
});

// @desc   Get results for logged-in student
// @route  GET /api/results/my
// @access Private
const getMyResults = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    $or: [{ user: req.user._id }, { email: req.user.email }],
  });

  if (!student) {
    return res.json({ success: true, data: [] });
  }

  const results = await Result.find({ student: student._id, publishedAt: { $ne: null } })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: results });
});

// @desc   Create result
// @route  POST /api/results
// @access Admin
const createResult = asyncHandler(async (req, res) => {
  const { student, semester, examType, subjects, remarks } = req.body;
  if (!student || !semester || !subjects?.length) {
    res.status(400);
    throw new Error('Student, semester and at least one subject are required');
  }

  const result = await Result.create({ student, semester, examType, subjects, remarks });
  await result.populate('student', 'firstName lastName email admissionNumber');
  res.status(201).json({ success: true, data: result });
});

// @desc   Update result
// @route  PUT /api/results/:id
// @access Admin
const updateResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);
  if (!result) { res.status(404); throw new Error('Result not found'); }

  Object.assign(result, req.body);
  await result.save();
  await result.populate('student', 'firstName lastName email admissionNumber');
  res.json({ success: true, data: result });
});

// @desc   Publish result (make visible to student)
// @route  PUT /api/results/:id/publish
// @access Admin
const publishResult = asyncHandler(async (req, res) => {
  const result = await Result.findByIdAndUpdate(
    req.params.id,
    { publishedAt: new Date() },
    { new: true }
  ).populate('student', 'firstName lastName email admissionNumber');
  if (!result) { res.status(404); throw new Error('Result not found'); }

  // Fire-and-forget: notify student that results are published
  const student = result.student;
  if (student?.email) {
    // Compute overall percentage if marks available
    const subjects = result.subjects || [];
    const totalMarks = subjects.reduce((s, sub) => s + (sub.maxMarks || 100), 0);
    const obtained   = subjects.reduce((s, sub) => s + (sub.marksObtained || 0), 0);
    const overallPercentage = totalMarks > 0 ? Math.round((obtained / totalMarks) * 100) : 0;
    const overallGrade = result.overallGrade || (overallPercentage >= 80 ? 'A' : overallPercentage >= 60 ? 'B' : overallPercentage >= 40 ? 'C' : 'F');
    emailService.sendResultPublished({
      email:             student.email,
      firstName:         student.firstName,
      lastName:          student.lastName,
      semester:          result.semester,
      examType:          result.examType || 'Examination',
      overallGrade,
      overallPercentage,
    }).catch(() => {});
  }

  // Fire-and-forget: in-app notification to student
  if (result.student) {
    notifyStudent(result.student, 'result', 'Result Published', `Your ${result.examType || 'Exam'} result for Semester ${result.semester} has been published.`, { resultId: result._id }).catch(() => {});
  }

  res.json({ success: true, data: result });
});

// @desc   Delete result
// @route  DELETE /api/results/:id
// @access Admin
const deleteResult = asyncHandler(async (req, res) => {
  const result = await Result.findByIdAndDelete(req.params.id);
  if (!result) { res.status(404); throw new Error('Result not found'); }
  res.json({ success: true, message: 'Result deleted' });
});

module.exports = { getAllResults, getMyResults, createResult, updateResult, publishResult, deleteResult };
