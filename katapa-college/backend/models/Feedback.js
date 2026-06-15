// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Feedback.js (Model)                                  ║
// ║  PATH: backend/models/Feedback.js                            ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for student feedback system.    ║
// ║  → Students rate and review faculty, courses, facilities.   ║
// ║  → Category: faculty / course / facility / general.         ║
// ║  → Rating (1-5 stars) + detailed text feedback.             ║
// ║  → Anonymous option available.                              ║
// ║                                                              ║
// ║  DB COLLECTION: feedbacks                                    ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    category: {
      type: String,
      enum: ['faculty', 'course', 'facility', 'general'],
      required: [true, 'Category is required'],
    },
    subject:   { type: String, required: [true, 'Subject is required'], trim: true },
    message:   { type: String, required: [true, 'Feedback message is required'], trim: true },
    rating:    { type: Number, min: 1, max: 5, required: [true, 'Rating is required'] },
    anonymous: { type: Boolean, default: false },
    // Admin response
    adminReply:  { type: String, trim: true, default: '' },
    repliedAt:   { type: Date, default: null },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'resolved'],
      default: 'new',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
