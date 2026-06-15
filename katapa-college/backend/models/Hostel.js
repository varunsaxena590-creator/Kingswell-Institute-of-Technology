// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Hostel.js (Model)                                    ║
// ║  PATH: backend/models/Hostel.js                              ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for hostel management.           ║
// ║  → Room allotment track karta hai (room number, block, etc) ║
// ║  → Hostel fees aur payment status bhi manage karta hai.     ║
// ║  → Embedded payment transactions hain (like Fee model).     ║
// ║                                                              ║
// ║  DB COLLECTION: hostels                                      ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

// ── Payment transaction sub-document ───────────────────────────
const paymentSchema = new mongoose.Schema({
  amount:     { type: Number, required: true },
  method:     { type: String, enum: ['cash', 'bank_transfer', 'mpesa', 'cheque'], required: true },
  reference:  { type: String, trim: true, default: '' },
  note:       { type: String, trim: true, default: '' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt:     { type: Date, default: Date.now },
});

const hostelSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    // ── Room Details ──
    block:      { type: String, required: true, trim: true },          // e.g. "Block A", "Boys Hostel 1"
    roomNumber: { type: String, required: true, trim: true },          // e.g. "A-101"
    roomType:   { type: String, enum: ['single', 'double', 'triple', 'dormitory'], default: 'double' },
    floor:      { type: Number, default: 0, min: 0 },

    // ── Allotment Period ──
    academicYear: { type: String, required: true, trim: true },        // e.g. "2025-26"
    checkIn:      { type: Date },
    checkOut:     { type: Date },
    status:       { type: String, enum: ['allotted', 'checked-in', 'checked-out', 'cancelled'], default: 'allotted' },

    // ── Hostel Fee ──
    totalFee:     { type: Number, required: true, min: 0 },
    payments:     [paymentSchema],
    feeStatus:    { type: String, enum: ['unpaid', 'partial', 'paid', 'waived'], default: 'unpaid' },
    waiverAmount: { type: Number, default: 0, min: 0 },
    waiverReason: { type: String, trim: true, default: '' },

    // ── Extra Info ──
    remarks:      { type: String, trim: true, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ── Virtual: total paid ──
hostelSchema.virtual('amountPaid').get(function () {
  return this.payments.reduce((sum, p) => sum + p.amount, 0);
});

// ── Virtual: balance remaining ──
hostelSchema.virtual('balance').get(function () {
  const effective = this.totalFee - (this.waiverAmount || 0);
  return Math.max(0, effective - this.amountPaid);
});

// ── Auto-update feeStatus before save ──
hostelSchema.pre('save', function (next) {
  if (this.feeStatus === 'waived') return next();
  const effective = this.totalFee - (this.waiverAmount || 0);
  const paid = this.payments.reduce((sum, p) => sum + p.amount, 0);
  if (paid <= 0)            this.feeStatus = 'unpaid';
  else if (paid < effective) this.feeStatus = 'partial';
  else                      this.feeStatus = 'paid';
  next();
});

module.exports = mongoose.model('Hostel', hostelSchema);
