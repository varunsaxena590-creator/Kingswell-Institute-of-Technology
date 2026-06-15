// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: examController.js                                    ║
// ║  PATH: backend/controllers/examController.js                ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → Online MCQ Exam system ka controller                      ║
// ║  → Admin: CRUD exams, view submissions, stats                ║
// ║  → Student: available exams, start exam, submit, results     ║
// ╚══════════════════════════════════════════════════════════════╝
const Exam = require('../models/Exam');
const Student = require('../models/Student');
const { notifyAllStudents } = require('../utils/notificationHelper');

const formatCourse = (course) => {
  if (!course) return course;
  return {
    ...course,
    name: course.name || course.title || '',
  };
};

// ─────────────────────────────────────────────
// ADMIN: Get all exams
// ─────────────────────────────────────────────
const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('course', 'title code')
      .sort({ createdAt: -1 })
      .lean();

    // Add submission count to each exam
    const data = exams.map(e => ({
      ...e,
      course: formatCourse(e.course),
      submissionCount: e.submissions ? e.submissions.length : 0,
      submissions: undefined, // don't send full submissions in list
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get exam stats
// ─────────────────────────────────────────────
const getExamStats = async (req, res) => {
  try {
    const total = await Exam.countDocuments();
    const published = await Exam.countDocuments({ isPublished: true });
    const active = await Exam.countDocuments({ isActive: true, endTime: { $gte: new Date() } });

    // Total submissions across all exams
    const exams = await Exam.find().select('submissions').lean();
    let totalSubmissions = 0;
    let totalPassed = 0;
    exams.forEach(e => {
      if (e.submissions) {
        totalSubmissions += e.submissions.length;
        totalPassed += e.submissions.filter(s => s.passed).length;
      }
    });

    res.json({
      success: true,
      data: { total, published, active, totalSubmissions, totalPassed },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Create exam
// ─────────────────────────────────────────────
const createExam = async (req, res) => {
  try {
    const { title, description, course, subject, duration, totalMarks, passingMarks, questions, startTime, endTime, isPublished } = req.body;

    if (!title || !course || !subject || !duration || !totalMarks || !passingMarks || !questions || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required' });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.options || q.options.length !== 4 || q.correctOption === undefined) {
        return res.status(400).json({ success: false, message: `Question ${i + 1} is incomplete — need text, 4 options, and correct answer` });
      }
      if (q.correctOption < 0 || q.correctOption > 3) {
        return res.status(400).json({ success: false, message: `Question ${i + 1} has invalid correct option` });
      }
    }

    const exam = await Exam.create({
      title, description, course, subject, duration,
      totalMarks, passingMarks, questions, startTime, endTime,
      isPublished: isPublished || false,
    });

    // If published, notify students
    if (exam.isPublished) {
      notifyAllStudents(
        'exam',
        '📝 New Exam Published',
        `"${exam.title}" exam is now available. Duration: ${exam.duration} min.`,
        { examId: exam._id }
      ).catch(() => {});
    }

    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Update exam
// ─────────────────────────────────────────────
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Don't allow editing if submissions exist
    if (exam.submissions && exam.submissions.length > 0) {
      // Allow only toggling isPublished/isActive
      const allowed = ['isPublished', 'isActive'];
      const keys = Object.keys(req.body);
      const onlyToggle = keys.every(k => allowed.includes(k));
      if (!onlyToggle) {
        return res.status(400).json({ success: false, message: 'Cannot edit exam after students have submitted' });
      }
    }

    const wasPublished = exam.isPublished;
    Object.assign(exam, req.body);
    await exam.save();

    // Notify if just published
    if (!wasPublished && exam.isPublished) {
      notifyAllStudents(
        'exam',
        '📝 New Exam Published',
        `"${exam.title}" exam is now available. Duration: ${exam.duration} min.`,
        { examId: exam._id }
      ).catch(() => {});
    }

    res.json({ success: true, data: exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Delete exam
// ─────────────────────────────────────────────
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, message: 'Exam deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN: Get single exam with submissions
// ─────────────────────────────────────────────
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('course', 'title code')
      .populate('submissions.student', 'name email enrollmentNumber');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    const payload = exam.toObject();
    payload.course = formatCourse(payload.course);
    res.json({ success: true, data: payload });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ═════════════════════════════════════════════
// STUDENT ENDPOINTS
// ═════════════════════════════════════════════

// ─────────────────────────────────────────────
// STUDENT: Get my available exams
// ─────────────────────────────────────────────
const getMyExams = async (req, res) => {
  try {
    // Find this student
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const now = new Date();

    // Get published exams for student's course
    const exams = await Exam.find({
      isPublished: true,
      isActive: true,
      course: student.courseApplied,
    })
      .populate('course', 'title code')
      .sort({ startTime: -1 })
      .lean();

    // Categorize exams for the student
    const data = exams.map(e => {
      const mySubmission = e.submissions?.find(s => s.student.toString() === student._id.toString());
      const hasSubmitted = !!mySubmission;
      const isUpcoming = now < new Date(e.startTime);
      const isOngoing = now >= new Date(e.startTime) && now <= new Date(e.endTime);
      const isExpired = now > new Date(e.endTime);

      return {
        _id: e._id,
        title: e.title,
        description: e.description,
        course: formatCourse(e.course),
        subject: e.subject,
        duration: e.duration,
        totalMarks: e.totalMarks,
        passingMarks: e.passingMarks,
        questionCount: e.questions ? e.questions.length : 0,
        startTime: e.startTime,
        endTime: e.endTime,
        hasSubmitted,
        isUpcoming,
        isOngoing,
        isExpired,
        submission: hasSubmitted ? {
          score: mySubmission.score,
          totalMarks: mySubmission.totalMarks,
          percentage: mySubmission.percentage,
          passed: mySubmission.passed,
          submittedAt: mySubmission.submittedAt,
          timeTaken: mySubmission.timeTaken,
        } : null,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// STUDENT: Start / get exam questions
// ─────────────────────────────────────────────
const startExam = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (!exam.isPublished || !exam.isActive) {
      return res.status(400).json({ success: false, message: 'This exam is not available' });
    }

    const now = new Date();
    if (now < new Date(exam.startTime)) {
      return res.status(400).json({ success: false, message: 'Exam has not started yet' });
    }
    if (now > new Date(exam.endTime)) {
      return res.status(400).json({ success: false, message: 'Exam has ended' });
    }

    // Check if already submitted
    const existing = exam.submissions.find(s => s.student.toString() === student._id.toString());
    if (existing && existing.submittedAt) {
      return res.status(400).json({ success: false, message: 'You have already submitted this exam' });
    }

    // Send questions WITHOUT correct answers
    const questions = exam.questions.map((q, idx) => ({
      index: idx,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
    }));

    res.json({
      success: true,
      data: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        questions,
        endTime: exam.endTime,
        course: formatCourse(exam.course),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// STUDENT: Submit exam answers
// ─────────────────────────────────────────────
const submitExam = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    // Check already submitted
    const existing = exam.submissions.find(s => s.student.toString() === student._id.toString());
    if (existing && existing.submittedAt) {
      return res.status(400).json({ success: false, message: 'Already submitted' });
    }

    const { answers, startedAt } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers are required' });
    }

    // Auto-grade MCQ
    let score = 0;
    const totalMarks = exam.totalMarks;
    const gradedAnswers = answers.map(a => {
      const question = exam.questions[a.questionIndex];
      if (question && a.selectedOption === question.correctOption) {
        score += question.marks;
      }
      return { questionIndex: a.questionIndex, selectedOption: a.selectedOption };
    });

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passed = score >= exam.passingMarks;
    const now = new Date();
    const timeTaken = startedAt ? Math.round((now - new Date(startedAt)) / 1000) : 0;

    // Add submission
    exam.submissions.push({
      student: student._id,
      answers: gradedAnswers,
      score,
      totalMarks,
      percentage,
      passed,
      startedAt: startedAt ? new Date(startedAt) : now,
      submittedAt: now,
      timeTaken,
    });

    await exam.save();

    res.json({
      success: true,
      data: { score, totalMarks, percentage, passed, timeTaken },
      message: passed ? 'Congratulations! You passed!' : 'Exam submitted. Better luck next time!',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// STUDENT: Get exam result (with correct answers)
// ─────────────────────────────────────────────
const getExamResult = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const exam = await Exam.findById(req.params.id).populate('course', 'name code');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const submission = exam.submissions.find(s => s.student.toString() === student._id.toString());
    if (!submission) {
      return res.status(404).json({ success: false, message: 'No submission found for this exam' });
    }

    // Show questions with correct answers and student's answers
    const questions = exam.questions.map((q, idx) => {
      const studentAnswer = submission.answers.find(a => a.questionIndex === idx);
      return {
        index: idx,
        questionText: q.questionText,
        options: q.options,
        correctOption: q.correctOption,
        selectedOption: studentAnswer ? studentAnswer.selectedOption : -1,
        marks: q.marks,
        isCorrect: studentAnswer ? studentAnswer.selectedOption === q.correctOption : false,
      };
    });

    res.json({
      success: true,
      data: {
        exam: {
          _id: exam._id,
          title: exam.title,
          subject: exam.subject,
          course: formatCourse(exam.course),
          totalMarks: exam.totalMarks,
          passingMarks: exam.passingMarks,
          duration: exam.duration,
        },
        submission: {
          score: submission.score,
          totalMarks: submission.totalMarks,
          percentage: submission.percentage,
          passed: submission.passed,
          timeTaken: submission.timeTaken,
          submittedAt: submission.submittedAt,
        },
        questions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllExams,
  getExamStats,
  createExam,
  updateExam,
  deleteExam,
  getExamById,
  getMyExams,
  startExam,
  submitExam,
  getExamResult,
};
