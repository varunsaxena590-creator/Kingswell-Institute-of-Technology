// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: emailRoutes.js                                       ║
// ║  PATH: backend/routes/emailRoutes.js                         ║
// ║                                                              ║
// ║  KYA HAI? → Email ke 3 admin-only routes:                    ║
// ║  → POST /broadcast    → Broadcast email to students         ║
// ║  → POST /fee-reminder → Fee payment reminder                ║
// ║  → POST /test         → Test email (config check)           ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router  = express.Router();

const { broadcastEmail, sendFeeReminder, sendTestEmail } = require('../controllers/emailController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/broadcast',    protect, adminOnly, broadcastEmail);
router.post('/fee-reminder', protect, adminOnly, sendFeeReminder);
router.post('/test',         protect, adminOnly, sendTestEmail);

module.exports = router;
