// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Fee.js (Model)                                       ║
// ║  PATH: backend/models/Fee.js                                 ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for student fees.                ║
// ║  → Fee amount, due date, payment status track karta hai.    ║
// ║  → Embedded transactions sub-documents hain (payments).     ║
// ║  → Payment method, reference number, date store hota hai.   ║
// ║                                                              ║
// ║  DB COLLECTION: fees                                         ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

// Individual payment transaction
const transactionSchema = new mongoose.Schema({
  amount:      { type: Number, required: true },
  method:      { type: String, enum: ['cash', 'bank_transfer', 'mpesa', 'cheque'], required: true },
  reference:   { type: String, trim: true, default: '' },
  note:        { type: String, trim: true, default: '' },
  recordedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt:      { type: Date, default: Date.now },
});

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    // Fee structure
    feeType:     { type: String, enum: ['tuition', 'exam', 'library', 'hostel', 'lab', 'other'], default: 'tuition' },
    semester:    { type: String, required: true, trim: true },   // e.g. "Semester 1 — 2025"
    totalAmount: { type: Number, required: true, min: 0 },
    dueDate:     { type: Date, required: true },

    // Payment tracking
    transactions: [transactionSchema],

    // Computed / managed fields
    status: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'waived'],
      default: 'unpaid',
    },

    // Waiver / scholarship discount
    waiverAmount:  { type: Number, default: 0, min: 0 },
    waiverReason:  { type: String, trim: true, default: '' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ── Virtual: total paid from transactions ──
feeSchema.virtual('amountPaid').get(function () {
  return this.transactions.reduce((sum, t) => sum + t.amount, 0);
});

// ── Virtual: balance remaining ──
feeSchema.virtual('balance').get(function () {
  const effective = this.totalAmount - (this.waiverAmount || 0);
  return Math.max(0, effective - this.amountPaid);
});

// ── Auto-update status before save ──
feeSchema.pre('save', function (next) {
  if (this.status === 'waived') return next();
  const effective = this.totalAmount - (this.waiverAmount || 0);
  const paid = this.transactions.reduce((sum, t) => sum + t.amount, 0);
  if (paid <= 0)          this.status = 'unpaid';
  else if (paid < effective) this.status = 'partial';
  else                    this.status = 'paid';
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
