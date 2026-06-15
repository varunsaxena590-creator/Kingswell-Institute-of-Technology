const Faq = require('../models/Faq');
const ChatHistory = require('../models/ChatHistory');
const UnansweredQuestion = require('../models/UnansweredQuestion');
const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Attendance = require('../models/Attendance');
const Assignment = require('../models/Assignment');
const Result = require('../models/Result');
const asyncHandler = require('express-async-handler');

const knowledgeBase = [
  {
    id: 'admission',
    question: 'How can I apply for admission?',
    answer: {
      en: 'You can apply from the Admission page. Fill the admission form, upload the required details, and submit it for college review.',
      hi: 'Admission page se apply kar sakte ho. Admission form fill karo, required details upload karo, aur college review ke liye submit karo.',
    },
    link: '/admission',
    linkLabel: { en: 'Go to Admission', hi: 'Admission par jao' },
    keywords: ['admission', 'apply', 'application', 'form', 'enroll', 'registration', 'admit', ' प्रवेश', 'दाखिला', 'आवेदन', 'फॉर्म'],
  },
  {
    id: 'courses',
    question: 'Which courses are available?',
    answer: {
      en: 'The software has a Courses section where students can view all available college courses and course details.',
      hi: 'Software me Courses section hai jahan students available college courses aur unki details dekh sakte hain.',
    },
    link: '/courses',
    linkLabel: { en: 'View Courses', hi: 'Courses dekho' },
    keywords: ['course', 'courses', 'program', 'programs', 'bca', 'bba', 'mba', 'mca', 'btech', 'b.tech', 'subject', 'कोर्स', 'पाठ्यक्रम'],
  },
  {
    id: 'documents',
    question: 'Which documents are required for admission?',
    answer: {
      en: 'Keep your recent photo, previous marksheet, ID proof, address proof, transfer or leaving certificate if applicable, and category or scholarship documents if needed.',
      hi: 'Admission ke liye recent photo, previous marksheet, ID proof, address proof, applicable ho to transfer/leaving certificate, aur category ya scholarship documents ready rakho.',
    },
    link: '/admission',
    linkLabel: { en: 'Open Admission', hi: 'Admission kholo' },
    keywords: ['document', 'documents', 'required documents', 'marksheet', 'id proof', 'certificate', 'admission documents', 'docs'],
  },
  {
    id: 'form-help',
    question: 'Can you help me fill a form?',
    answer: {
      en: 'Yes. Open the relevant form, fill personal details first, select course or request type, attach required documents, review all fields, and submit. For admission, use the Admission page.',
      hi: 'Haan. Relevant form kholo, personal details bharo, course ya request type select karo, required documents attach karo, fields review karo, phir submit karo. Admission ke liye Admission page use karo.',
    },
    link: '/admission',
    linkLabel: { en: 'Start Admission Form', hi: 'Admission Form kholo' },
    keywords: ['form help', 'fill form', 'admission form', 'leave form', 'feedback form', 'guide form', 'form filling'],
  },
  {
    id: 'fees',
    question: 'Where can I check fees?',
    answer: {
      en: 'Students can check their fee details, payment status, and related fee information in the My Fees section after login.',
      hi: 'Login ke baad students My Fees section me fee details, payment status, aur related fee information dekh sakte hain.',
    },
    link: '/my-fees',
    linkLabel: { en: 'Open My Fees', hi: 'My Fees kholo' },
    keywords: ['fee', 'fees', 'payment', 'paid', 'dues', 'installment', 'फीस', 'पेमेंट', 'भुगतान'],
  },
  {
    id: 'results',
    question: 'How can I see my result?',
    answer: {
      en: 'Your marks and result records are available in the My Results section after student login.',
      hi: 'Student login ke baad marks aur result records My Results section me milenge.',
    },
    link: '/my-results',
    linkLabel: { en: 'Open Results', hi: 'Results kholo' },
    keywords: ['result', 'results', 'marks', 'grade', 'score', 'रिजल्ट', 'मार्क्स', 'अंक'],
  },
  {
    id: 'attendance',
    question: 'Where is attendance shown?',
    answer: {
      en: 'Students can view attendance records and attendance percentage from the My Attendance section.',
      hi: 'Students My Attendance section se attendance records aur attendance percentage dekh sakte hain.',
    },
    link: '/my-attendance',
    linkLabel: { en: 'Open Attendance', hi: 'Attendance kholo' },
    keywords: ['attendance', 'present', 'absent', 'percentage', 'हाजिरी', 'उपस्थिति', 'अटेंडेंस'],
  },
  {
    id: 'timetable',
    question: 'Where can I find my timetable?',
    answer: {
      en: 'Class timetable is available in the My Timetable section after login.',
      hi: 'Login ke baad class timetable My Timetable section me available hai.',
    },
    link: '/my-timetable',
    linkLabel: { en: 'Open Timetable', hi: 'Timetable kholo' },
    keywords: ['timetable', 'schedule', 'class time', 'period', 'time table', 'टाइमटेबल', 'समय सारणी'],
  },
  {
    id: 'hall-ticket',
    question: 'How do I get my hall ticket?',
    answer: {
      en: 'Exam hall tickets can be viewed and downloaded from the My Hall Ticket section after login.',
      hi: 'Exam hall ticket login ke baad My Hall Ticket section se view aur download kar sakte ho.',
    },
    link: '/my-hall-ticket',
    linkLabel: { en: 'Open Hall Ticket', hi: 'Hall Ticket kholo' },
    keywords: ['hall ticket', 'admit card', 'exam card', 'हॉल टिकट', 'एडमिट कार्ड'],
  },
  {
    id: 'library',
    question: 'Where can I see library books?',
    answer: {
      en: 'Library books, issued books, and library records are available in the My Library section.',
      hi: 'Library books, issued books, aur library records My Library section me available hain.',
    },
    link: '/my-library',
    linkLabel: { en: 'Open Library', hi: 'Library kholo' },
    keywords: ['library', 'book', 'books', 'issue', 'issued', 'लाइब्रेरी', 'पुस्तक', 'किताब'],
  },
  {
    id: 'leave',
    question: 'How can I apply for leave?',
    answer: {
      en: 'Students can submit leave applications and track leave status from the My Leave section.',
      hi: 'Students My Leave section se leave application submit aur status track kar sakte hain.',
    },
    link: '/my-leave',
    linkLabel: { en: 'Open Leave', hi: 'Leave kholo' },
    keywords: ['leave', 'holiday', 'application leave', 'छुट्टी', 'अवकाश'],
  },
  {
    id: 'assignments',
    question: 'Where are assignments available?',
    answer: {
      en: 'Assignments and submission details are available in the My Assignments section after login.',
      hi: 'Assignments aur submission details login ke baad My Assignments section me available hain.',
    },
    link: '/my-assignments',
    linkLabel: { en: 'Open Assignments', hi: 'Assignments kholo' },
    keywords: ['assignment', 'assignments', 'homework', 'submission', 'असाइनमेंट', 'होमवर्क'],
  },
  {
    id: 'exams',
    question: 'Where can I check exams?',
    answer: {
      en: 'Exam details are available in the My Exams section. MCQ exams can be opened from the MCQ Exams page.',
      hi: 'Exam details My Exams section me available hain. MCQ exams MCQ Exams page se open kar sakte ho.',
    },
    link: '/my-exams',
    linkLabel: { en: 'Open Exams', hi: 'Exams kholo' },
    keywords: ['exam', 'exams', 'test', 'mcq', 'paper', 'परीक्षा', 'एग्जाम', 'टेस्ट'],
  },
  {
    id: 'scholarships',
    question: 'Where can I check scholarships?',
    answer: {
      en: 'Scholarship details and student scholarship status are available in the My Scholarships section.',
      hi: 'Scholarship details aur student scholarship status My Scholarships section me available hain.',
    },
    link: '/my-scholarships',
    linkLabel: { en: 'Open Scholarships', hi: 'Scholarships kholo' },
    keywords: ['scholarship', 'scholarships', 'financial aid', 'छात्रवृत्ति', 'स्कॉलरशिप'],
  },
  {
    id: 'certificates',
    question: 'Where can I get certificates?',
    answer: {
      en: 'Student certificates can be viewed or downloaded from the My Certificates section after login.',
      hi: 'Student certificates login ke baad My Certificates section se view ya download kar sakte ho.',
    },
    link: '/my-certificates',
    linkLabel: { en: 'Open Certificates', hi: 'Certificates kholo' },
    keywords: ['certificate', 'certificates', 'bonafide', 'tc', 'migration', 'सर्टिफिकेट', 'प्रमाणपत्र'],
  },
  {
    id: 'notices',
    question: 'Where are college notices?',
    answer: {
      en: 'College notices and announcements are shown on the Notices page.',
      hi: 'College notices aur announcements Notices page par dikhte hain.',
    },
    link: '/notices',
    linkLabel: { en: 'Open Notices', hi: 'Notices kholo' },
    keywords: ['notice', 'notices', 'announcement', 'news', 'सूचना', 'नोटिस'],
  },
  {
    id: 'events',
    question: 'Where can I see events?',
    answer: {
      en: 'College events and event details are available on the Events page.',
      hi: 'College events aur event details Events page par available hain.',
    },
    link: '/events',
    linkLabel: { en: 'Open Events', hi: 'Events kholo' },
    keywords: ['event', 'events', 'calendar', 'function', 'कार्यक्रम', 'इवेंट'],
  },
  {
    id: 'placements',
    question: 'Where is placement information?',
    answer: {
      en: 'Placement information, opportunities, and updates are available on the Placements page.',
      hi: 'Placement information, opportunities, aur updates Placements page par available hain.',
    },
    link: '/placements',
    linkLabel: { en: 'Open Placements', hi: 'Placements kholo' },
    keywords: ['placement', 'placements', 'job', 'jobs', 'career', 'company', 'प्लेसमेंट', 'नौकरी'],
  },
  {
    id: 'faculty',
    question: 'Where can I see faculty details?',
    answer: {
      en: 'Faculty profiles and teacher details are available on the Faculty page.',
      hi: 'Faculty profiles aur teacher details Faculty page par available hain.',
    },
    link: '/faculty',
    linkLabel: { en: 'Open Faculty', hi: 'Faculty kholo' },
    keywords: ['faculty', 'teacher', 'teachers', 'staff', 'professor', 'फैकल्टी', 'टीचर', 'शिक्षक'],
  },
  {
    id: 'gallery',
    question: 'Where is the photo gallery?',
    answer: {
      en: 'College photos and gallery images are available on the Gallery page.',
      hi: 'College photos aur gallery images Gallery page par available hain.',
    },
    link: '/gallery',
    linkLabel: { en: 'Open Gallery', hi: 'Gallery kholo' },
    keywords: ['gallery', 'photo', 'photos', 'image', 'images', 'गैलरी', 'फोटो'],
  },
  {
    id: 'contact',
    question: 'How can I contact the college?',
    answer: {
      en: 'Use the Contact page to send an enquiry or find college contact details.',
      hi: 'Enquiry bhejne ya college contact details dekhne ke liye Contact page use karo.',
    },
    link: '/contact',
    linkLabel: { en: 'Open Contact', hi: 'Contact kholo' },
    keywords: ['contact', 'phone', 'email', 'help', 'support', 'address', 'संपर्क', 'मदद', 'ईमेल'],
  },
  {
    id: 'login',
    question: 'How do I login?',
    answer: {
      en: 'Use the Login page with your registered credentials to access student features.',
      hi: 'Student features access karne ke liye Login page par registered credentials use karo.',
    },
    link: '/login',
    linkLabel: { en: 'Go to Login', hi: 'Login par jao' },
    keywords: ['login', 'sign in', 'signin', 'password', 'account', 'लॉगिन', 'पासवर्ड'],
  },
  {
    id: 'register',
    question: 'How do I create an account?',
    answer: {
      en: 'New users can create an account from the Register page.',
      hi: 'New users Register page se account create kar sakte hain.',
    },
    link: '/register',
    linkLabel: { en: 'Go to Register', hi: 'Register par jao' },
    keywords: ['register', 'signup', 'sign up', 'create account', 'रजिस्टर', 'खाता'],
  },
];

