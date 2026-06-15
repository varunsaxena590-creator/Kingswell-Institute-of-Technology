// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: certificateController.js                             ║
// ║  PATH: backend/controllers/certificateController.js          ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Admin generates certificates for students.               ║
// ║  → Admin views all, revokes, deletes certificates.          ║
// ║  → Student views own certificates.                          ║
// ║  → Public verify by certificate number.                     ║
// ║                                                              ║
// ║  FUNCTIONS: generateCertificate, getAllCertificates,         ║
// ║    getMyCertificates, revokeCertificate, deleteCertificate, ║
// ║    verifyCertificate                                        ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Certificate = require('../models/Certificate');
const Student     = require('../models/Student');

// @desc   Generate a certificate for a student (admin)
// @route  POST /api/certificates
// @access Admin
const generateCertificate = asyncHandler(async (req, res) => {
  const { studentId, type, title, description, issueDate, validUntil, grade, courseName, semester } = req.body;
  if (!studentId || !title) {
    res.status(400);
    throw new Error('Student and title are required');
  }
  const student = await Student.findById(studentId);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  const cert = await Certificate.create({
    student: studentId,
    type: type || 'course-completion',
    title,
    description: description || '',
    issueDate: issueDate || Date.now(),
    validUntil: validUntil || null,
    grade: grade || '',
    courseName: courseName || '',
    semester: semester || '',
    issuedBy: req.user._id,
  });
  res.status(201).json({ success: true, data: cert });
});

// @desc   Get all certificates (admin)
// @route  GET /api/certificates
// @access Admin
const getAllCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find()
    .populate('student', 'firstName lastName email enrollmentNumber course semester')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: certs });
});

// @desc   Get my certificates (student)
// @route  GET /api/certificates/my
// @access Protected
const getMyCertificates = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ email: req.user.email });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }
  const certs = await Certificate.find({ student: student._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: certs });
});

// @desc   Verify a certificate by certificate number (public)
// @route  GET /api/certificates/verify/:certNo
// @access Public
const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certificateNo: req.params.certNo })
    .populate('student', 'firstName lastName enrollmentNumber course semester');
  if (!cert) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  res.json({ success: true, data: cert });
});

// @desc   Revoke a certificate (admin)
// @route  PUT /api/certificates/:id/revoke
// @access Admin
const revokeCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id);
  if (!cert) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  cert.status = 'revoked';
  cert.revokedReason = req.body.reason || '';
  await cert.save();
  res.json({ success: true, data: cert });
});

// @desc   Delete a certificate (admin)
// @route  DELETE /api/certificates/:id
// @access Admin
const deleteCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findById(req.params.id);
  if (!cert) {
    res.status(404);
    throw new Error('Certificate not found');
  }
  await cert.deleteOne();
  res.json({ success: true, message: 'Certificate deleted' });
});

module.exports = {
  generateCertificate,
  getAllCertificates,
  getMyCertificates,
  verifyCertificate,
  revokeCertificate,
  deleteCertificate,
};
