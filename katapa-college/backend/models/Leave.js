// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Leave.js (Model)                                     ║
// ║  PATH: backend/models/Leave.js                               ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for leave applications.          ║
// ║  → Student leave apply karta hai (type, dates, reason).     ║
// ║  → Admin approve/reject karta hai with optional remark.     ║
// ║  → Leave types: sick, casual, family, academic, other.      ║
// ║                                                              ║
// ║  DB COLLECTION: leaves                                       ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    // Who applied
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },

    // Leave details
    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'family', 'academic', 'other'],
      default: 'casual',
    },
    subject: { type: String, required: [true, 'Subject/title is required'], trim: true },
    reason: { type: String, required: [true, 'Reason is required'], trim: true },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate: { type: Date, required: [true, 'End date is required'] },

    // Attachments (optional — medical certificate etc.)
    attachment: { type: String, default: '' },

    // Admin response
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminRemark: { type: String, default: '', trim: true },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Virtual: total days of leave
leaveSchema.virtual('totalDays').get(function () {
  if (!this.startDate || !this.endDate) return 0;
  const diff = this.endDate.getTime() - this.startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
});

leaveSchema.set('toJSON', { virtuals: true });
leaveSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Leave', leaveSchema);
