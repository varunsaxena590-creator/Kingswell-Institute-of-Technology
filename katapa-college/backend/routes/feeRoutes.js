// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: feeRoutes.js                                         ║
// ║  PATH: backend/routes/feeRoutes.js                           ║
// ║                                                              ║
// ║  KYA HAI? → Fee management ke 9+ routes:                     ║
// ║  → GET /summary         → Fee summary (total/paid/pending)  ║
// ║  → GET /my              → Student's own fees                 ║
// ║  → GET /               → All fees list (admin)              ║
// ║  → POST /              → Create fee                         ║
// ║  → POST /bulk           → Bulk create fees                  ║
// ║  → POST /:id/payment    → Record payment                   ║
// ║  → PUT/DELETE /:id      → Update/Delete fee                 ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllFees, getStudentFees, getFeeSummary,
  createFee, recordPayment, updateFee, deleteFee,
  bulkCreateFees, getMyFees,
} = require('../controllers/feeController');

router.get('/summary',           protect, adminOnly, getFeeSummary);       // Admin
router.get('/my',                protect, getMyFees);                       // Student
router.get('/',                  protect, adminOnly, getAllFees);            // Admin
router.get('/student/:studentId',protect, adminOnly, getStudentFees);       // Admin
router.post('/bulk',             protect, adminOnly, bulkCreateFees);        // Admin
router.post('/',                 protect, adminOnly, createFee);             // Admin
router.post('/:id/pay',          protect, adminOnly, recordPayment);         // Admin
router.put('/:id',               protect, adminOnly, updateFee);             // Admin
router.delete('/:id',            protect, adminOnly, deleteFee);             // Admin

module.exports = router;
