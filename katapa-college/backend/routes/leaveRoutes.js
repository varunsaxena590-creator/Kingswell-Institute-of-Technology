// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: leaveRoutes.js                                       ║
// ║  PATH: backend/routes/leaveRoutes.js                         ║
// ║                                                              ║
// ║  KYA HAI? → Leave Application ke 5 routes:                   ║
// ║  → POST /my          → Student leave apply karta hai        ║
// ║  → GET  /my          → Student ki apni leaves               ║
// ║  → GET  /            → All leaves (admin)                   ║
// ║  → PUT  /:id/review  → Approve/Reject leave (admin)        ║
// ║  → DELETE /:id       → Delete leave (admin / student own)   ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  deleteLeave,
} = require('../controllers/leaveController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/my',            protect, applyLeave);                    // student apply
router.get('/my',             protect, getMyLeaves);                   // student list
router.get('/',               protect, adminOnly, getAllLeaves);        // admin list
router.put('/:id/review',    protect, adminOnly, reviewLeave);         // admin approve/reject
router.delete('/:id',        protect, deleteLeave);                    // admin or student own pending

module.exports = router;
