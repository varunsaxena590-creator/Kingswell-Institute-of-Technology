// placementRoutes.js
// Routes for Placement Cell features

const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  deleteJob,
  addCompanyVisit,
  getCompanyVisits,
  upsertStats,
  getStats,
} = require('../controllers/placementController');

// Job listings
router.post('/jobs', createJob); // Add job
router.get('/jobs', getJobs);    // List jobs
router.delete('/jobs/:id', deleteJob); // Delete job

// Company visits
router.post('/company-visits', addCompanyVisit);
router.get('/company-visits', getCompanyVisits);

// Placement stats
router.post('/stats', upsertStats); // Add/update stats
router.get('/stats', getStats);     // Get stats

module.exports = router;
