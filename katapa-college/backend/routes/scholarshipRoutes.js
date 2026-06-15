// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: scholarshipRoutes.js                                 ║
// ║  PATH: backend/routes/scholarshipRoutes.js                   ║
// ║                                                              ║
// ║  KYA HAI? → Scholarship management ke 9 routes:              ║
// ║  Schemes:                                                    ║
// ║  → GET  /          → Active scholarships (public)           ║
// ║  → GET  /all       → All scholarships (admin)               ║
// ║  → POST /          → Create scholarship (admin)             ║
// ║  → PUT  /:id       → Update scholarship (admin)             ║
// ║  → DELETE /:id     → Delete scholarship (admin)             ║
// ║  Applications:                                               ║
// ║  → GET  /my        → My applications (student)              ║
// ║  → GET  /applications → All applications (admin)            ║
// ║  → POST /apply     → Apply for scholarship (student)        ║
// ║  → PUT  /applications/:id/review → Review app (admin)       ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getScholarships, getAllScholarships, createScholarship, updateScholarship, deleteScholarship,
  getAllApplications, applyScholarship, reviewApplication, getMyApplications,
} = require('../controllers/scholarshipController');

// Scheme routes
router.get('/',          getScholarships);                         // public
router.get('/all',       protect, adminOnly, getAllScholarships);   // admin
router.post('/',         protect, adminOnly, createScholarship);   // admin
router.put('/:id',       protect, adminOnly, updateScholarship);   // admin
router.delete('/:id',    protect, adminOnly, deleteScholarship);   // admin

// Application routes
router.get('/my',                     protect, getMyApplications);              // student
router.get('/applications',           protect, adminOnly, getAllApplications);   // admin
router.post('/apply',                 protect, applyScholarship);               // student
router.put('/applications/:id/review', protect, adminOnly, reviewApplication);   // admin

module.exports = router;
