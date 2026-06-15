// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Notification.js (Model)                              ║
// ║  PATH: backend/models/Notification.js                       ║
// ║                                                              ║
// ║  KYA HAI? → Notification ka database schema.                 ║
// ║  → Jab admin koi action kare (notice, result, fee, etc.)    ║
// ║    toh student ko in-app notification milta hai.             ║
// ║                                                              ║
// ║  FIELDS: user, type, title, message, data, read             ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['notice', 'result', 'fee', 'payment', 'leave', 'scholarship', 'event'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
