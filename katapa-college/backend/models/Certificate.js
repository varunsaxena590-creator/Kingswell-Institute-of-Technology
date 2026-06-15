// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Certificate.js (Model)                               ║
// ║  PATH: backend/models/Certificate.js                         ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for certificate generator.      ║
// ║  → Admin generates certificates for students.               ║
// ║  → Types: course-completion, merit, participation, etc.     ║
// ║  → Unique certificate number auto-generated.                ║
// ║  → Status: active / revoked.                                ║
// ║                                                              ║
// ║  DB COLLECTION: certificates                                 ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    certificateNo: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      enum: ['course-completion', 'merit', 'participation', 'character', 'transfer', 'bonafide', 'other'],
      default: 'course-completion',
    },
    title: {
      type: String,
      required: [true, 'Certificate title is required'],
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    issueDate: { type: Date, default: Date.now },
    validUntil: { type: Date, default: null },
    grade: { type: String, trim: true, default: '' },        // e.g. A+, Distinction
    courseName: { type: String, trim: true, default: '' },   // relevant course
    semester: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
    },
    revokedReason: { type: String, trim: true, default: '' },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-generate certificate number before save
certificateSchema.pre('validate', async function (next) {
  if (!this.certificateNo) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Certificate').countDocuments();
    const seq = String(count + 1).padStart(5, '0');
    this.certificateNo = `KIT-CERT-${year}-${seq}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
