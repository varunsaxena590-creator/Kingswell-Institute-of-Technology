// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: notificationRoutes.js                                ║
// ║  PATH: backend/routes/notificationRoutes.js                 ║
// ║                                                              ║
// ║  KYA HAI? → Notification API ke routes.                      ║
// ║  → Saare routes protected hain (logged in user only).       ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

router.get('/',             protect, getMyNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read-all',     protect, markAllAsRead);
router.put('/:id/read',     protect, markAsRead);
router.delete('/:id',       protect, deleteNotification);

module.exports = router;
