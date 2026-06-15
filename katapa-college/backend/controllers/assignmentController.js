// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: assignmentController.js                              ║
// ║  PATH: backend/controllers/assignmentController.js           ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Admin assignment create / update / delete karta hai.     ║
// ║  → Student apne assignments dekhta hai aur submit karta.   ║
// ║  → Admin submissions grade karta hai (marks + feedback).    ║
// ║  → Summary stats deta hai (total, graded, pending).         ║
// ║                                                              ║
// ║  FUNCTIONS: getAllAssignments, createAssignment,              ║
// ║    updateAssignment, deleteAssignment, submitAssignment,     ║
// ║    gradeSubmission, getMyAssignments, getAssignmentStats     ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Assignment = require('../models/Assignment');
const Student    = require('../models/Student');

// ── GET /api/assignments — all assignments (admin) ────────────
const getAllAssignments = asyncHandler(async (req, res) => {
  const { course, type, active } = req.query;
  const filter = {};
  if (course) filter.course = course;
  if (type)   filter.type   = type;
  if (active !== undefined) filter.isActive = active === 'true';

  const assignments = await Assignment.find(filter)
    .populate('course', 'title level')
    .populate('submissions.student', 'firstName lastName admissionNumber email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: assignments });
});

// ── GET /api/assignments/stats — summary stats (admin) ────────
const getAssignmentStats = asyncHandler(async (req, res) => {
  const all = await Assignment.find({});
  const total       = all.length;
  const active      = all.filter(a => a.isActive).length;
  const pastDue     = all.filter(a => new Date() > a.dueDate).length;
  const totalSubs   = all.reduce((s, a) => s + a.submissions.length, 0);
  const totalGraded = all.reduce((s, a) => s + a.submissions.filter(sub => sub.status === 'graded').length, 0);
  const pendingGrading = totalSubs - totalGraded;

  // Type breakdown
  const types = {};
  all.forEach(a => { types[a.type] = (types[a.type] || 0) + 1; });

  res.json({
    success: true,
    data: { total, active, pastDue, totalSubs, totalGraded, pendingGrading, types },
  });
});

// ── POST /api/assignments — create assignment (admin) ─────────
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, course, subject, dueDate, totalMarks, type } = req.body;

  if (!title || !description || !course || !dueDate) {
    res.status(400);
    throw new Error('Title, description, course aur due date required hain');
  }

  const assignment = await Assignment.create({
    title,
    description,
    course,
    subject:      subject || '',
    dueDate,
    totalMarks:   totalMarks || 100,
    type:         type || 'assignment',
    assignedDate: new Date(),
    createdBy:    req.user._id,
  });

  const populated = await Assignment.findById(assignment._id)
    .populate('course', 'title level')
    .populate('createdBy', 'name email');

  res.status(201).json({ success: true, data: populated });
});

// ── PUT /api/assignments/:id — update assignment (admin) ──────
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const allowed = ['title', 'description', 'course', 'subject', 'dueDate', 'totalMarks', 'type', 'isActive'];
  allowed.forEach(key => {
    if (req.body[key] !== undefined) assignment[key] = req.body[key];
  });

  const updated = await assignment.save();
  const populated = await Assignment.findById(updated._id)
    .populate('course', 'title level')
    .populate('submissions.student', 'firstName lastName admissionNumber email')
    .populate('createdBy', 'name email');

  res.json({ success: true, data: populated });
});

// ── DELETE /api/assignments/:id — delete assignment (admin) ───
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  await assignment.deleteOne();
  res.json({ success: true, message: 'Assignment deleted' });
});

// ── POST /api/assignments/:id/submit — student submits ────────
const submitAssignment = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found. Complete admission first.');
  }

  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  if (!assignment.isActive) {
    res.status(400);
    throw new Error('This assignment is no longer active');
  }

  // Check if already submitted
  const alreadySubmitted = assignment.submissions.find(
    s => s.student.toString() === student._id.toString()
  );
  if (alreadySubmitted) {
    res.status(400);
    throw new Error('Tum already submit kar chuke ho is assignment ko');
  }

  const { content } = req.body;
  if (!content) {
    res.status(400);
    throw new Error('Submission content required hai');
  }

  const isLate = new Date() > assignment.dueDate;

  assignment.submissions.push({
    student: student._id,
    content,
    submittedAt: new Date(),
    status: isLate ? 'late' : 'submitted',
  });

  await assignment.save();

  const populated = await Assignment.findById(assignment._id)
    .populate('course', 'title level')
    .populate('submissions.student', 'firstName lastName admissionNumber email');

  res.status(201).json({ success: true, data: populated });
});

// ── PUT /api/assignments/:id/grade/:submissionId — admin grades ─
const gradeSubmission = asyncHandler(async (req, res) => {
  const { marks, feedback } = req.body;
  if (marks === undefined || marks === null) {
    res.status(400);
    throw new Error('Marks required hain');
  }

  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const submission = assignment.submissions.id(req.params.submissionId);
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  if (Number(marks) > assignment.totalMarks) {
    res.status(400);
    throw new Error(`Marks ${assignment.totalMarks} se zyada nahi ho sakte`);
  }

  submission.marks    = Number(marks);
  submission.feedback = feedback || '';
  submission.status   = 'graded';
  submission.gradedAt = new Date();

  await assignment.save();

  const populated = await Assignment.findById(assignment._id)
    .populate('course', 'title level')
    .populate('submissions.student', 'firstName lastName admissionNumber email')
    .populate('createdBy', 'name email');

  res.json({ success: true, data: populated });
});

// ── GET /api/assignments/my — student's assignments ───────────
const getMyAssignments = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // Find assignments for student's course
  const filter = {};
  if (student.courseApplied) {
    filter.course = student.courseApplied;
  }

  const assignments = await Assignment.find(filter)
    .populate('course', 'title level')
    .sort({ createdAt: -1 });

  // For each assignment, find this student's submission only
  const result = assignments.map(a => {
    const obj = a.toObject();
    const mySub = obj.submissions.find(
      s => s.student && s.student.toString() === student._id.toString()
    );
    return {
      _id:          obj._id,
      title:        obj.title,
      description:  obj.description,
      course:       obj.course,
      subject:      obj.subject,
      assignedDate: obj.assignedDate,
      dueDate:      obj.dueDate,
      totalMarks:   obj.totalMarks,
      type:         obj.type,
      isActive:     obj.isActive,
      isPastDue:    new Date() > new Date(obj.dueDate),
      mySubmission: mySub || null,
    };
  });

  res.json({ success: true, data: result });
});

module.exports = {
  getAllAssignments,
  getAssignmentStats,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getMyAssignments,
};