const normalize = (value = '') =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const detectLanguage = (question, requestedLanguage) => {
  if (requestedLanguage === 'hi' || requestedLanguage === 'en') return requestedLanguage;
  return /[\u0900-\u097F]/.test(question) ? 'hi' : 'en';
};

const scoreFaq = (faq, question) => {
  const normalizedQuestion = normalize(question);
  const words = normalizedQuestion.split(' ').filter(Boolean);
  let score = 0;

  faq.keywords.forEach((keyword) => {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) return;
    if (normalizedQuestion.includes(normalizedKeyword)) score += normalizedKeyword.includes(' ') ? 5 : 3;
  });

  normalize(faq.question)
    .split(' ')
    .forEach((word) => {
      if (word.length > 2 && words.includes(word)) score += 1;
    });

  return score;
};

const formatFaq = (faq, language) => ({
  id: faq.id,
  question: faq.question,
  answer: faq.answer[language] || faq.answer.en,
  link: faq.link,
  linkLabel: faq.linkLabel[language] || faq.linkLabel.en,
});

const quickActions = [
  { label: 'Apply Admission', labelHi: 'Admission Apply', value: 'I want to apply for admission', link: '/admission' },
  { label: 'Check Fees', labelHi: 'Fees Check', value: 'Where can I check fees?', link: '/my-fees' },
  { label: 'View Result', labelHi: 'Result Dekho', value: 'How can I see my result?', link: '/my-results' },
  { label: 'Download Hall Ticket', labelHi: 'Hall Ticket', value: 'How do I get my hall ticket?', link: '/my-hall-ticket' },
  { label: 'Contact Admin', labelHi: 'Admin Contact', value: 'How can I contact the college?', link: '/contact' },
  { label: 'My Status', labelHi: 'Mera Status', value: 'Show my status', link: '/profile' },
];

