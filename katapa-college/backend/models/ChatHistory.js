const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    matched: { type: String, default: null },
    link: { type: String, default: '' },
    linkLabel: { type: String, default: '' },
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
