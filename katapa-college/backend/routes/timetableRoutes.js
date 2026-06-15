// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: timetableRoutes.js                                   ║
// ║  PATH: backend/routes/timetableRoutes.js                     ║
// ║                                                              ║
// ║  KYA HAI? → Timetable ke 5 routes:                           ║
// ║  → GET  /my      → Student's personal timetable             ║
// ║  → GET  /        → Filtered timetable (public)              ║
// ║  → POST /        → Create slot (admin)                      ║
// ║  → PUT  /:id     → Update slot (admin)                      ║
// ║  → DELETE /:id   → Delete slot (admin)                      ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getTimetable, getMyTimetable, createSlot, updateSlot, deleteSlot } = require('../controllers/timetableController');

router.get('/my',   protect, getMyTimetable);          // Student — their timetable
router.get('/',     getTimetable);                      // Public — with filters
router.post('/',    protect, adminOnly, createSlot);    // Admin
router.put('/:id',  protect, adminOnly, updateSlot);    // Admin
router.delete('/:id', protect, adminOnly, deleteSlot);  // Admin

module.exports = router;
