// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Contact.js (Model)                                   ║
// ║  PATH: backend/models/Contact.js                             ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for contact enquiries.           ║
// ║  → Name, email, phone, subject, message fields hain.        ║
// ║  → Status: unread/read/replied                              ║
// ║                                                              ║
// ║  DB COLLECTION: contacts                                     ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: { type: String, trim: true },
    subject: { type: String, required: [true, 'Subject is required'], trim: true },
    message: { type: String, required: [true, 'Message is required'], maxlength: 1000 },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
    reply: { type: String, default: '' },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', contactSchema);
