// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: timetableController.js                               ║
// ║  PATH: backend/controllers/timetableController.js            ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Class timetable slots ka CRUD karta hai.                 ║
// ║  → Day/semester/course ke basis pe filter karta hai.        ║
// ║  → Student apna personal timetable dekh sakta hai.          ║
// ║                                                              ║
// ║  FUNCTIONS: getTimetable, getMyTimetable, createSlot,       ║
// ║    updateSlot, deleteSlot                                    ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const Timetable = require('../models/Timetable');
const Student   = require('../models/Student');

// @desc   Get timetable — public with optional filters
// @route  GET /api/timetable
// @access Public
const getTimetable = asyncHandler(async (req, res) => {
  const { semester, course, day } = req.query;
  const filter = {};
  if (semester) filter.semester = { $regex: semester, $options: 'i' };
  if (course)   filter.course   = course;
  if (day)      filter.day      = day;

  const slots = await Timetable.find(filter)
    .populate('course', 'title')
    .sort({ day: 1, startTime: 1 });

  res.json({ success: true, data: slots });
});

// @desc   Get timetable for logged-in student (matched by their course + semester)
// @route  GET /api/timetable/my
// @access Private
const getMyTimetable = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    $or: [{ user: req.user._id }, { email: req.user.email }],
  }).populate('courseApplied');

  if (!student || student.status !== 'accepted') {
    return res.json({ success: true, data: [] });
  }

  // Fetch timetable slots matching student's course
  const slots = await Timetable.find({ course: student.courseApplied._id })
    .populate('course', 'title')
    .sort({ day: 1, startTime: 1 });

  // If no course-specific slots, try by semester matching
  if (!slots.length) {
    const bySem = await Timetable.find({})
      .populate('course', 'title')
      .sort({ day: 1, startTime: 1 });
    return res.json({ success: true, data: bySem });
  }

  res.json({ success: true, data: slots });
});

// @desc   Create timetable slot
// @route  POST /api/timetable
// @access Admin
const createSlot = asyncHandler(async (req, res) => {
  const { day, subject, teacher, room, startTime, endTime, semester, course, type } = req.body;

  if (!day || !subject || !teacher || !startTime || !endTime || !semester) {
    res.status(400);
    throw new Error('day, subject, teacher, startTime, endTime and semester are required');
  }

  const slot = await Timetable.create({ day, subject, teacher, room, startTime, endTime, semester, course: course || null, type });
  await slot.populate('course', 'title');
  res.status(201).json({ success: true, data: slot });
});

// @desc   Update timetable slot
// @route  PUT /api/timetable/:id
// @access Admin
const updateSlot = asyncHandler(async (req, res) => {
  const slot = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('course', 'title');
  if (!slot) { res.status(404); throw new Error('Slot not found'); }
  res.json({ success: true, data: slot });
});

// @desc   Delete timetable slot
// @route  DELETE /api/timetable/:id
// @access Admin
const deleteSlot = asyncHandler(async (req, res) => {
  const slot = await Timetable.findById(req.params.id);
  if (!slot) { res.status(404); throw new Error('Slot not found'); }
  await slot.deleteOne();
  res.json({ success: true, message: 'Deleted' });
});

module.exports = { getTimetable, getMyTimetable, createSlot, updateSlot, deleteSlot };
