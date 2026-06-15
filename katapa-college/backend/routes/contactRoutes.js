// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: contactRoutes.js                                     ║
// ║  PATH: backend/routes/contactRoutes.js                       ║
// ║                                                              ║
// ║  KYA HAI? → Contact form ke 4 routes:                        ║
// ║  → POST /         → Submit enquiry (public)                 ║
// ║  → GET  /         → List all contacts (admin)               ║
// ║  → PUT  /:id      → Update status (admin)                   ║
// ║  → DELETE /:id    → Delete contact (admin)                  ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  submitContact, getContacts, updateContactStatus, deleteContact, contactValidation,
} = require('../controllers/contactController');

router.post('/', contactValidation, submitContact);          // Public
router.get('/', protect, adminOnly, getContacts);            // Admin
router.put('/:id', protect, adminOnly, updateContactStatus); // Admin
router.delete('/:id', protect, adminOnly, deleteContact);    // Admin

module.exports = router;
