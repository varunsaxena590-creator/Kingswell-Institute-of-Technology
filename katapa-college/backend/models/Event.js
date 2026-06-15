// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Event.js (Model)                                     ║
// ║  PATH: backend/models/Event.js                               ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for college events/calendar.    ║
// ║  → Title, description, date/time, venue, category.          ║
// ║  → Featured flag for important events.                      ║
// ║  → Status: upcoming / ongoing / completed / cancelled.      ║
// ║                                                              ║
// ║  DB COLLECTION: events                                       ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title:       { type: String, required: [true, 'Event title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['academic', 'cultural', 'sports', 'seminar', 'workshop', 'holiday', 'exam', 'other'],
      default: 'academic',
    },
    startDate: { type: Date, required: [true, 'Start date is required'] },
    endDate:   { type: Date, default: null }, // null = single-day event
    startTime: { type: String, default: '' }, // e.g. "09:00 AM"
    endTime:   { type: String, default: '' },
    venue:     { type: String, trim: true, default: '' },
    organizer: { type: String, trim: true, default: '' },
    featured:  { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
