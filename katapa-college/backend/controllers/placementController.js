// placementController.js
// Controller for Placement Cell features

const { Job, CompanyVisit, PlacementStats } = require('../models/Placement');
const asyncHandler = require('express-async-handler');

// ── JOB LISTINGS ─────────────────────────────────────────────
// Create a new job
const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create(req.body);
  res.status(201).json({ success: true, job });
});
// Get all jobs
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().sort({ postedAt: -1 });
  res.json({ success: true, jobs });
});
// Delete a job
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, message: 'Job deleted' });
});

// ── COMPANY VISITS ───────────────────────────────────────────
// Add a company visit
const addCompanyVisit = asyncHandler(async (req, res) => {
  const visit = await CompanyVisit.create(req.body);
  res.status(201).json({ success: true, visit });
});
// Get all company visits
const getCompanyVisits = asyncHandler(async (req, res) => {
  const visits = await CompanyVisit.find().sort({ visitDate: -1 });
  res.json({ success: true, visits });
});

// ── PLACEMENT STATS ──────────────────────────────────────────
// Add/update stats for a year
const upsertStats = asyncHandler(async (req, res) => {
  const { year } = req.body;
  const stats = await PlacementStats.findOneAndUpdate(
    { year },
    req.body,
    { upsert: true, new: true }
  );
  res.json({ success: true, stats });
});
// Get stats (all years)
const getStats = asyncHandler(async (req, res) => {
  const stats = await PlacementStats.find().sort({ year: -1 });
  res.json({ success: true, stats });
});

module.exports = {
  createJob,
  getJobs,
  deleteJob,
  addCompanyVisit,
  getCompanyVisits,
  upsertStats,
  getStats,
};
