// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: emailController.js                                   ║
// ║  PATH: backend/controllers/emailController.js                ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Admin broadcast emails bhej sakta hai sab students ko.   ║
// ║  → Fee reminder emails bhi bhejta hai.                      ║
// ║  → Test email bhi bhej sakta hai (configuration check).     ║
// ║                                                              ║
// ║  FUNCTIONS: broadcastEmail, sendFeeReminder, sendTestEmail   ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler  = require('express-async-handler');
const Student       = require('../models/Student');
const emailService  = require('../utils/emailService');

// @desc   Send broadcast email to all accepted students (or filtered by course)
// @route  POST /api/email/broadcast
// @access Admin
const broadcastEmail = asyncHandler(async (req, res) => {
  const { subject, body, recipientType = 'all', courseId } = req.body;

  if (!subject || !body) {
    res.status(400);
    throw new Error('Subject and body are required');
  }

  let filter = { status: 'accepted' };
  if (recipientType === 'course' && courseId) {
    filter.courseApplied = courseId;
  }

  const students = await Student.find(filter).select('firstName lastName email');

  if (students.length === 0) {
    return res.json({ success: true, message: 'No recipients found', sent: 0 });
  }

  const recipients = students.map((s) => s.email);
  const results = await emailService.sendBroadcast({ recipients, subject, body });

  const sent   = results.filter((r) => !r.error && !r.skipped).length;
  const failed = results.filter((r) => !!r.error).length;
  const skipped = results.filter((r) => r.skipped).length;

  res.json({
    success: true,
    message: `Broadcast complete`,
    total: students.length,
    sent,
    failed,
    skipped,
  });
});

// @desc   Send fee reminder to a specific student or all with unpaid fees
// @route  POST /api/email/fee-reminder
// @access Admin
const sendFeeReminder = asyncHandler(async (req, res) => {
  const { studentId } = req.body;

  const Fee     = require('../models/Fee');
  const filter  = { status: { $in: ['unpaid', 'overdue'] } };
  if (studentId) filter.student = studentId;

  const fees = await Fee.find(filter).populate('student', 'firstName lastName email');
  if (fees.length === 0) {
    return res.json({ success: true, message: 'No unpaid fees found', sent: 0 });
  }

  const results = await Promise.allSettled(
    fees.map((fee) =>
      emailService.sendFeeDueReminder({
        email:       fee.student.email,
        firstName:   fee.student.firstName,
        lastName:    fee.student.lastName,
        feeType:     fee.feeType,
        semester:    fee.semester,
        totalAmount: fee.totalAmount,
        dueDate:     fee.dueDate,
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  res.json({ success: true, sent, total: fees.length });
});

// @desc   Send a test email to the admin
// @route  POST /api/email/test
// @access Admin
const sendTestEmail = asyncHandler(async (req, res) => {
  const result = await emailService.sendCustomEmail({
    to:      req.user.email,
    subject: 'Email Configuration Test — Kingswell College',
    body:    `Hi ${req.user.name || 'Admin'},\n\nThis is a test email from the Kingswell College system. If you received this, your email configuration is working correctly!\n\nTimestamp: ${new Date().toLocaleString()}`,
  });

  if (result?.error) {
    res.status(500);
    throw new Error(`Email failed: ${result.error}`);
  }
  if (result?.skipped) {
    return res.json({ success: false, message: 'Email not configured. Set EMAIL_USER and EMAIL_PASS in .env file.' });
  }

  res.json({ success: true, message: `Test email sent to ${req.user.email}` });
});

module.exports = { broadcastEmail, sendFeeReminder, sendTestEmail };