const buildStudentSummary = async (user, language) => {
  if (!user) return null;
  const student = await Student.findOne({ $or: [{ user: user._id }, { email: user.email }] }).populate('courseApplied', 'title');
  if (!student) return null;

  const [fees, attendanceSheets, assignments, results] = await Promise.all([
    Fee.find({ student: student._id }).sort({ dueDate: 1 }),
    Attendance.find({ 'records.student': student._id }),
    Assignment.find(student.courseApplied ? { course: student.courseApplied } : {}),
    Result.find({ student: student._id, publishedAt: { $ne: null } }).sort({ createdAt: -1 }),
  ]);

  const pendingFees = fees.filter((fee) => ['unpaid', 'partial'].includes(fee.status));
  const feeBalance = pendingFees.reduce((sum, fee) => sum + (fee.balance || 0), 0);

  let presentScore = 0;
  let totalAttendance = 0;
  attendanceSheets.forEach((sheet) => {
    const record = sheet.records.find((item) => item.student.toString() === student._id.toString());
    if (!record) return;
    totalAttendance += 1;
    if (record.status === 'present') presentScore += 1;
    if (record.status === 'late') presentScore += 0.5;
  });
  const attendancePct = totalAttendance ? Math.round((presentScore / totalAttendance) * 100) : null;

  const pendingAssignments = assignments.filter((assignment) => {
    const submitted = assignment.submissions.some((submission) => submission.student.toString() === student._id.toString());
    return assignment.isActive && !submitted;
  });

  const latestResult = results[0];
  const parts =
    language === 'hi'
      ? [
          `Admission: ${student.status}`,
          `Course: ${student.courseApplied?.title || 'Not assigned'}`,
          `Attendance: ${attendancePct === null ? 'No records' : `${attendancePct}%`}`,
          `Fees: ${pendingFees.length} pending, balance ${feeBalance}`,
          `Assignments: ${pendingAssignments.length} pending`,
          `Latest result: ${latestResult ? `${latestResult.semester} ${latestResult.overallGrade || ''}` : 'Not published yet'}`,
        ]
      : [
          `Admission: ${student.status}`,
          `Course: ${student.courseApplied?.title || 'Not assigned'}`,
          `Attendance: ${attendancePct === null ? 'No records' : `${attendancePct}%`}`,
          `Fees: ${pendingFees.length} pending, balance ${feeBalance}`,
          `Assignments: ${pendingAssignments.length} pending`,
          `Latest result: ${latestResult ? `${latestResult.semester} ${latestResult.overallGrade || ''}` : 'Not published yet'}`,
        ];

  return parts.join('\n');
};

