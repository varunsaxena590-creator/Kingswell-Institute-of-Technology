// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: messageRoutes.js                                     ║
// ║  PATH: backend/routes/messageRoutes.js                       ║
// ║                                                              ║
// ║  KYA HAI? → Chat/Messaging ke routes:                        ║
// ║  → GET  /unread           → Unread count (both)             ║
// ║  → GET  /my               → Student ki conversations       ║
// ║  → GET  /                 → All conversations (admin)       ║
// ║  → GET  /:id              → Single conversation             ║
// ║  → POST /                 → Start new conversation          ║
// ║  → POST /:id/send         → Send message                   ║
// ║  → PUT  /:id/read         → Mark messages read             ║
// ║  → PUT  /:id/close        → Close conversation (admin)     ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getConversations,
  getMyConversations,
  getConversation,
  startConversation,
  sendMessage,
  markRead,
  closeConversation,
  getUnreadCount,
} = require('../controllers/messageController');

router.get('/unread',           protect, getUnreadCount);            // Both
router.get('/my',               protect, getMyConversations);        // Student
router.get('/',                 protect, adminOnly, getConversations); // Admin
router.get('/:id',              protect, getConversation);           // Both
router.post('/',                protect, startConversation);         // Student
router.post('/:id/send',       protect, sendMessage);               // Both
router.put('/:id/read',        protect, markRead);                  // Both
router.put('/:id/close',       protect, adminOnly, closeConversation); // Admin

module.exports = router;
