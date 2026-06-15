// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: attendanceController.js                              ║
// ║  PATH: backend/controllers/attendanceController.js           ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Attendance mark karna (admin), dekhna, check karna.      ║
// ║  → Date/subject/semester ke basis pe filter karta hai.      ║
// ║  → Student apni khud ki attendance dekh sakta hai.           ║
// ║                                                              ║
// ║  FUNCTIONS: markAttendance, getAllAttendance,                ║
// ║    getStudentsForAttendance, checkAttendance,                ║
// ║    getMyAttendance, deleteAttendance                         ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');

// @desc   Mark / save attendance for a date+subject+semester
// @route  POST /api/attendance
// @access Admin
const markAttendance = asyncHandler(async (req, res) => {
  const { date, subject, semester, records } = req.body;

  if (!date || !subject || !semester || !Array.isArray(records) || !records.length) {
    res.status(400);
    throw new Error('date, subject, semester and records are required');
  }

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Upsert: update existing sheet for this day/subject/semester or create
  const attendance = await Attendance.findOneAndUpdate(
    {
      date:     { $gte: dayStart, $lte: dayEnd },
      subject:  subject.trim(),
      semester: semester.trim(),
    },
    {
      date:     new Date(date),
      subject:  subject.trim(),
      semester: semester.trim(),
      records,
      markedBy: req.user._id,
    },
    { new: true, upsert: true, runValidators: true }
  ).populate('records.student', 'firstName lastName admissionNumber');

  res.status(201).json({ success: true, data: attendance });
});

// @desc   Get all attendance records (admin) with filters
// @route  GET /api/attendance
// @access Admin
const getAllAttendance = asyncHandler(async (req, res) => {
  const { date, subject, semester, student } = req.query;
  const filter = {};

  if (date) {
    const d = new Date(date);
    const start = new Date(d); start.setHours(0, 0, 0, 0);
    const end   = new Date(d); end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }
  if (subject)  filter.subject  = { $regex: subject, $options: 'i' };
  if (semester) filter.semester = { $regex: semester, $options: 'i' };

  let records = await Attendance.find(filter)
    .populate('records.student', 'firstName lastName admissionNumber email')
    .sort({ date: -1 });

  // Filter by student after populate if requested
  if (student) {
    records = records.filter(r =>
      r.records.some(rec => rec.student && rec.student._id.toString() === student)
    );
  }

  res.json({ success: true, data: records });
});

// @desc   Get student list for marking attendance (accepted students by semester/course)
// @route  GET /api/attendance/students
// @access Admin
const getStudentsForAttendance = asyncHandler(async (req, res) => {
  const students = await Student.find({ status: 'accepted' })
    .populate('courseApplied', 'title')
    .select('firstName lastName admissionNumber email courseApplied')
    .sort({ firstName: 1 });

  res.json({ success: true, data: students });
});

// @desc   Check existing attendance for a date+subject+semester
// @route  GET /api/attendance/check
// @access Admin
const checkAttendance = asyncHandler(async (req, res) => {
  const { date, subject, semester } = req.query;

  if (!date || !subject || !semester) {
    return res.json({ success: true, data: null });
  }

  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999);

  const existing = await Attendance.findOne({
    date:     { $gte: dayStart, $lte: dayEnd },
    subject:  subject.trim(),
    semester: semester.trim(),
  }).populate('records.student', 'firstName lastName admissionNumber');

  res.json({ success: true, data: existing || null });
});

// @desc   Get my attendance (student)
// @route  GET /api/attendance/my
// @access Private
const getMyAttendance = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    $or: [{ user: req.user._id }, { email: req.user.email }],
  });

  if (!student) {
    return res.json({ success: true, data: [] });
  }

  // Get all attendance records that include this student
  const allRecords = await Attendance.find({ 'records.student': student._id })
    .sort({ date: -1 });

  // Build summary grouped by subject
  const subjectMap = {};
  for (const sheet of allRecords) {
    const rec = sheet.records.find(r => r.student.toString() === student._id.toString());
    if (!rec) continue;

    const key = `${sheet.subject}__${sheet.semester}`;
    if (!subjectMap[key]) {
      subjectMap[key] = {
        subject:  sheet.subject,
        semester: sheet.semester,
        total:    0,
        present:  0,
        absent:   0,
        late:     0,
        sessions: [],
      };
    }
    subjectMap[key].total++;
    subjectMap[key][rec.status]++;
    subjectMap[key].sessions.push({ date: sheet.date, status: rec.status });
  }

  const data = Object.values(subjectMap).map(s => ({
    ...s,
    percentage: s.total > 0 ? Math.round(((s.present + s.late * 0.5) / s.total) * 100) : 0,
  }));

  res.json({ success: true, data });
});

// @desc   Delete an attendance record (the whole sheet)
// @route  DELETE /api/attendance/:id
// @access Admin
const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) { res.status(404); throw new Error('Attendance record not found'); }
  await attendance.deleteOne();
  res.json({ success: true, message: 'Deleted' });
});

module.exports = {
  markAttendance,
  getAllAttendance,
  getStudentsForAttendance,
  checkAttendance,
  getMyAttendance,
  deleteAttendance,
};
