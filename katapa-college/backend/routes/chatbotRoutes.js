// chatbotRoutes.js
// Routes for FAQ Chatbot

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getFaqs,
  getQuickActions,
  askChatbot,
  getMyHistory,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getUnansweredQuestions,
  answerUnansweredQuestion,
  deleteAllFaqs,
} = require('../controllers/chatbotController');

const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer')
    ? req.headers.authorization.split(' ')[1]
    : null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch {
    req.user = null;
  }
  next();
};

// Get all FAQs (for suggestions)
router.get('/faqs', getFaqs);
router.get('/quick-actions', getQuickActions);
router.get('/history', protect, getMyHistory);

// Chatbot QnA endpoint
router.post('/ask', optionalAuth, askChatbot);

router.get('/admin/faqs', protect, adminOnly, getAdminFaqs);
router.post('/admin/faqs', protect, adminOnly, createFaq);
router.put('/admin/faqs/:id', protect, adminOnly, updateFaq);
router.delete('/admin/faqs/:id', protect, adminOnly, deleteFaq);
router.get('/admin/unanswered', protect, adminOnly, getUnansweredQuestions);
router.post('/admin/unanswered/:id/answer', protect, adminOnly, answerUnansweredQuestion);

// Delete all FAQs (admin action)
router.delete('/faqs', protect, adminOnly, deleteAllFaqs);

module.exports = router;
