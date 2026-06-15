// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Exam.js                                             ║
// ║  PATH: backend/models/Exam.js                              ║
// ║                                                            ║
// ║  KYA HAI YE FILE?                                          ║
// ║  → Online MCQ Exam system ka model hai                     ║
// ║  → Admin exams create karta hai with MCQ questions          ║
// ║  → Students exam dete hain, auto-grading hoti hai          ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

// ── Submission Schema (Embedded) ───────────────────────────────
const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  answers: [{
    questionIndex: { type: Number, required: true },
    selectedOption: { type: Number, default: -1 }, // -1 = unanswered
  }],
  score:       { type: Number, default: 0 },
  totalMarks:  { type: Number, default: 0 },
  percentage:  { type: Number, default: 0 },
  passed:      { type: Boolean, default: false },
  startedAt:   { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeTaken:   { type: Number, default: 0 }, // in seconds
});

// ── Question Schema (Embedded) ─────────────────────────────────
const questionSchema = new mongoose.Schema({
  questionText:  { type: String, required: true },
  options:       [{ type: String, required: true }], // 4 options
  correctOption: { type: Number, required: true },   // 0-3 index
  marks:         { type: Number, default: 1 },
});

// ── Main Exam Schema ───────────────────────────────────────────
const examSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  subject:      { type: String, required: true, trim: true },
  duration:     { type: Number, required: true }, // minutes
  totalMarks:   { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  questions:    [questionSchema],
  startTime:    { type: Date, required: true },
  endTime:      { type: Date, required: true },
  isPublished:  { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  submissions:  [submissionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