const isStatusQuestion = (question) => {
  const normalized = normalize(question);
  return ['my status', 'status batao', 'mera status', 'dashboard summary', 'personal summary'].some((term) => normalized.includes(term));
};

const isIssueReport = (question) => {
  const normalized = normalize(question);
  return ['not opening', 'not working', 'error', 'issue', 'problem', 'open nahi', 'nahi khul', 'nahi chal'].some((term) =>
    normalized.includes(term)
  );
};

const saveHistory = async (req, payload) => {
  if (!req.user) return;
  try {
    await ChatHistory.create({
      user: req.user._id,
      question: payload.question,
      answer: payload.answer,
      matched: payload.matched || null,
      link: payload.link || '',
      linkLabel: payload.linkLabel || '',
      language: payload.language,
    });
  } catch {
    // Chatbot answers should not fail just because history storage is unavailable.
  }
};

// Get all FAQs (for suggestions)
const getFaqs = asyncHandler(async (req, res) => {
  let dbFaqs = [];
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ createdAt: -1 }).maxTimeMS(1500);
    dbFaqs = faqs.map((faq) => ({
      id: faq._id,
      question: faq.question,
      answer: faq.answer,
      tags: faq.tags || [],
    }));
  } catch {
    dbFaqs = [];
  }
  res.json({ success: true, faqs: [...knowledgeBase.map((faq) => formatFaq(faq, 'en')), ...dbFaqs] });
});

