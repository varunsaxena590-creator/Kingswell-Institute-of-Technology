// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: contactController.js                                 ║
// ║  PATH: backend/controllers/contactController.js              ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Contact form submissions handle karta hai.               ║
// ║  → Public user message bhej sakta hai (submitContact).       ║
// ║  → Admin list dekh sakta hai, status update/delete kar sakta.║
// ║                                                              ║
// ║  FUNCTIONS: submitContact, getContacts,                      ║
// ║    updateContactStatus, deleteContact                        ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');

// @desc   Submit contact form
// @route  POST /api/contacts
// @access Public
const submitContact = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const contact = await Contact.create({ ...req.body });
  res.status(201).json({
    success: true,
    message: 'Your message has been sent! We will get back to you within 24 hours.',
    data: { id: contact._id },
  });
});

// @desc   Get all contacts (admin)
// @route  GET /api/contacts
// @access Admin
const getContacts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const contacts = await Contact.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: contacts.length, data: contacts });
});

// @desc   Update contact status
// @route  PUT /api/contacts/:id
// @access Admin
const updateContactStatus = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  res.json({ success: true, data: contact });
});

// @desc   Delete contact
// @route  DELETE /api/contacts/:id
// @access Admin
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }
  res.json({ success: true, message: 'Message deleted' });
});

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

module.exports = { submitContact, getContacts, updateContactStatus, deleteContact, contactValidation };
