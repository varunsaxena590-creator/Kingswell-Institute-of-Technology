// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: App.jsx                                             ║
// ║  PATH: frontend/src/App.jsx                                ║
// ║                                                            ║
// ║  KYA HAI YE FILE?                                          ║
// ║  → Ye poore frontend ka MAIN routing file hai.             ║
// ║  → React Router se saare pages/routes define hote hain.    ║
// ║  → Public routes (Home, Courses, etc.) aur                 ║
// ║    Protected routes (Admin, Profile, etc.) yahi set hain.  ║
// ║  → AuthContext se login state check karta hai.             ║
// ╚══════════════════════════════════════════════════════════════╝
// src/App.jsx — Route Configuration
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Loader from './components/Loader';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Courses = lazy(() => import('./pages/Courses'));
const Faculty = lazy(() => import('./pages/Faculty'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Admission = lazy(() => import('./pages/Admission'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PublicNotices = lazy(() => import('./pages/Notices'));
const MyFees = lazy(() => import('./pages/MyFees'));
const MyResults = lazy(() => import('./pages/MyResults'));
const MyAttendance = lazy(() => import('./pages/MyAttendance'));
const MyIdCard = lazy(() => import('./pages/MyIdCard'));
const MyTimetable = lazy(() => import('./pages/MyTimetable'));
const MyHallTicket = lazy(() => import('./pages/MyHallTicket'));
const MyLeave = lazy(() => import('./pages/MyLeave'));
const MyLibrary = lazy(() => import('./pages/MyLibrary'));
const Events = lazy(() => import('./pages/Events'));
const AlumniPortal = lazy(() => import('./pages/AlumniPortal'));
const Placements = lazy(() => import('./pages/Placements'));
const MCQExam = lazy(() => import('./pages/MCQExam'));
const FAQChatbotPage = lazy(() => import('./pages/Chatbot'));
const MyScholarships = lazy(() => import('./pages/MyScholarships'));
const MyFeedback = lazy(() => import('./pages/MyFeedback'));
const MyCertificates = lazy(() => import('./pages/MyCertificates'));
const MyAssignments = lazy(() => import('./pages/MyAssignments'));
const MyExams = lazy(() => import('./pages/MyExams'));
const MyChat = lazy(() => import('./pages/MyChat'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));

// Admin pages
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const Students = lazy(() => import('./admin/Students'));
const AddCourse = lazy(() => import('./admin/AddCourse'));
const ManageCourses = lazy(() => import('./admin/ManageCourses'));
const ManageFaculty = lazy(() => import('./admin/ManageFaculty'));
const Contacts = lazy(() => import('./admin/Contacts'));
const UploadGallery = lazy(() => import('./admin/UploadGallery'));
const Fees = lazy(() => import('./admin/Fees'));
const AdminNotices = lazy(() => import('./admin/Notices'));
const Results = lazy(() => import('./admin/Results'));
const Attendance = lazy(() => import('./admin/Attendance'));
const Timetable = lazy(() => import('./admin/Timetable'));
const Emails = lazy(() => import('./admin/Emails'));
const Analytics = lazy(() => import('./admin/Analytics'));
const HallTickets = lazy(() => import('./admin/HallTickets'));
const LeaveManagement = lazy(() => import('./admin/LeaveManagement'));
const Library = lazy(() => import('./admin/Library'));
const EventCalendar = lazy(() => import('./admin/EventCalendar'));
const Scholarships = lazy(() => import('./admin/Scholarships'));
const FeedbackManagement = lazy(() => import('./admin/FeedbackManagement'));
const Certificates = lazy(() => import('./admin/Certificates'));
const HostelManagement = lazy(() => import('./admin/HostelManagement'));
const Assignments = lazy(() => import('./admin/Assignments'));
const ExamManagement = lazy(() => import('./admin/ExamManagement'));
const AdminChat = lazy(() => import('./admin/AdminChat'));
const ChatbotFaqs = lazy(() => import('./admin/ChatbotFaqs'));
const AdminPlacements = lazy(() => import('./admin/Placements'));
const FloatingChatbot = lazy(() => import('./components/Chatbot'));

// ── Private Route Guard ────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
};

// ── Admin Route Guard ──────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <>
      <Suspense fallback={<Loader />}>
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/events" element={<Events />} />
        <Route path="/notices" element={<PublicNotices />} />
        <Route path="/alumni" element={<AlumniPortal />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/chatbot" element={<FAQChatbotPage />} />
        <Route path="/mcq-exams" element={<MCQExam />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-fees" element={<PrivateRoute><MyFees /></PrivateRoute>} />
        <Route path="/my-results" element={<PrivateRoute><MyResults /></PrivateRoute>} />
        <Route path="/my-attendance" element={<PrivateRoute><MyAttendance /></PrivateRoute>} />
        <Route path="/my-id-card" element={<PrivateRoute><MyIdCard /></PrivateRoute>} />
        <Route path="/my-timetable" element={<PrivateRoute><MyTimetable /></PrivateRoute>} />
        <Route path="/my-hall-ticket" element={<PrivateRoute><MyHallTicket /></PrivateRoute>} />
        <Route path="/my-leave" element={<PrivateRoute><MyLeave /></PrivateRoute>} />
        <Route path="/my-library" element={<PrivateRoute><MyLibrary /></PrivateRoute>} />
        <Route path="/my-scholarships" element={<PrivateRoute><MyScholarships /></PrivateRoute>} />
        <Route path="/my-feedback" element={<PrivateRoute><MyFeedback /></PrivateRoute>} />
        <Route path="/my-certificates" element={<PrivateRoute><MyCertificates /></PrivateRoute>} />
        <Route path="/my-assignments" element={<PrivateRoute><MyAssignments /></PrivateRoute>} />
        <Route path="/my-exams" element={<PrivateRoute><MyExams /></PrivateRoute>} />
        <Route path="/my-chat" element={<PrivateRoute><MyChat /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="courses/add" element={<AddCourse />} />
          <Route path="courses/manage" element={<ManageCourses />} />
          <Route path="faculty" element={<ManageFaculty />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="gallery/upload" element={<UploadGallery />} />
          <Route path="fees" element={<Fees />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="results" element={<Results />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="emails" element={<Emails />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="hall-tickets" element={<HallTickets />} />
          <Route path="leaves" element={<LeaveManagement />} />
          <Route path="library" element={<Library />} />
          <Route path="events" element={<EventCalendar />} />
          <Route path="scholarships" element={<Scholarships />} />
          <Route path="feedback" element={<FeedbackManagement />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="hostel" element={<HostelManagement />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="placements" element={<AdminPlacements />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="chatbot-faqs" element={<ChatbotFaqs />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Suspense fallback={null}>
        <FloatingChatbot />
      </Suspense>
    <PWAInstallPrompt />
    </>
  );
}
