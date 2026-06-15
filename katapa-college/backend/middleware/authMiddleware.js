// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: authMiddleware.js                                    ║
// ║  PATH: backend/middleware/authMiddleware.js                  ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → JWT token verify karta hai (login check).                ║
// ║  → protect() → koi bhi logged-in user access kar sake.      ║
// ║  → adminOnly() → sirf admin access kar sake.                ║
// ║  → Routes mein middleware ke taur pe use hota hai.           ║
// ║                                                              ║
// ║  EXPORTS: protect, adminOnly                                 ║
// ╚══════════════════════════════════════════════════════════════╝
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes — verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.isActive) {
      res.status(401);
      throw new Error('Not authorized, user not found or inactive');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token verification failed');
  }
});

// Admin-only guard
const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Access denied — admin privileges required');
};

module.exports = { protect, adminOnly };
