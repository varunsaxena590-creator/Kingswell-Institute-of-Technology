// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Attendance.js (Model)                                ║
// ║  PATH: backend/models/Attendance.js                          ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for attendance records.          ║
// ║  → Date, subject, semester ke saath per-student records      ║
// ║    (present/absent/late) store karta hai.                    ║
// ║                                                              ║
// ║  DB COLLECTION: attendances                                  ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status:  { type: String, enum: ['present', 'absent', 'late'], default: 'absent' },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    date:     { type: Date, required: true },
    subject:  { type: String, required: true, trim: true },
    semester: { type: String, required: true, trim: true },
    records:  [recordSchema],
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// One attendance sheet per date+subject+semester
attendanceSchema.index({ date: 1, subject: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
