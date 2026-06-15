// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Notice.js (Model)                                    ║
// ║  PATH: backend/models/Notice.js                              ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for notice board.                ║
// ║  → Title, message, category (general/exam/holiday/urgent).  ║
// ║  → Pinned flag aur expiry date support hai.                 ║
// ║                                                              ║
// ║  DB COLLECTION: notices                                      ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title:    { type: String, required: [true, 'Title is required'], trim: true },
    message:  { type: String, required: [true, 'Message is required'], trim: true },
    category: {
      type: String,
      enum: ['general', 'exam', 'holiday', 'urgent', 'event'],
      default: 'general',
    },
    pinned:   { type: Boolean, default: false },
    expiresAt: { type: Date, default: null }, // null = no expiry
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notice', noticeSchema);
