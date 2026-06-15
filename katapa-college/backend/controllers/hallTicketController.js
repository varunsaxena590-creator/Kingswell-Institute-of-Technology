// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: hallTicketController.js                              ║
// ║  PATH: backend/controllers/hallTicketController.js           ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Admin exam hall tickets create/update/delete karta hai.  ║
// ║  → Students ko seat numbers assign karta hai.               ║
// ║  → Student apna hall ticket fetch kar sakta hai.             ║
// ║  → Publish/unpublish toggle karta hai.                      ║
// ║                                                              ║
// ║  FUNCTIONS: getAllHallTickets, createHallTicket,             ║
// ║    updateHallTicket, deleteHallTicket, assignSeats,          ║
// ║    togglePublish, getMyHallTickets                           ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const HallTicket = require('../models/HallTicket');
const Student = require('../models/Student');

// ── GET all hall tickets (Admin) ────────────────────────────────
const getAllHallTickets = asyncHandler(async (req, res) => {
  const tickets = await HallTicket.find()
    .populate('course', 'title department')
    .populate('seats.student', 'firstName lastName admissionNumber email')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: tickets });
});

// ── CREATE hall ticket (Admin) ──────────────────────────────────
const createHallTicket = asyncHandler(async (req, res) => {
  const { examName, examType, semester, course, startDate, endDate, reportTime, venue, subjects, instructions } = req.body;

  if (!examName || !semester || !course || !startDate || !endDate || !venue) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const ticket = await HallTicket.create({
    examName, examType, semester, course, startDate, endDate,
    reportTime: reportTime || '09:00 AM',
    venue,
    subjects: subjects || [],
    instructions: instructions || 'Bring your student ID card. No electronic devices allowed.',
  });

  const populated = await HallTicket.findById(ticket._id)
    .populate('course', 'title department');

  res.status(201).json({ success: true, data: populated });
});

// ── UPDATE hall ticket (Admin) ──────────────────────────────────
const updateHallTicket = asyncHandler(async (req, res) => {
  const ticket = await HallTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Hall ticket not found');
  }

  const fields = ['examName', 'examType', 'semester', 'course', 'startDate', 'endDate', 'reportTime', 'venue', 'subjects', 'instructions'];
  fields.forEach(f => { if (req.body[f] !== undefined) ticket[f] = req.body[f]; });

  await ticket.save();
  const populated = await HallTicket.findById(ticket._id)
    .populate('course', 'title department')
    .populate('seats.student', 'firstName lastName admissionNumber email');

  res.json({ success: true, data: populated });
});

// ── DELETE hall ticket (Admin) ──────────────────────────────────
const deleteHallTicket = asyncHandler(async (req, res) => {
  const ticket = await HallTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Hall ticket not found');
  }
  await ticket.deleteOne();
  res.json({ success: true, message: 'Hall ticket deleted' });
});

// ── ASSIGN seats to students (Admin) ────────────────────────────
const assignSeats = asyncHandler(async (req, res) => {
  const ticket = await HallTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Hall ticket not found');
  }

  const { seats } = req.body;
  // seats = [{ student: "studentId", seatNumber: "A-01" }, ...]
  if (!seats || !Array.isArray(seats) || seats.length === 0) {
    res.status(400);
    throw new Error('Please provide seat assignments');
  }

  ticket.seats = seats;
  await ticket.save();

  const populated = await HallTicket.findById(ticket._id)
    .populate('course', 'title department')
    .populate('seats.student', 'firstName lastName admissionNumber email');

  res.json({ success: true, data: populated });
});

// ── AUTO-ASSIGN seats for a course (Admin) ──────────────────────
const autoAssignSeats = asyncHandler(async (req, res) => {
  const ticket = await HallTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Hall ticket not found');
  }

  // Find all accepted students for this course
  const students = await Student.find({
    courseApplied: ticket.course,
    status: 'accepted',
  }).sort({ admissionNumber: 1 });

  if (students.length === 0) {
    res.status(400);
    throw new Error('No accepted students found for this course');
  }

  const prefix = req.body.prefix || 'S';
  ticket.seats = students.map((s, i) => ({
    student: s._id,
    seatNumber: `${prefix}-${String(i + 1).padStart(3, '0')}`,
  }));

  await ticket.save();

  const populated = await HallTicket.findById(ticket._id)
    .populate('course', 'title department')
    .populate('seats.student', 'firstName lastName admissionNumber email');

  res.json({ success: true, data: populated, assigned: students.length });
});

// ── TOGGLE publish (Admin) ──────────────────────────────────────
const togglePublish = asyncHandler(async (req, res) => {
  const ticket = await HallTicket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Hall ticket not found');
  }

  ticket.isPublished = !ticket.isPublished;
  await ticket.save();

  res.json({
    success: true,
    data: ticket,
    message: ticket.isPublished ? 'Hall ticket published' : 'Hall ticket unpublished',
  });
});

// ── GET my hall tickets (Student) ───────────────────────────────
const getMyHallTickets = asyncHandler(async (req, res) => {
  // Find student linked to current user
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // Find all published hall tickets where this student has a seat
  const tickets = await HallTicket.find({
    isPublished: true,
    'seats.student': student._id,
  })
    .populate('course', 'title department')
    .sort({ startDate: -1 });

  // Map to include only the student's seat info
  const result = tickets.map(t => {
    const mySeat = t.seats.find(s => s.student.toString() === student._id.toString());
    return {
      _id: t._id,
      examName: t.examName,
      examType: t.examType,
      semester: t.semester,
      course: t.course,
      startDate: t.startDate,
      endDate: t.endDate,
      reportTime: t.reportTime,
      venue: t.venue,
      subjects: t.subjects,
      instructions: t.instructions,
      seatNumber: mySeat?.seatNumber || 'N/A',
      student: {
        name: `${student.firstName} ${student.lastName}`,
        admissionNumber: student.admissionNumber,
        email: student.email,
        photo: student.profilePhoto,
        course: student.courseApplied,
      },
    };
  });

  res.json({ success: true, data: result });
});

module.exports = {
  getAllHallTickets,
  createHallTicket,
  updateHallTicket,
  deleteHallTicket,
  assignSeats,
  autoAssignSeats,
  togglePublish,
  getMyHallTickets,
};
