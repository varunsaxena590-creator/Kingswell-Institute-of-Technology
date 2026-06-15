// mcqExamRoutes.js
// Routes for Online MCQ Exam System

const express = require('express');
const router = express.Router();
const { createExam, getActiveExams, getExamById, submitExam } = require('../controllers/mcqExamController');

// Add authentication middleware as needed
// const { protect, admin } = require('../middleware/authMiddleware');

// Create a new exam (admin only)
router.post('/', /*protect, admin,*/ createExam);
// Get all active exams
router.get('/', getActiveExams);
// Get exam by ID (for students)
router.get('/:id', getExamById);
// Submit answers for an exam
router.post('/:id/submit', submitExam);

module.exports = router;
