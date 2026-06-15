// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: analyticsController.js                               ║
// ║  PATH: backend/controllers/analyticsController.js            ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Admin dashboard ke liye analytics data aggregate karta   ║
// ║    hai — Students, Fees, Courses, Faculty, Results,          ║
// ║    Attendance, Contacts ka summary deta hai.                 ║
// ║                                                              ║
// ║  FUNCTIONS: getDashboardAnalytics                            ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const Student    = require('../models/Student');
const Fee        = require('../models/Fee');
const Course     = require('../models/Course');
const Faculty    = require('../models/Faculty');
const Result     = require('../models/Result');
const Attendance = require('../models/Attendance');
const Contact    = require('../models/Contact');

// @desc   Get full dashboard analytics
// @route  GET /api/analytics/dashboard
// @access Admin
const getDashboardAnalytics = asyncHandler(async (req, res) => {

  // ── 1. Student stats ────────────────────────────────────────
  const [totalStudents, accepted, pending, rejected, underReview] = await Promise.all([
    Student.countDocuments(),
    Student.countDocuments({ status: 'accepted' }),
    Student.countDocuments({ status: 'pending' }),
    Student.countDocuments({ status: 'rejected' }),
    Student.countDocuments({ status: 'under_review' }),
  ]);

  // ── 2. Students per course (top 6) ─────────────────────────
  const studentsPerCourse = await Student.aggregate([
    { $match: { status: 'accepted' } },
    { $group: { _id: '$courseApplied', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
    { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
    { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: ['$course.title', 'Unknown'] }, students: '$count' } },
  ]);

  // ── 3. Monthly admissions (last 6 months) ──────────────────
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyAdmissions = await Student.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        applications: { $sum: 1 },
        accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        month: {
          $let: {
            vars: {
              months: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            },
            in: { $arrayElemAt: ['$$months', '$_id.month'] },
          },
        },
        applications: 1,
        accepted: 1,
      },
    },
  ]);

  // ── 4. Fee stats ────────────────────────────────────────────
  const feeStats = await Fee.aggregate([
    {
      $group: {
        _id: '$status',
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const feeMap = {};
  feeStats.forEach((f) => { feeMap[f._id] = { total: f.total, count: f.count }; });
  const totalRevenue   = (feeMap.paid?.total || 0);
  const pendingRevenue = (feeMap.unpaid?.total || 0) + (feeMap.overdue?.total || 0);
  const feeChartData = [
    { name: 'Paid',    value: feeMap.paid?.total || 0,    count: feeMap.paid?.count || 0 },
    { name: 'Unpaid',  value: feeMap.unpaid?.total || 0,  count: feeMap.unpaid?.count || 0 },
    { name: 'Partial', value: feeMap.partial?.total || 0, count: feeMap.partial?.count || 0 },
    { name: 'Overdue', value: feeMap.overdue?.total || 0, count: feeMap.overdue?.count || 0 },
  ].filter((f) => f.value > 0);

  // ── 5. Results grade distribution ──────────────────────────
  const gradeDistribution = await Result.aggregate([
    { $match: { publishedAt: { $ne: null } } },
    { $group: { _id: '$overallGrade', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { grade: '$_id', count: 1 } },
  ]);

  // ── 6. Attendance summary (last 30 days) ───────────────────
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const attendanceSummary = await Attendance.aggregate([
    { $match: { date: { $gte: thirtyDaysAgo } } },
    { $unwind: '$records' },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        present: { $sum: { $cond: [{ $eq: ['$records.status', 'present'] }, 1, 0] } },
        absent:  { $sum: { $cond: [{ $eq: ['$records.status', 'absent'] },  1, 0] } },
        late:    { $sum: { $cond: [{ $eq: ['$records.status', 'late'] },    1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 14 },
    {
      $project: {
        date: '$_id',
        present: 1,
        absent: 1,
        late: 1,
        total: { $add: ['$present', '$absent', '$late'] },
        pct: {
          $cond: [
            { $gt: [{ $add: ['$present', '$absent', '$late'] }, 0] },
            { $multiply: [{ $divide: ['$present', { $add: ['$present', '$absent', '$late'] }] }, 100] },
            0,
          ],
        },
      },
    },
  ]);

  const formattedAttendance = attendanceSummary.map((a) => ({
    date: a.date.slice(5), // MM-DD
    present: a.present,
    absent: a.absent,
    late: a.late,
    pct: Math.round(a.pct),
  }));

  // ── 7. Top metrics ─────────────────────────────────────────
  const [totalCourses, totalFaculty, totalContacts] = await Promise.all([
    Course.countDocuments({ isActive: true }),
    Faculty.countDocuments(),
    Contact.countDocuments({ status: 'unread' }),
  ]);

  const avgAttendancePct = formattedAttendance.length
    ? Math.round(formattedAttendance.reduce((s, a) => s + a.pct, 0) / formattedAttendance.length)
    : 0;

  res.json({
    success: true,
    data: {
      overview: {
        totalStudents,
        accepted,
        pending,
        rejected,
        underReview,
        totalCourses,
        totalFaculty,
        totalContacts,
        totalRevenue,
        pendingRevenue,
        avgAttendancePct,
        acceptanceRate: totalStudents > 0 ? Math.round((accepted / totalStudents) * 100) : 0,
      },
      admissionStatus: [
        { name: 'Accepted',     value: accepted,    color: '#34d399' },
        { name: 'Pending',      value: pending,     color: '#fb923c' },
        { name: 'Under Review', value: underReview, color: '#60a5fa' },
        { name: 'Rejected',     value: rejected,    color: '#f87171' },
      ].filter((s) => s.value > 0),
      studentsPerCourse,
      monthlyAdmissions,
      feeChartData,
      gradeDistribution,
      attendanceSummary: formattedAttendance,
    },
  });
});

module.exports = { getDashboardAnalytics };
