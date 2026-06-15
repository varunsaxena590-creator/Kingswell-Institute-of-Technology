// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: analyticsRoutes.js                                   ║
// ║  PATH: backend/routes/analyticsRoutes.js                     ║
// ║                                                              ║
// ║  KYA HAI? → Analytics ke API routes define karta hai.        ║
// ║  → GET /dashboard → Admin dashboard ka analytics data.      ║
// ║  → Admin-only protected route hai.                          ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router  = express.Router();
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly }    = require('../middleware/authMiddleware');

router.get('/dashboard', protect, adminOnly, getDashboardAnalytics);

module.exports = router;
