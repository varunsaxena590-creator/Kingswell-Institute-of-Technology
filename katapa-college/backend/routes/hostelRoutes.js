// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: hostelRoutes.js                                      ║
// ║  PATH: backend/routes/hostelRoutes.js                        ║
// ║                                                              ║
// ║  KYA HAI? → Hostel management ke routes:                     ║
// ║  → GET /summary        → Hostel stats (admin)               ║
// ║  → GET /my             → Student's own hostel info           ║
// ║  → GET /               → All allotments (admin)             ║
// ║  → POST /              → Allot room to student              ║
// ║  → POST /:id/pay       → Record hostel fee payment          ║
// ║  → PUT /:id            → Update allotment                   ║
// ║  → DELETE /:id         → Remove allotment                   ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllHostels, getHostelSummary,
  createHostel, updateHostel, deleteHostel,
  recordPayment, getMyHostel,
} = require('../controllers/hostelController');

router.get('/summary',  protect, adminOnly, getHostelSummary);    // Admin
router.get('/my',       protect, getMyHostel);                     // Student
router.get('/',         protect, adminOnly, getAllHostels);         // Admin
router.post('/',        protect, adminOnly, createHostel);          // Admin
router.post('/:id/pay', protect, adminOnly, recordPayment);        // Admin
router.put('/:id',      protect, adminOnly, updateHostel);          // Admin
router.delete('/:id',   protect, adminOnly, deleteHostel);          // Admin

module.exports = router;
