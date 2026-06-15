// alumniController.js
// Controller for Alumni Portal

const Alumni = require('../models/Alumni');
const asyncHandler = require('express-async-handler');

// Add new alumni
const addAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.create(req.body);
  res.status(201).json({ success: true, alumni });
});

// Get all alumni (with optional search)
const getAlumni = asyncHandler(async (req, res) => {
  const { search, batch, course } = req.query;
  let filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (batch) filter.batch = batch;
  if (course) filter.course = course;
  const alumni = await Alumni.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, alumni });
});

// Get single alumni by ID
const getAlumniById = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findById(req.params.id);
  if (!alumni) return res.status(404).json({ success: false, message: 'Alumni not found' });
  res.json({ success: true, alumni });
});

// Update alumni
const updateAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!alumni) return res.status(404).json({ success: false, message: 'Alumni not found' });
  res.json({ success: true, alumni });
});

// Delete alumni
const deleteAlumni = asyncHandler(async (req, res) => {
  const alumni = await Alumni.findByIdAndDelete(req.params.id);
  if (!alumni) return res.status(404).json({ success: false, message: 'Alumni not found' });
  res.json({ success: true, message: 'Alumni deleted' });
});

module.exports = {
  addAlumni,
  getAlumni,
  getAlumniById,
  updateAlumni,
  deleteAlumni,
};
