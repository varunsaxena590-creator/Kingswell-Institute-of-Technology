// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: messageController.js                                 ║
// ║  PATH: backend/controllers/messageController.js              ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Student-Admin messaging system controller.               ║
// ║  → Student naya conversation start karta hai.               ║
// ║  → Dono taraf se messages bhej sakte hain.                  ║
// ║  → Admin saari conversations dekhta hai.                    ║
// ║  → Student sirf apni conversations dekhta hai.              ║
// ║  → Unread count + mark-as-read support.                     ║
// ║                                                              ║
// ║  FUNCTIONS: getConversations, getMyConversations,            ║
// ║    getConversation, startConversation, sendMessage,          ║
// ║    markRead, closeConversation, getUnreadCount               ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Message');
const Student      = require('../models/Student');

// ── GET /api/messages — all conversations (admin) ──────────────
const getConversations = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const convos = await Conversation.find(filter)
    .populate('student', 'firstName lastName admissionNumber email phone')
    .populate('studentUser', 'name email')
    .select('-messages')
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, data: convos });
});

// ── GET /api/messages/my — student ki apni conversations ──────
const getMyConversations = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const convos = await Conversation.find({ studentUser: req.user._id })
    .select('-messages')
    .sort({ lastMessageAt: -1 });

  res.json({ success: true, data: convos });
});

// ── GET /api/messages/unread — unread count ────────────────────
const getUnreadCount = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';

  let count = 0;
  if (isAdmin) {
    const result = await Conversation.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$unreadByAdmin' } } },
    ]);
    count = result[0]?.total || 0;
  } else {
    const student = await Student.findOne({ user: req.user._id });
    if (student) {
      const result = await Conversation.aggregate([
        { $match: { studentUser: req.user._id } },
        { $group: { _id: null, total: { $sum: '$unreadByStudent' } } },
      ]);
      count = result[0]?.total || 0;
    }
  }

  res.json({ success: true, unread: count });
});

// ── GET /api/messages/:id — single conversation with messages ──
const getConversation = asyncHandler(async (req, res) => {
  const convo = await Conversation.findById(req.params.id)
    .populate('student', 'firstName lastName admissionNumber email phone')
    .populate('studentUser', 'name email');

  if (!convo) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Auth check — student can only see their own
  if (req.user.role !== 'admin' && convo.studentUser.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  res.json({ success: true, data: convo });
});

// ── POST /api/messages — student starts a new conversation ─────
const startConversation = asyncHandler(async (req, res) => {
  const { subject, text } = req.body;

  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Message text is required');
  }

  const convo = await Conversation.create({
    student: student._id,
    studentUser: req.user._id,
    subject: subject || 'General',
    messages: [
      {
        sender: 'student',
        senderUser: req.user._id,
        text: text.trim(),
        readByStudent: true,
        readByAdmin: false,
      },
    ],
    lastMessageAt: new Date(),
    unreadByAdmin: 1,
    unreadByStudent: 0,
  });

  const populated = await Conversation.findById(convo._id)
    .populate('student', 'firstName lastName admissionNumber email phone')
    .populate('studentUser', 'name email');

  res.status(201).json({ success: true, data: populated });
});

// ── POST /api/messages/:id/send — send a message in conversation
const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error('Message text is required');
  }

  const convo = await Conversation.findById(req.params.id);
  if (!convo) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Auth check
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin && convo.studentUser.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const senderType = isAdmin ? 'admin' : 'student';

  convo.messages.push({
    sender: senderType,
    senderUser: req.user._id,
    text: text.trim(),
    readByAdmin: isAdmin,
    readByStudent: !isAdmin,
  });

  convo.lastMessageAt = new Date();

  // Increment unread for the OTHER side
  if (isAdmin) {
    convo.unreadByStudent += 1;
  } else {
    convo.unreadByAdmin += 1;
  }

  await convo.save();

  const populated = await Conversation.findById(convo._id)
    .populate('student', 'firstName lastName admissionNumber email phone')
    .populate('studentUser', 'name email');

  res.json({ success: true, data: populated });
});

// ── PUT /api/messages/:id/read — mark all messages as read ─────
const markRead = asyncHandler(async (req, res) => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo) {
    res.status(404);
    throw new Error('Conversation not found');
  }

  const isAdmin = req.user.role === 'admin';

  if (isAdmin) {
    convo.messages.forEach((msg) => { msg.readByAdmin = true; });
    convo.unreadByAdmin = 0;
  } else {
    convo.messages.forEach((msg) => { msg.readByStudent = true; });
    convo.unreadByStudent = 0;
  }

  await convo.save();
  res.json({ success: true, message: 'Marked as read' });
});

// ── PUT /api/messages/:id/close — close conversation (admin) ───
const closeConversation = asyncHandler(async (req, res) => {
  const convo = await Conversation.findById(req.params.id);
  if (!convo) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  convo.status = 'closed';
  await convo.save();
  res.json({ success: true, message: 'Conversation closed' });
});

module.exports = {
  getConversations,
  getMyConversations,
  getConversation,
  startConversation,
  sendMessage,
  markRead,
  closeConversation,
  getUnreadCount,
};
