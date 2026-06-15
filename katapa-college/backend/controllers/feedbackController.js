// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: feedbackController.js                                ║
// ║  PATH: backend/controllers/feedbackController.js             ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Student submit feedback (rating + message).              ║
// ║  → Admin view all, reply, change status, delete.            ║
// ║  → Student apni feedback history dekhta hai.                ║
// ║                                                              ║
// ║  FUNCTIONS: submitFeedback, getMyFeedback, getAllFeedback,  ║
// ║    replyFeedback, deleteFeedback                             ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');
const Student  = require('../models/Student');

// @desc   Submit feedback (student)
// @route  POST /api/feedback
// @access Protected
const submitFeedback = asyncHandler(async (req, res) => {
  const { category, subject, message, rating, anonymous } = req.body;
  if (!category || !subject || !message || !rating) {
    res.status(400);
    throw new Error('Category, subject, message and rating are required');
  }

  const student = await Student.findOne({ email: req.user.email });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const feedback = await Feedback.create({
    student: student._id,
    category, subject, message,
    rating: Number(rating),
    anonymous: anonymous || false,
  });

  const populated = await Feedback.findById(feedback._id)
    .populate('student', 'firstName lastName email enrollmentNo');

  res.status(201).json({ success: true, data: populated });
});

// @desc   Get my feedback history (student)
// @route  GET /api/feedback/my
// @access Protected
const getMyFeedback = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ email: req.user.email });
  if (!student) return res.json({ success: true, data: [] });

  const feedbacks = await Feedback.find({ student: student._id })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: feedbacks });
});

// @desc   Get all feedback (admin)
// @route  GET /api/feedback
// @access Admin
const getAllFeedback = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate('student', 'firstName lastName email enrollmentNo course')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: feedbacks });
});

// @desc   Reply to feedback & update status (admin)
// @route  PUT /api/feedback/:id/reply
// @access Admin
const replyFeedback = asyncHandler(async (req, res) => {
  const { adminReply, status } = req.body;
  const update = {};
  if (adminReply !== undefined) {
    update.adminReply = adminReply;
    update.repliedAt = new Date();
  }
  if (status) update.status = status;

  const feedback = await Feedback.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    .populate('student', 'firstName lastName email enrollmentNo course');

  if (!feedback) { res.status(404); throw new Error('Feedback not found'); }
  res.json({ success: true, data: feedback });
});

// @desc   Delete feedback (admin)
// @route  DELETE /api/feedback/:id
// @access Admin
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) { res.status(404); throw new Error('Feedback not found'); }
  res.json({ success: true, message: 'Feedback deleted' });
});

module.exports = { submitFeedback, getMyFeedback, getAllFeedback, replyFeedback, deleteFeedback };
