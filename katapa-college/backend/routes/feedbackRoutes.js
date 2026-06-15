// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: feedbackRoutes.js                                    ║
// ║  PATH: backend/routes/feedbackRoutes.js                      ║
// ║                                                              ║
// ║  KYA HAI? → Feedback system ke 5 routes:                     ║
// ║  → POST /         → Submit feedback (student)               ║
// ║  → GET  /my       → My feedback (student)                   ║
// ║  → GET  /         → All feedback (admin)                    ║
// ║  → PUT  /:id/reply → Reply to feedback (admin)              ║
// ║  → DELETE /:id    → Delete feedback (admin)                 ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  submitFeedback, getMyFeedback, getAllFeedback, replyFeedback, deleteFeedback,
} = require('../controllers/feedbackController');

router.post('/',          protect, submitFeedback);                 // student
router.get('/my',         protect, getMyFeedback);                  // student
router.get('/',           protect, adminOnly, getAllFeedback);       // admin
router.put('/:id/reply',  protect, adminOnly, replyFeedback);       // admin
router.delete('/:id',     protect, adminOnly, deleteFeedback);      // admin

module.exports = router;
