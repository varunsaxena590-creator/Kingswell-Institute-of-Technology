// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: attendanceRoutes.js                                  ║
// ║  PATH: backend/routes/attendanceRoutes.js                    ║
// ║                                                              ║
// ║  KYA HAI? → Attendance ke 6 API routes:                      ║
// ║  → POST /mark   → Mark attendance (admin)                   ║
// ║  → GET /        → List all attendance                       ║
// ║  → GET /students → Get students for marking                 ║
// ║  → GET /check   → Check if already marked                   ║
// ║  → GET /my      → Student's own attendance                   ║
// ║  → DELETE /:id  → Delete attendance record                  ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  markAttendance,
  getAllAttendance,
  getStudentsForAttendance,
  checkAttendance,
  getMyAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');

router.get('/my',      protect, getMyAttendance);
router.get('/students', protect, adminOnly, getStudentsForAttendance);
router.get('/check',   protect, adminOnly, checkAttendance);
router.get('/',        protect, adminOnly, getAllAttendance);
router.post('/',       protect, adminOnly, markAttendance);
router.delete('/:id',  protect, adminOnly, deleteAttendance);

module.exports = router;
