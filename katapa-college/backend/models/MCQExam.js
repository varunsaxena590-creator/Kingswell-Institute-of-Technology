// MCQExam.js
// Model for Online MCQ Exam System

const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true }, // index of correct option
});

const mcqExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [mcqQuestionSchema],
  createdAt: { type: Date, default: Date.now },
  duration: { type: Number, required: true }, // in minutes
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('MCQExam', mcqExamSchema);