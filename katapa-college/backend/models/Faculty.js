// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Faculty.js (Model)                                   ║
// ║  PATH: backend/models/Faculty.js                             ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for faculty members.             ║
// ║  → Name, title, department, education, bio, photo, email.   ║
// ║  → isActive flag se active/inactive filter hota hai.        ║
// ║                                                              ║
// ║  DB COLLECTION: faculties                                    ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    title:    { type: String, required: true, trim: true },
    dept:     { type: String, required: true, trim: true },
    edu:      { type: String, default: '' },
    bio:      { type: String, default: '' },
    initials: { type: String, default: '' },
    photo:    { type: String, default: '' },
    email:    { type: String, default: '' },
    linkedin: { type: String, default: '' },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);
