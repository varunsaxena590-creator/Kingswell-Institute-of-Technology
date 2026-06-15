// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Scholarship.js (Model)                               ║
// ║  PATH: backend/models/Scholarship.js                         ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for scholarship management.     ║
// ║  → Two types of documents:                                  ║
// ║    1) Scholarship (scheme) — admin creates schemes          ║
// ║    2) ScholarshipApplication — student applies               ║
// ║                                                              ║
// ║  DB COLLECTIONS: scholarships, scholarshipapplications       ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

// ── Scholarship Scheme (created by admin) ──────────────────────
const scholarshipSchema = new mongoose.Schema(
  {
    name:        { type: String, required: [true, 'Scholarship name is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['merit', 'need-based', 'sports', 'minority', 'sc-st', 'research', 'other'],
      default: 'merit',
    },
    amount:     { type: Number, required: [true, 'Amount is required'], min: 0 },
    seats:      { type: Number, default: 0 }, // 0 = unlimited
    eligibility: { type: String, trim: true, default: '' }, // criteria text
    deadline:   { type: Date, default: null },
    isActive:   { type: Boolean, default: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ── Scholarship Application (submitted by student) ─────────────
const applicationSchema = new mongoose.Schema(
  {
    scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    reason:      { type: String, trim: true, default: '' },
    documents:   { type: String, trim: true, default: '' }, // optional doc description
    cgpa:        { type: Number, default: null },
    familyIncome: { type: Number, default: null },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminRemark:  { type: String, trim: true, default: '' },
    reviewedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ scholarship: 1, student: 1 }, { unique: true });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
const ScholarshipApplication = mongoose.model('ScholarshipApplication', applicationSchema);

module.exports = { Scholarship, ScholarshipApplication };
