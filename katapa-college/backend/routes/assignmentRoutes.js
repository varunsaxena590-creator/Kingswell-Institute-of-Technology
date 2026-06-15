// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: assignmentRoutes.js                                  ║
// ║  PATH: backend/routes/assignmentRoutes.js                    ║
// ║                                                              ║
// ║  KYA HAI? → Assignment/Homework ke routes:                   ║
// ║  → GET  /stats              → Stats (admin)                 ║
// ║  → GET  /my                 → Student ke assignments        ║
// ║  → GET  /                   → All assignments (admin)       ║
// ║  → POST /                   → Create assignment (admin)     ║
// ║  → POST /:id/submit         → Student submit karta hai     ║
// ║  → PUT  /:id/grade/:subId   → Grade submission (admin)     ║
// ║  → PUT  /:id                → Update assignment (admin)     ║
// ║  → DELETE /:id              → Delete assignment (admin)     ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllAssignments,
  getAssignmentStats,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getMyAssignments,
} = require('../controllers/assignmentController');

router.get('/stats',                    protect, adminOnly, getAssignmentStats);    // Admin
router.get('/my',                       protect, getMyAssignments);                  // Student
router.get('/',                         protect, adminOnly, getAllAssignments);       // Admin
router.post('/',                        protect, adminOnly, createAssignment);        // Admin
router.post('/:id/submit',             protect, submitAssignment);                   // Student
router.put('/:id/grade/:submissionId', protect, adminOnly, gradeSubmission);         // Admin
router.put('/:id',                     protect, adminOnly, updateAssignment);         // Admin
router.delete('/:id',                  protect, adminOnly, deleteAssignment);         // Admin

module.exports = router;
