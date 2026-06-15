// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: courseController.js                                   ║
// ║  PATH: backend/controllers/courseController.js               ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Courses ka CRUD (Create, Read, Update, Delete).          ║
// ║  → Image upload support (FormData parsing).                 ║
// ║  → Auto slug generation from course title.                  ║
// ║                                                              ║
// ║  FUNCTIONS: getCourses, getCourse, createCourse,             ║
// ║    updateCourse, deleteCourse                                ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');

const withCourseName = (course) => {
  if (!course) return course;
  const obj = course.toObject ? course.toObject() : { ...course };
  return {
    ...obj,
    name: obj.name || obj.title || '',
  };
};

// Helper: parse array fields that may arrive as JSON strings (from FormData)
const parseArr = (val) => {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return val ? [val] : []; }
};

// @desc   Get all active courses
// @route  GET /api/courses
// @access Public
const getCourses = asyncHandler(async (req, res) => {
  const { department, level, featured } = req.query;
  const filter = { isActive: true };
  if (department) filter.department = department;
  if (level) filter.level = level;
  if (featured) filter.featured = featured === 'true';

  const courses = await Course.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: courses.length, data: courses.map(withCourseName) });
});

// @desc   Get single course
// @route  GET /api/courses/:id
// @access Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, data: withCourseName(course) });
});

// @desc   Create course
// @route  POST /api/courses
// @access Admin
const createCourse = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const courseData = {
    ...req.body,
    requirements: parseArr(req.body.requirements),
    outcomes: parseArr(req.body.outcomes),
    credits: Number(req.body.credits) || 0,
    tuitionFee: Number(req.body.tuitionFee),
    featured: req.body.featured === 'true' || req.body.featured === true,
  };

  if (req.file) {
    courseData.image = `/uploads/courses/${req.file.filename}`;
  }

  const course = await Course.create(courseData);
  res.status(201).json({ success: true, message: 'Course created successfully', data: withCourseName(course) });
});

// @desc   Update course
// @route  PUT /api/courses/:id
// @access Admin
const updateCourse = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  if (req.body.requirements !== undefined) updateData.requirements = parseArr(req.body.requirements);
  if (req.body.outcomes !== undefined)     updateData.outcomes     = parseArr(req.body.outcomes);
  if (req.body.tuitionFee !== undefined)   updateData.tuitionFee   = Number(req.body.tuitionFee);
  if (req.body.credits !== undefined)      updateData.credits      = Number(req.body.credits) || 0;
  if (req.body.featured !== undefined)     updateData.featured     = req.body.featured === 'true' || req.body.featured === true;

  if (req.file) {
    // Delete old local image if exists
    const existing = await Course.findById(req.params.id);
    if (existing?.image?.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', existing.image.replace(/^\//, ''));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    updateData.image = `/uploads/courses/${req.file.filename}`;
  }

  const course = await Course.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: false,
  });
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, message: 'Course updated', data: withCourseName(course) });
});

// @desc   Delete course
// @route  DELETE /api/courses/:id
// @access Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, message: 'Course deleted successfully' });
});

const courseValidation = [
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('duration').trim().notEmpty().withMessage('Duration is required'),
  body('tuitionFee').isNumeric().withMessage('Tuition fee must be a number'),
  body('level').isIn(['Certificate', 'Diploma', 'Undergraduate', 'Postgraduate']).withMessage('Invalid level'),
];

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, courseValidation };