const getQuickActions = asyncHandler(async (req, res) => {
  res.json({ success: true, actions: quickActions });
});

// Chatbot QnA endpoint
const askChatbot = asyncHandler(async (req, res) => {
  const { question, language: requestedLanguage } = req.body;
  if (!question) return res.status(400).json({ success: false, message: 'Question is required' });
  const language = detectLanguage(question, requestedLanguage);

  if (isIssueReport(question)) {
    try {
      await UnansweredQuestion.create({ question, language, user: req.user?._id || null });
    } catch {
      // Keep issue confirmation responsive even if storage is unavailable.
    }
    const payload = {
      success: true,
      answer:
        language === 'hi'
          ? 'Issue admin review ke liye save ho gaya hai. Agar urgent hai to Chat / Messages ya Contact page se admin ko message bhejo.'
          : 'I saved this issue for admin review. If it is urgent, message the admin from Chat / Messages or the Contact page.',
      matched: 'Issue report',
      language,
      link: req.user ? '/my-chat' : '/contact',
      linkLabel: language === 'hi' ? 'Admin ko message' : 'Message Admin',
      unansweredSaved: true,
    };
    await saveHistory(req, { question, ...payload });
    return res.json(payload);
  }

  if (isStatusQuestion(question)) {
    const summary = await buildStudentSummary(req.user, language);
    const answer =
      summary ||
      (language === 'hi'
        ? 'Personal status dekhne ke liye student account se login karo.'
        : 'Please login with a student account to see your personal status.');
    const payload = {
      success: true,
      answer,
      matched: summary ? 'Personal dashboard summary' : null,
      language,
      link: summary ? '/profile' : '/login',
      linkLabel: language === 'hi' ? (summary ? 'Profile kholo' : 'Login karo') : summary ? 'Open Profile' : 'Login',
    };
    await saveHistory(req, { question, ...payload });
    return res.json(payload);
  }

  const bestStaticMatch = knowledgeBase
    .map((faq) => ({ faq, score: scoreFaq(faq, question) }))
    .sort((a, b) => b.score - a.score)[0];

  if (bestStaticMatch?.score > 0) {
    const matched = formatFaq(bestStaticMatch.faq, language);
    const payload = { success: true, ...matched, matched: matched.question, language };
    await saveHistory(req, { question, ...payload });
    return res.json(payload);
  }

  try {
    const normalizedQuestion = normalize(question);
    const dbFaqs = await Faq.find({ isActive: true }).maxTimeMS(1500);
    const dbMatch = dbFaqs.find((faq) => {
      const searchable = normalize(`${faq.question} ${(faq.tags || []).join(' ')}`);
      return searchable.includes(normalizedQuestion) || normalizedQuestion.includes(normalize(faq.question));
    });

    if (dbMatch) {
      const payload = {
        success: true,
        id: dbMatch._id,
        answer: dbMatch.answer,
        matched: dbMatch.question,
        language,
      };
      await saveHistory(req, { question, ...payload });
      return res.json(payload);
    }
  } catch {
    // Built-in software FAQ answers should keep working even if MongoDB is offline.
  }

  const fallback =
    language === 'hi'
      ? 'Is question ka exact answer abhi mere paas nahi hai. College software ke admission, courses, fees, attendance, results, timetable, library, notices, events, placements, contact aur student services ke baare me puchho.'
      : 'I do not have an exact answer for that question yet. Please ask about admission, courses, fees, attendance, results, timetable, library, notices, events, placements, contact, or student services in this college software.';

  try {
    await UnansweredQuestion.create({ question, language, user: req.user?._id || null });
  } catch {
    // Fallback should still reach the student.
  }

  const payload = { success: true, answer: fallback, matched: null, language, unansweredSaved: true };
  await saveHistory(req, { question, ...payload });
  return res.json(payload);
});

