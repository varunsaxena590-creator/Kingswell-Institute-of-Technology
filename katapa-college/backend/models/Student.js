// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Student.js (Model)                                   ║
// ║  PATH: backend/models/Student.js                             ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for student admissions.          ║
// ║  → Personal info (name, email, phone, address).             ║
// ║  → Admission status: pending/accepted/rejected.             ║
// ║  → Course, semester, enrollment number store hota hai.      ║
// ║                                                              ║
// ║  DB COLLECTION: students                                     ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // Personal Information
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    address: { type: String, required: [true, 'Address is required'] },
    city: { type: String, required: [true, 'City is required'] },
    country: { type: String, required: [true, 'Country is required'], default: 'Kenya' },

    // Academic Information
  courseApplied: {
  type: String,
  required: [true, 'Course selection is required'],
},
    previousSchool: { type: String, trim: true },
    previousGrade: { type: String, trim: true },

    // Documents
    profilePhoto: { type: String, default: '' },

    // Application Status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'accepted', 'rejected'],
      default: 'pending',
    },
    applicationDate: { type: Date, default: Date.now },
    admissionNumber: { type: String, unique: true, sparse: true },

    // Link to user account (optional)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
