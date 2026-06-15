// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: scholarshipController.js                             ║
// ║  PATH: backend/controllers/scholarshipController.js          ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Scholarship schemes CRUD (admin).                        ║
// ║  → Student apply karta hai, admin approve/reject karta hai. ║
// ║  → Student apni applications dekh sakta hai.                ║
// ║                                                              ║
// ║  FUNCTIONS: getScholarships, getAllScholarships,             ║
// ║    createScholarship, updateScholarship, deleteScholarship, ║
// ║    getAllApplications, applyScholarship, reviewApplication,  ║
// ║    getMyApplications                                         ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const { Scholarship, ScholarshipApplication } = require('../models/Scholarship');
const Student = require('../models/Student');
const { notifyStudent } = require('../utils/notificationHelper');

// ════════════════════════════════════════════════════════════════
// SCHOLARSHIP SCHEMES (Admin)
// ════════════════════════════════════════════════════════════════

// @desc   Get active scholarships (public/student)
// @route  GET /api/scholarships
// @access Public
const getScholarships = asyncHandler(async (req, res) => {
  const scholarships = await Scholarship.find({ isActive: true }).sort({ deadline: 1, createdAt: -1 });
  res.json({ success: true, data: scholarships });
});

// @desc   Get all scholarships (admin)
// @route  GET /api/scholarships/all
// @access Admin
const getAllScholarships = asyncHandler(async (req, res) => {
  const scholarships = await Scholarship.find().sort({ createdAt: -1 });
  res.json({ success: true, data: scholarships });
});

// @desc   Create scholarship scheme
// @route  POST /api/scholarships
// @access Admin
const createScholarship = asyncHandler(async (req, res) => {
  const { name, description, category, amount, seats, eligibility, deadline, isActive } = req.body;
  if (!name || amount === undefined) {
    res.status(400);
    throw new Error('Name and amount are required');
  }
  const scholarship = await Scholarship.create({
    name, description: description || '', category: category || 'merit',
    amount, seats: seats || 0, eligibility: eligibility || '',
    deadline: deadline || null, isActive: isActive !== false,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: scholarship });
});

// @desc   Update scholarship scheme
// @route  PUT /api/scholarships/:id
// @access Admin
const updateScholarship = asyncHandler(async (req, res) => {
  const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!scholarship) { res.status(404); throw new Error('Scholarship not found'); }
  res.json({ success: true, data: scholarship });
});

// @desc   Delete scholarship scheme
// @route  DELETE /api/scholarships/:id
// @access Admin
const deleteScholarship = asyncHandler(async (req, res) => {
  const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
  if (!scholarship) { res.status(404); throw new Error('Scholarship not found'); }
  // Also delete related applications
  await ScholarshipApplication.deleteMany({ scholarship: req.params.id });
  res.json({ success: true, message: 'Scholarship deleted' });
});

// ════════════════════════════════════════════════════════════════
// APPLICATIONS
// ════════════════════════════════════════════════════════════════

// @desc   Get all applications (admin)
// @route  GET /api/scholarships/applications
// @access Admin
const getAllApplications = asyncHandler(async (req, res) => {
  const apps = await ScholarshipApplication.find()
    .populate('scholarship', 'name category amount')
    .populate('student', 'firstName lastName email enrollmentNo course')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: apps });
});

// @desc   Student apply for scholarship
// @route  POST /api/scholarships/apply
// @access Protected (student)
const applyScholarship = asyncHandler(async (req, res) => {
  const { scholarshipId, reason, documents, cgpa, familyIncome } = req.body;
  if (!scholarshipId) {
    res.status(400);
    throw new Error('Scholarship ID is required');
  }

  // Check scholarship exists and is active
  const scholarship = await Scholarship.findById(scholarshipId);
  if (!scholarship || !scholarship.isActive) {
    res.status(404);
    throw new Error('Scholarship not found or not active');
  }

  // Check deadline
  if (scholarship.deadline && new Date(scholarship.deadline) < new Date()) {
    res.status(400);
    throw new Error('Application deadline has passed');
  }

  // Check seat limit
  if (scholarship.seats > 0) {
    const approvedCount = await ScholarshipApplication.countDocuments({ scholarship: scholarshipId, status: 'approved' });
    if (approvedCount >= scholarship.seats) {
      res.status(400);
      throw new Error('All seats for this scholarship are filled');
    }
  }

  // Find student record
  const student = await Student.findOne({ email: req.user.email });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // Check duplicate
  const existing = await ScholarshipApplication.findOne({ scholarship: scholarshipId, student: student._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already applied for this scholarship');
  }

  const application = await ScholarshipApplication.create({
    scholarship: scholarshipId,
    student: student._id,
    reason: reason || '',
    documents: documents || '',
    cgpa: cgpa || null,
    familyIncome: familyIncome || null,
  });

  const populated = await ScholarshipApplication.findById(application._id)
    .populate('scholarship', 'name category amount')
    .populate('student', 'firstName lastName email enrollmentNo course');

  res.status(201).json({ success: true, data: populated });
});

// @desc   Admin review (approve/reject) application
// @route  PUT /api/scholarships/applications/:id/review
// @access Admin
const reviewApplication = asyncHandler(async (req, res) => {
  const { status, adminRemark } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be approved or rejected');
  }
  const app = await ScholarshipApplication.findByIdAndUpdate(
    req.params.id,
    { status, adminRemark: adminRemark || '', reviewedAt: new Date() },
    { new: true }
  ).populate('scholarship', 'name category amount')
   .populate('student', 'firstName lastName email enrollmentNo course');

  if (!app) { res.status(404); throw new Error('Application not found'); }

  // Fire-and-forget: notify student about scholarship decision
  if (app.student) {
    const scholarshipName = app.scholarship?.name || 'Scholarship';
    notifyStudent(app.student, 'scholarship', `Scholarship ${status.charAt(0).toUpperCase() + status.slice(1)}`, `Your application for "${scholarshipName}" has been ${status}.${adminRemark ? ' Remark: ' + adminRemark : ''}`, { applicationId: app._id }).catch(() => {});
  }

  res.json({ success: true, data: app });
});

// @desc   Get my scholarship applications (student)
// @route  GET /api/scholarships/my
// @access Protected
const getMyApplications = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ email: req.user.email });
  if (!student) {
    return res.json({ success: true, data: [] });
  }
  const apps = await ScholarshipApplication.find({ student: student._id })
    .populate('scholarship', 'name category amount deadline')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: apps });
});

module.exports = {
  getScholarships, getAllScholarships, createScholarship, updateScholarship, deleteScholarship,
  getAllApplications, applyScholarship, reviewApplication, getMyApplications,
};
