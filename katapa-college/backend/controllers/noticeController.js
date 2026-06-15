// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: noticeController.js                                  ║
// ║  PATH: backend/controllers/noticeController.js               ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Notice board CRUD — notices create/update/delete.        ║
// ║  → Pinned aur expired notices filter karta hai.             ║
// ║  → Notice create pe students ko email notification jaati hai.║
// ║                                                              ║
// ║  FUNCTIONS: getNotices, getAllNotices, createNotice,         ║
// ║    updateNotice, deleteNotice                                ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const Notice  = require('../models/Notice');
const Student = require('../models/Student');
const emailService = require('../utils/emailService');
const { notifyAllStudents } = require('../utils/notificationHelper');

// @desc   Get all active notices (public)
// @route  GET /api/notices
// @access Public
const getNotices = asyncHandler(async (req, res) => {
  const now = new Date();
  const notices = await Notice.find({
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  })
    .sort({ pinned: -1, createdAt: -1 })
    .limit(20);
  res.json({ success: true, data: notices });
});

// @desc   Get all notices including expired (admin)
// @route  GET /api/notices/all
// @access Admin
const getAllNotices = asyncHandler(async (req, res) => {
  const notices = await Notice.find().sort({ pinned: -1, createdAt: -1 });
  res.json({ success: true, data: notices });
});

// @desc   Create notice
// @route  POST /api/notices
// @access Admin
const createNotice = asyncHandler(async (req, res) => {
  const { title, message, category, pinned, expiresAt } = req.body;
  if (!title || !message) {
    res.status(400);
    throw new Error('Title and message are required');
  }
  const notice = await Notice.create({
    title,
    message,
    category: category || 'general',
    pinned: pinned || false,
    expiresAt: expiresAt || null,
    createdBy: req.user._id,
  });

  // Fire-and-forget: send notice email to all accepted students
  Student.find({ status: 'accepted' }).select('firstName lastName email').then((students) => {
    const promises = students.map((s) =>
      emailService.sendNewNotice({
        email:    s.email,
        firstName: s.firstName,
        title,
        message,
        category: category || 'general',
      }).catch(() => {})
    );
    return Promise.allSettled(promises);
  }).catch(() => {});

  // Fire-and-forget: in-app notification to all accepted students
  notifyAllStudents('notice', `New Notice: ${title}`, message, { noticeId: notice._id }).catch(() => {});

  res.status(201).json({ success: true, data: notice });
});

// @desc   Update notice
// @route  PUT /api/notices/:id
// @access Admin
const updateNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!notice) { res.status(404); throw new Error('Notice not found'); }
  res.json({ success: true, data: notice });
});

// @desc   Delete notice
// @route  DELETE /api/notices/:id
// @access Admin
const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) { res.status(404); throw new Error('Notice not found'); }
  res.json({ success: true, message: 'Notice deleted' });
});

module.exports = { getNotices, getAllNotices, createNotice, updateNotice, deleteNotice };
