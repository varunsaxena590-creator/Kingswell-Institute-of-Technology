// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Assignment.js (Model)                                ║
// ║  PATH: backend/models/Assignment.js                          ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for assignments/homework.        ║
// ║  → Teacher/Admin assignment create karta hai                ║
// ║    (title, description, course, dueDate, marks).            ║
// ║  → Students submit karte hain — submissions embedded hain.  ║
// ║  → Admin grade karta hai (marks, feedback).                 ║
// ║                                                              ║
// ║  DB COLLECTION: assignments                                  ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

// ── Student submission sub-document ────────────────────────────
const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  content:     { type: String, trim: true, default: '' },         // text answer / notes
  fileUrl:     { type: String, trim: true, default: '' },         // uploaded file link (future)
  submittedAt: { type: Date, default: Date.now },

  // Grading (by admin/teacher)
  marks:       { type: Number, default: null },
  feedback:    { type: String, trim: true, default: '' },
  gradedAt:    { type: Date },
  status:      { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
});

const assignmentSchema = new mongoose.Schema(
  {
    // Assignment info
    title:       { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    subject:     { type: String, trim: true, default: '' },       // optional subject name

    // Dates & marks
    assignedDate: { type: Date, default: Date.now },
    dueDate:      { type: Date, required: [true, 'Due date is required'] },
    totalMarks:   { type: Number, required: true, min: 1, default: 100 },

    // Assignment type
    type: {
      type: String,
      enum: ['homework', 'assignment', 'project', 'lab', 'quiz'],
      default: 'assignment',
    },

    // Status
    isActive: { type: Boolean, default: true },

    // Student submissions
    submissions: [submissionSchema],

    // Created by (admin / teacher)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ── Virtual: submission count ──
assignmentSchema.virtual('submissionCount').get(function () {
  return this.submissions ? this.submissions.length : 0;
});

// ── Virtual: graded count ──
assignmentSchema.virtual('gradedCount').get(function () {
  return this.submissions ? this.submissions.filter(s => s.status === 'graded').length : 0;
});

// ── Virtual: is past due ──
assignmentSchema.virtual('isPastDue').get(function () {
  return new Date() > this.dueDate;
});

module.exports = mongoose.model('Assignment', assignmentSchema);
