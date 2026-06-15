// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: resultRoutes.js                                      ║
// ║  PATH: backend/routes/resultRoutes.js                        ║
// ║                                                              ║
// ║  KYA HAI? → Student results ke 6 routes:                     ║
// ║  → GET  /my      → Student's own results                    ║
// ║  → GET  /        → All results (admin)                      ║
// ║  → POST /        → Create result (admin)                    ║
// ║  → PUT  /:id     → Update result (admin)                    ║
// ║  → PUT /:id/publish → Publish result (admin)                ║
// ║  → DELETE /:id   → Delete result (admin)                    ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router  = express.Router();
const {
  getAllResults, getMyResults, createResult,
  updateResult, publishResult, deleteResult,
} = require('../controllers/resultController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/my',         protect, getMyResults);                  // student
router.get('/',           protect, adminOnly, getAllResults);       // admin
router.post('/',          protect, adminOnly, createResult);       // admin
router.put('/:id',        protect, adminOnly, updateResult);       // admin
router.put('/:id/publish',protect, adminOnly, publishResult);      // admin
router.delete('/:id',     protect, adminOnly, deleteResult);       // admin

module.exports = router;
