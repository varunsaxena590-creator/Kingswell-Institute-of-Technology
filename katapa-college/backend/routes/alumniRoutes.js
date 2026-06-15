// alumniRoutes.js
// Routes for Alumni Portal

const express = require('express');
const router = express.Router();
const {
  addAlumni,
  getAlumni,
  getAlumniById,
  updateAlumni,
  deleteAlumni,
} = require('../controllers/alumniController');

// Add new alumni
router.post('/', addAlumni);
// Get all alumni (with search/filter)
router.get('/', getAlumni);
// Get single alumni
router.get('/:id', getAlumniById);
// Update alumni
router.put('/:id', updateAlumni);
// Delete alumni
router.delete('/:id', deleteAlumni);

module.exports = router;
