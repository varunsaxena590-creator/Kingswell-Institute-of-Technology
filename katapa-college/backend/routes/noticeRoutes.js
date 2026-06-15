// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: noticeRoutes.js                                      ║
// ║  PATH: backend/routes/noticeRoutes.js                        ║
// ║                                                              ║
// ║  KYA HAI? → Notice board ke 5 routes:                        ║
// ║  → GET  /public  → Public notices (non-expired)             ║
// ║  → GET  /        → All notices (admin)                      ║
// ║  → POST /        → Create notice (admin)                    ║
// ║  → PUT  /:id     → Update notice (admin)                    ║
// ║  → DELETE /:id   → Delete notice (admin)                    ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router  = express.Router();
const { getNotices, getAllNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',     getNotices);                          // public
router.get('/all',  protect, adminOnly, getAllNotices);    // admin
router.post('/',    protect, adminOnly, createNotice);    // admin
router.put('/:id',  protect, adminOnly, updateNotice);    // admin
router.delete('/:id', protect, adminOnly, deleteNotice);  // admin

module.exports = router;