const getMyHistory = asyncHandler(async (req, res) => {
  const history = await ChatHistory.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, history });
});

const getAdminFaqs = asyncHandler(async (req, res) => {
  const faqs = await Faq.find({}).sort({ createdAt: -1 });
  res.json({ success: true, faqs });
});

const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, tags, isActive = true } = req.body;
  if (!question || !answer) return res.status(400).json({ success: false, message: 'Question and answer are required' });
  const faq = await Faq.create({ question, answer, tags: tags || [], isActive });
  res.status(201).json({ success: true, faq });
});

const updateFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
  ['question', 'answer', 'tags', 'isActive'].forEach((key) => {
    if (req.body[key] !== undefined) faq[key] = req.body[key];
  });
  await faq.save();
  res.json({ success: true, faq });
});

const deleteFaq = asyncHandler(async (req, res) => {
  const faq = await Faq.findById(req.params.id);
  if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
  await faq.deleteOne();
  res.json({ success: true, message: 'FAQ deleted' });
});

const getUnansweredQuestions = asyncHandler(async (req, res) => {
  const questions = await UnansweredQuestion.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, questions });
});

const answerUnansweredQuestion = asyncHandler(async (req, res) => {
  const item = await UnansweredQuestion.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Question not found' });
  const { answer, tags = [] } = req.body;
  if (!answer) return res.status(400).json({ success: false, message: 'Answer is required' });

  const faq = await Faq.create({ question: item.question, answer, tags, isActive: true });
  item.status = 'answered';
  item.answer = answer;
  item.answeredBy = req.user._id;
  item.answeredAt = new Date();
  await item.save();
  res.json({ success: true, question: item, faq });
});

// Delete all FAQs
const deleteAllFaqs = asyncHandler(async (req, res) => {
  await Faq.deleteMany({});
  res.json({ success: true, message: 'All FAQs deleted' });
});

module.exports = {
  getFaqs,
  getQuickActions,
  askChatbot,
  getMyHistory,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  getUnansweredQuestions,
  answerUnansweredQuestion,
  deleteAllFaqs,
};
