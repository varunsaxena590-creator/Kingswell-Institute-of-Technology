// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: eventRoutes.js                                       ║
// ║  PATH: backend/routes/eventRoutes.js                         ║
// ║                                                              ║
// ║  KYA HAI? → Event calendar ke 5 routes:                      ║
// ║  → GET  /     → Upcoming/ongoing events (public)            ║
// ║  → GET  /all  → All events (admin)                          ║
// ║  → POST /     → Create event (admin)                        ║
// ║  → PUT  /:id  → Update event (admin)                        ║
// ║  → DELETE /:id → Delete event (admin)                       ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getUpcomingEvents,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

router.get('/',     getUpcomingEvents);                        // public
router.get('/all',  protect, adminOnly, getAllEvents);          // admin
router.post('/',    protect, adminOnly, createEvent);           // admin
router.put('/:id',  protect, adminOnly, updateEvent);           // admin
router.delete('/:id', protect, adminOnly, deleteEvent);         // admin

module.exports = router;
