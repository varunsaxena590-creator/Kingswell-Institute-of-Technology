// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: authController.js                                    ║
// ║  PATH: backend/controllers/authController.js                 ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → User registration (signup) handle karta hai.             ║
// ║  → Login pe JWT token generate karta hai.                   ║
// ║  → Logged-in user ki profile fetch/update karta hai.        ║
// ║  → express-validator se input validation karta hai.         ║
// ║                                                              ║
// ║  FUNCTIONS: register, login, getMe, updateProfile            ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// @desc   Register new user
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({ name: name.trim(), email: normalizedEmail, password });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact support.');
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    },
  });
});

// @desc   Get current user profile
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc   Update profile
// @route  PUT /api/auth/profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.avatar = req.body.avatar || user.avatar;
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  res.json({
    success: true,
    message: 'Profile updated',
    data: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar,
      token: generateToken(updated._id),
    },
  });
});

// Validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { register, login, getMe, updateProfile, registerValidation, loginValidation };
