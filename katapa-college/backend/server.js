// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: server.js                                            ║
// ║  PATH: backend/server.js                                    ║
// ║                                                              ║
// ║  KYA HAI YE FILE? (What is this file?)                       ║
// ║  → Ye poore backend ka MAIN entry point hai.                 ║
// ║  → Express server yahi se start hota hai (Port 5000).        ║
// ║  → MongoDB database se connect karta hai.                    ║
// ║  → Saare API routes yahi pe register hote hain.              ║
// ║  → CORS, JSON parsing, error handling — sab yahi set hai.    ║
// ║                                                              ║
// ║  ROUTES REGISTERED:                                          ║
// ║  /api/auth       → Login, Register, Profile                  ║
// ║  /api/students   → Student admissions & profiles             ║
// ║  /api/courses    → Course CRUD                               ║
// ║  /api/contacts   → Contact form enquiries                    ║
// ║  /api/gallery    → Photo gallery                             ║
// ║  /api/faculty    → Faculty members                           ║
// ║  /api/fees       → Fee management                            ║
// ║  /api/notices    → Notice board                              ║
// ║  /api/results    → Student results/marks                     ║
// ║  /api/attendance → Attendance records                        ║
// ║  /api/timetable  → Class timetable                           ║
// ║  /api/email      → Broadcast emails                          ║
// ║  /api/analytics     → Dashboard analytics                    ║
// ║  /api/hall-tickets  → Exam hall tickets                      ║
// ║  /api/leaves        → Student leave applications             ║
// ║  /api/library       → Library books & issue management       ║
// ║  /api/events        → Event calendar                         ║
// ║  /api/scholarships  → Scholarship management                 ║
// ║  /api/feedback      → Student feedback system                ║
// ║  /api/certificates  → Certificate generator                  ║
// ╚══════════════════════════════════════════════════════════════╝

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// ── Import Routes ───────────────────────────────────────────────
const authRoutes         = require('./routes/authRoutes');
const studentRoutes      = require('./routes/studentRoutes');
const courseRoutes       = require('./routes/courseRoutes');
const contactRoutes      = require('./routes/contactRoutes');
const galleryRoutes      = require('./routes/galleryRoutes');
const facultyRoutes      = require('./routes/facultyRoutes');
const feeRoutes          = require('./routes/feeRoutes');
const noticeRoutes       = require('./routes/noticeRoutes');
const resultRoutes       = require('./routes/resultRoutes');
const attendanceRoutes   = require('./routes/attendanceRoutes');
const timetableRoutes    = require('./routes/timetableRoutes');
const emailRoutes        = require('./routes/emailRoutes');
const analyticsRoutes    = require('./routes/analyticsRoutes');
const hallTicketRoutes   = require('./routes/hallTicketRoutes');
const leaveRoutes        = require('./routes/leaveRoutes');
const libraryRoutes      = require('./routes/libraryRoutes');
const eventRoutes        = require('./routes/eventRoutes');
const scholarshipRoutes  = require('./routes/scholarshipRoutes');
const feedbackRoutes     = require('./routes/feedbackRoutes');
const certificateRoutes  = require('./routes/certificateRoutes');
const hostelRoutes       = require('./routes/hostelRoutes');
const assignmentRoutes   = require('./routes/assignmentRoutes');
const alumniRoutes       = require('./routes/alumniRoutes');
const placementRoutes    = require('./routes/placementRoutes');
const mcqExamRoutes      = require('./routes/mcqExamRoutes');
const messageRoutes      = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const examRoutes         = require('./routes/examRoutes');
const chatbotRoutes      = require('./routes/chatbotRoutes');

// ── Load Environment Variables ──────────────────────────────────
dotenv.config();
const path = require('path');

const app = express();

// ── Middleware ──────────────────────────────────────────────────
// CORS: Allowed origins for frontend
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:5176',
      'http://127.0.0.1:3000',
    ];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// JSON & URL Encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files: Uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/students',      studentRoutes);
app.use('/api/courses',       courseRoutes);
app.use('/api/contacts',      contactRoutes);
app.use('/api/gallery',       galleryRoutes);
app.use('/api/faculty',       facultyRoutes);
app.use('/api/fees',          feeRoutes);
app.use('/api/notices',       noticeRoutes);
app.use('/api/results',       resultRoutes);
app.use('/api/attendance',    attendanceRoutes);
app.use('/api/timetable',     timetableRoutes);
app.use('/api/email',         emailRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/hall-tickets',  hallTicketRoutes);
app.use('/api/leaves',        leaveRoutes);
app.use('/api/library',       libraryRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/scholarships',  scholarshipRoutes);
app.use('/api/feedback',      feedbackRoutes);
app.use('/api/certificates',  certificateRoutes);
app.use('/api/hostels',       hostelRoutes);
app.use('/api/assignments',   assignmentRoutes);
app.use('/api/alumni',        alumniRoutes);
app.use('/api/placements',    placementRoutes);
app.use('/api/mcq-exams',     mcqExamRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exams',         examRoutes);
app.use('/api/chatbot',       chatbotRoutes);

// ── Health Check ────────────────────────────────────────────────
// GET /api/health → Server aur DB ka status check karo
app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  message: 'College API running',
  environment: process.env.NODE_ENV || 'development',
  database: {
    status: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  },
}));

// ── Error Middleware ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ── Start Server ────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    // DB fail hone par bhi server start hoga
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('⚠️ Starting server without database...');
  }

  const server = app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
    } else {
      console.error(`❌ Server failed to start: ${error.message}`);
    }
    process.exit(1);
  });
};

startServer();