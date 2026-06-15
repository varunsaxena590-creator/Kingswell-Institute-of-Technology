// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: examRoutes.js                                        ║
// ║  PATH: backend/routes/examRoutes.js                         ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → Online MCQ Exam system ke routes                          ║
// ║  → Admin: CRUD, stats, view submissions                      ║
// ║  → Student: my exams, start, submit, result                  ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllExams,
  getExamStats,
  createExam,
  updateExam,
  deleteExam,
  getExamById,
  getMyExams,
  startExam,
  submitExam,
  getExamResult,
} = require('../controllers/examController');

// ── Student Routes (must be BEFORE /:id to avoid conflict) ─────
router.get('/my/list',            protect, getMyExams);
router.get('/my/:id/start',      protect, startExam);
router.post('/my/:id/submit',    protect, submitExam);
router.get('/my/:id/result',     protect, getExamResult);

// ── Admin Routes ───────────────────────────────────────────────
router.get('/stats',       protect, adminOnly, getExamStats);
router.get('/',            protect, adminOnly, getAllExams);
router.post('/',           protect, adminOnly, createExam);
router.get('/:id',         protect, adminOnly, getExamById);
router.put('/:id',         protect, adminOnly, updateExam);
router.delete('/:id',      protect, adminOnly, deleteExam);

module.exports = router;
