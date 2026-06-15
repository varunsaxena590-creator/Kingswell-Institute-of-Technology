// Faq.js
// Model for storing FAQ questions and answers

const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Faq', faqSchema);
