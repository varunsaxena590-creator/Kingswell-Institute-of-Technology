// mcqExamController.js
// Controller for Online MCQ Exam System

const MCQExam = require('../models/MCQExam');
const asyncHandler = require('express-async-handler');

// Create a new MCQ Exam
const createExam = asyncHandler(async (req, res) => {
  const { title, description, questions, duration } = req.body;
  if (!title || !questions || !duration) {
    res.status(400);
    throw new Error('Title, questions, and duration are required');
  }
  const exam = await MCQExam.create({ title, description, questions, duration });
  res.status(201).json({ success: true, exam });
});

// Get all active exams
const getActiveExams = asyncHandler(async (req, res) => {
  const exams = await MCQExam.find({ isActive: true });
  res.json({ success: true, exams });
});

// Get exam by ID (without answers)
const getExamById = asyncHandler(async (req, res) => {
  const exam = await MCQExam.findById(req.params.id);
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }
  // Remove correct answers before sending to student
  const questions = exam.questions.map(q => ({
    question: q.question,
    options: q.options
  }));
  res.json({ success: true, exam: { _id: exam._id, title: exam.title, description: exam.description, duration: exam.duration, questions } });
});

// Submit exam answers and get result
const submitExam = asyncHandler(async (req, res) => {
  const { answers } = req.body; // array of selected option indices
  const exam = await MCQExam.findById(req.params.id);
  if (!exam) {
    res.status(404);
    throw new Error('Exam not found');
  }
  if (!answers || !Array.isArray(answers) || answers.length !== exam.questions.length) {
    res.status(400);
    throw new Error('Invalid answers');
  }
  let score = 0;
  exam.questions.forEach((q, i) => {
    if (answers[i] === q.correctOption) score++;
  });
  res.json({ success: true, total: exam.questions.length, score });
});

module.exports = { createExam, getActiveExams, getExamById, submitExam };