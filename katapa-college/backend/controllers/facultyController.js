// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: facultyController.js                                 ║
// ║  PATH: backend/controllers/facultyController.js              ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Faculty members ka CRUD handle karta hai.                ║
// ║  → Photo upload support hai (multer disk storage).          ║
// ║  → Active/inactive status filter karta hai.                 ║
// ║                                                              ║
// ║  FUNCTIONS: getFaculty, createFaculty,                       ║
// ║    updateFaculty, deleteFaculty                              ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Faculty = require('../models/Faculty');

// @desc   Get all active faculty
// @route  GET /api/faculty
// @access Public
const getFaculty = asyncHandler(async (req, res) => {
  const members = await Faculty.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, count: members.length, data: members });
});

// @desc   Create faculty member
// @route  POST /api/faculty
// @access Admin
const createFaculty = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (!body.name || !body.title || !body.dept) {
    res.status(400);
    throw new Error('Name, title and department are required');
  }
  if (!body.initials && body.name) {
    body.initials = body.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }
  if (req.file) body.photo = `/uploads/faculty/${req.file.filename}`;

  const member = await Faculty.create(body);
  res.status(201).json({ success: true, message: 'Faculty member added', data: member });
});

// @desc   Update faculty member
// @route  PUT /api/faculty/:id
// @access Admin
const updateFaculty = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  if (req.file) {
    const existing = await Faculty.findById(req.params.id);
    if (existing?.photo?.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', existing.photo.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    updateData.photo = `/uploads/faculty/${req.file.filename}`;
  }

  const member = await Faculty.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!member) {
    res.status(404);
    throw new Error('Faculty member not found');
  }
  res.json({ success: true, message: 'Faculty member updated', data: member });
});

// @desc   Delete faculty member
// @route  DELETE /api/faculty/:id
// @access Admin
const deleteFaculty = asyncHandler(async (req, res) => {
  const member = await Faculty.findById(req.params.id);
  if (!member) {
    res.status(404);
    throw new Error('Faculty member not found');
  }
  if (member.photo?.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', member.photo.replace(/^\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await Faculty.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Faculty member deleted' });
});

module.exports = { getFaculty, createFaculty, updateFaculty, deleteFaculty };
