// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: studentRoutes.js                                     ║
// ║  PATH: backend/routes/studentRoutes.js                       ║
// ║                                                              ║
// ║  KYA HAI? → Student ke 6 routes:                             ║
// ║  → POST /apply        → Admission apply (public)            ║
// ║  → GET  /my-profile   → Student's own profile               ║
// ║  → PUT  /my-profile   → Update own profile                  ║
// ║  → GET  /             → All students (admin)                ║
// ║  → GET  /:id          → Student detail (admin)              ║
// ║  → PUT  /:id/status   → Accept/reject (admin)               ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  applyAdmission, getStudents, getStudent, updateStudentStatus, admissionValidation, getMyProfile, updateMyProfile,
} = require('../controllers/studentController');

router.post('/apply', admissionValidation, applyAdmission);   // Public
router.get('/my-profile', protect, getMyProfile);             // Student
router.put('/my-profile', protect, updateMyProfile);          // Student
router.get('/', protect, adminOnly, getStudents);              // Admin
router.get('/:id', protect, adminOnly, getStudent);            // Admin
router.put('/:id', protect, adminOnly, updateStudentStatus);   // Admin

module.exports = router;
