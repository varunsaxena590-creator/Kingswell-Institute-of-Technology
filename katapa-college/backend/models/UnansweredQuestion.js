const mongoose = require('mongoose');

const unansweredQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    language: { type: String, enum: ['en', 'hi'], default: 'en' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['open', 'answered', 'ignored'], default: 'open', index: true },
    answer: { type: String, default: '' },
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    answeredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UnansweredQuestion', unansweredQuestionSchema);
