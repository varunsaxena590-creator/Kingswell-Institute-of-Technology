// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: authRoutes.js                                        ║
// ║  PATH: backend/routes/authRoutes.js                          ║
// ║                                                              ║
// ║  KYA HAI? → Authentication ke 4 API routes:                  ║
// ║  → POST /register → New user signup                        ║
// ║  → POST /login    → Login + JWT token                      ║
// ║  → GET  /me       → Current user profile                   ║
// ║  → PUT  /profile  → Update profile                         ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  register, login, getMe, updateProfile,
  registerValidation, loginValidation,
} = require('../controllers/authController');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
