// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: courseRoutes.js                                      ║
// ║  PATH: backend/routes/courseRoutes.js                        ║
// ║                                                              ║
// ║  KYA HAI? → Course CRUD ke 5 routes (image upload sahit):    ║
// ║  → GET    /       → List all courses (public)               ║
// ║  → GET    /:id    → Single course detail                    ║
// ║  → POST   /       → Create course (admin + image)           ║
// ║  → PUT    /:id    → Update course (admin + image)           ║
// ║  → DELETE /:id    → Delete course (admin)                   ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse, courseValidation,
} = require('../controllers/courseController');
const { uploadCourse } = require('../config/cloudinary');

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', protect, adminOnly, uploadCourse.single('image'), courseValidation, createCourse);
router.put('/:id', protect, adminOnly, uploadCourse.single('image'), updateCourse);
router.delete('/:id', protect, adminOnly, deleteCourse);

module.exports = router;
