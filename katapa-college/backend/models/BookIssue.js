// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: BookIssue.js (Model)                                 ║
// ║  PATH: backend/models/BookIssue.js                           ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for book issue/return tracking.  ║
// ║  → Student ne kaunsi book li, kab li, kab return ki.        ║
// ║  → Status: issued / returned / overdue.                     ║
// ║  → Fine calculate hota hai agar late return kare.           ║
// ║                                                              ║
// ║  DB COLLECTION: bookissues                                   ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    issueDate:  { type: Date, default: Date.now },
    dueDate:    { type: Date, required: [true, 'Due date is required'] },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue'],
      default: 'issued',
    },
    fine: { type: Number, default: 0, min: 0 },
    remarks: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BookIssue', bookIssueSchema);
