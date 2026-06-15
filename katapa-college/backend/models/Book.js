// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Book.js (Model)                                      ║
// ║  PATH: backend/models/Book.js                                ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for library books.               ║
// ║  → Book ka title, author, ISBN, category, quantity store.   ║
// ║  → availableCopies track karta hai kitni copies free hain.  ║
// ║  → Admin books add/edit/delete karta hai.                   ║
// ║                                                              ║
// ║  DB COLLECTION: books                                        ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title:    { type: String, required: [true, 'Book title is required'], trim: true },
    author:   { type: String, required: [true, 'Author is required'], trim: true },
    isbn:     { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['textbook', 'reference', 'fiction', 'non-fiction', 'journal', 'magazine', 'other'],
      default: 'textbook',
    },
    publisher:   { type: String, trim: true, default: '' },
    publishYear: { type: Number },
    description: { type: String, trim: true, default: '' },
    totalCopies:     { type: Number, required: true, default: 1, min: 0 },
    availableCopies: { type: Number, required: true, default: 1, min: 0 },
    shelfLocation:   { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
