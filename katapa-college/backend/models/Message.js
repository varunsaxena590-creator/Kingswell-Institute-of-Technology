// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Message.js (Model)                                   ║
// ║  PATH: backend/models/Message.js                             ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for chat/messaging system.       ║
// ║  → Conversation between student and admin (teacher).        ║
// ║  → Messages embedded inside conversation.                   ║
// ║  → Sender can be 'student' or 'admin'.                      ║
// ║  → Read/unread tracking for both sides.                     ║
// ║                                                              ║
// ║  DB COLLECTION: conversations                                ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

// ── Individual message sub-document ────────────────────────────
const messageSchema = new mongoose.Schema({
  sender:    { type: String, enum: ['student', 'admin'], required: true },
  senderUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text:      { type: String, required: true, trim: true },
  readByAdmin:   { type: Boolean, default: false },
  readByStudent: { type: Boolean, default: false },
  sentAt:    { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema(
  {
    // Student participant
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    studentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Subject / topic of conversation
    subject: { type: String, trim: true, default: 'General' },

    // Messages
    messages: [messageSchema],

    // Status
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },

    // Last message timestamp (for sorting)
    lastMessageAt: { type: Date, default: Date.now },

    // Unread counts
    unreadByAdmin:   { type: Number, default: 0 },
    unreadByStudent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Index for fast queries ──
conversationSchema.index({ student: 1 });
conversationSchema.index({ studentUser: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
