// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: hallTicketRoutes.js                                  ║
// ║  PATH: backend/routes/hallTicketRoutes.js                    ║
// ║                                                              ║
// ║  KYA HAI? → Exam Hall Ticket ke 8 routes:                   ║
// ║  → GET  /my              → Student ke apne hall tickets     ║
// ║  → GET  /                → All hall tickets (admin)         ║
// ║  → POST /                → Create hall ticket (admin)       ║
// ║  → PUT  /:id             → Update hall ticket (admin)       ║
// ║  → PUT  /:id/seats       → Assign seats manually (admin)   ║
// ║  → PUT  /:id/auto-seats  → Auto-assign seats (admin)       ║
// ║  → PUT  /:id/publish     → Toggle publish (admin)          ║
// ║  → DELETE /:id           → Delete hall ticket (admin)       ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const {
  getAllHallTickets,
  createHallTicket,
  updateHallTicket,
  deleteHallTicket,
  assignSeats,
  autoAssignSeats,
  togglePublish,
  getMyHallTickets,
} = require('../controllers/hallTicketController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/my',              protect, getMyHallTickets);                 // student
router.get('/',                protect, adminOnly, getAllHallTickets);      // admin
router.post('/',               protect, adminOnly, createHallTicket);      // admin
router.put('/:id',             protect, adminOnly, updateHallTicket);      // admin
router.put('/:id/seats',       protect, adminOnly, assignSeats);           // admin
router.put('/:id/auto-seats',  protect, adminOnly, autoAssignSeats);       // admin
router.put('/:id/publish',     protect, adminOnly, togglePublish);         // admin
router.delete('/:id',          protect, adminOnly, deleteHallTicket);      // admin

module.exports = router;
