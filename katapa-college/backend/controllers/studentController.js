// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: studentController.js                                 ║
// ║  PATH: backend/controllers/studentController.js              ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Student admission application handle karta hai (public). ║
// ║  → Admin students list dekh sakta, accept/reject kar sakta.  ║
// ║  → Accept/reject pe student ko email jaata hai.             ║
// ║  → Student apni profile dekh aur update kar sakta hai.      ║
// ║                                                              ║
// ║  FUNCTIONS: applyAdmission, getStudents, getStudent,        ║
// ║    updateStudentStatus, getMyProfile, updateMyProfile        ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Fee     = require('../models/Fee');
const Course  = require('../models/Course');
const emailService = require('../utils/emailService');

// @desc   Submit admission application
// @route  POST /api/students/apply
// @access Public
const applyAdmission = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array().map((e) => e.msg).join(', '));
  }

  const student = await Student.create({ ...req.body });

  // Fire-and-forget: notify applicant about application received
  const course = await Course.findById(student.courseApplied).select('title').catch(() => null);
  emailService.sendApplicationReceived({
    email:        student.email,
    firstName:    student.firstName,
    lastName:     student.lastName,
    courseTitle:  course?.title || 'Selected Course',
    applicationId: student._id.toString().slice(-8).toUpperCase(),
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Your admission application has been submitted successfully! We will contact you shortly.',
    data: { applicationId: student._id, name: `${student.firstName} ${student.lastName}` },
  });
});

// @desc   Get all students (admin)
// @route  GET /api/students
// @access Admin
const getStudents = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const students = await Student.find(filter)
    .populate('courseApplied', 'title level department')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Student.countDocuments(filter);
  res.json({ success: true, count, pages: Math.ceil(count / limit), data: students });
});

// @desc   Get single student
// @route  GET /api/students/:id
// @access Admin
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('courseApplied', 'title level department');
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.json({ success: true, data: student });
});

// @desc   Update student status
// @route  PUT /api/students/:id
// @access Admin
const updateStudentStatus = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('courseApplied', 'title tuitionFee');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  student.status = req.body.status;

  // ── Auto-generate sequential Admission Number on acceptance ──
  if (req.body.status === 'accepted' && !student.admissionNumber) {
    const year = new Date().getFullYear();
    const countAccepted = await Student.countDocuments({ admissionNumber: { $exists: true, $ne: null } });
    const serial = String(countAccepted + 1).padStart(3, '0');
    student.admissionNumber = `ADM-${year}-${serial}`;
  }

  await student.save();

  // ── Auto-create tuition fee when student is accepted ──────────
  if (req.body.status === 'accepted') {
    const year = new Date().getFullYear();
    const semester = `Semester 1 — ${year}`;

    const alreadyExists = await Fee.findOne({
      student:  student._id,
      feeType:  'tuition',
      semester,
    });

    if (!alreadyExists) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 3);
      const amount = student.courseApplied?.tuitionFee || 50000;
      await Fee.create({
        student:     student._id,
        feeType:     'tuition',
        semester,
        totalAmount: amount,
        dueDate,
      });
    }
  }

  // Fire-and-forget: notify student of admission decision
  const courseTitle = student.courseApplied?.title || 'Your Course';
  if (req.body.status === 'accepted') {
    emailService.sendAdmissionAccepted({
      email:           student.email,
      firstName:       student.firstName,
      lastName:        student.lastName,
      admissionNumber: student.admissionNumber,
      courseTitle,
    }).catch(() => {});
  } else if (req.body.status === 'rejected') {
    emailService.sendAdmissionRejected({
      email:       student.email,
      firstName:   student.firstName,
      lastName:    student.lastName,
      courseTitle,
    }).catch(() => {});
  }

  res.json({
    success: true,
    message: `Application status updated to ${student.status}`,
    data: student,
  });
});

const admissionValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('dateOfBirth').isDate().withMessage('Valid date of birth is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Please select a gender'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('courseApplied').notEmpty().withMessage('Please select a course'),
];

// @desc   Get profile for logged-in student
// @route  GET /api/students/my-profile
// @access Private
const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    $or: [{ user: req.user._id }, { email: req.user.email }],
  }).populate('courseApplied', 'title level department');

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  res.json({ success: true, data: student });
});

// @desc   Update editable fields for logged-in student (phone, address, city, profilePhoto)
// @route  PUT /api/students/my-profile
// @access Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({
    $or: [{ user: req.user._id }, { email: req.user.email }],
  });

  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const { phone, address, city, country, profilePhoto } = req.body;
  if (phone)        student.phone        = phone.trim();
  if (address)      student.address      = address.trim();
  if (city)         student.city         = city.trim();
  if (country)      student.country      = country.trim();
  if (profilePhoto !== undefined) student.profilePhoto = profilePhoto;

  await student.save();
  await student.populate('courseApplied', 'title level department');
  res.json({ success: true, message: 'Profile updated', data: student });
});

module.exports = { applyAdmission, getStudents, getStudent, updateStudentStatus, admissionValidation, getMyProfile, updateMyProfile };
