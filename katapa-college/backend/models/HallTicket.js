// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: HallTicket.js (Model)                                ║
// ║  PATH: backend/models/HallTicket.js                         ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for exam hall tickets.           ║
// ║  → Admin exam create karta hai (name, date, time, venue).   ║
// ║  → Students ko seat number assign hota hai.                 ║
// ║  → Student apna hall ticket download kar sakta hai.          ║
// ║                                                              ║
// ║  DB COLLECTION: halltickets                                  ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

// Individual student seat assignment inside an exam
const seatSchema = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  seatNumber: { type: String, required: true, trim: true },
}, { _id: false });

const hallTicketSchema = new mongoose.Schema(
  {
    // Exam details
    examName:    { type: String, required: [true, 'Exam name is required'], trim: true },
    examType:    { type: String, enum: ['midterm', 'final', 'supplementary', 'practical'], default: 'final' },
    semester:    { type: String, required: [true, 'Semester is required'], trim: true },
    course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: [true, 'Course is required'] },

    // Schedule
    startDate:   { type: Date, required: [true, 'Start date is required'] },
    endDate:     { type: Date, required: [true, 'End date is required'] },
    reportTime:  { type: String, default: '09:00 AM', trim: true },

    // Venue
    venue:       { type: String, required: [true, 'Venue is required'], trim: true },

    // Subjects in exam
    subjects:    [{ type: String, trim: true }],

    // Instructions for students
    instructions: { type: String, default: 'Bring your student ID card. No electronic devices allowed.' },

    // Seat assignments
    seats:       [seatSchema],

    // Status
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HallTicket', hallTicketSchema);
