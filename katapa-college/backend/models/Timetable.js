// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Timetable.js (Model)                                 ║
// ║  PATH: backend/models/Timetable.js                           ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for class timetable slots.       ║
// ║  → Day (Mon-Sat), subject, teacher, room, time store hai.   ║
// ║  → Course aur semester ke basis pe link hota hai.            ║
// ║                                                              ║
// ║  DB COLLECTION: timetables                                   ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const timetableSchema = new mongoose.Schema(
  {
    day:       { type: String, required: true, enum: DAYS },
    subject:   { type: String, required: true, trim: true },
    teacher:   { type: String, required: true, trim: true },
    room:      { type: String, default: '', trim: true },
    startTime: { type: String, required: true },  // "09:00"
    endTime:   { type: String, required: true },  // "10:00"
    semester:  { type: String, required: true, trim: true },
    course:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
    type:      { type: String, enum: ['lecture', 'lab', 'tutorial', 'exam'], default: 'lecture' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Timetable', timetableSchema);
