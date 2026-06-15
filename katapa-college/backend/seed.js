// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: seed.js                                              ║
// ║  PATH: backend/seed.js                                      ║
// ║                                                              ║
// ║  KYA HAI YE FILE? (What is this file?)                       ║
// ║  → Ye database seeder hai — demo data dalne ke liye.         ║
// ║  → Run: `npm run seed` ya `node seed.js`                     ║
// ║  → Pehle purana data DELETE karta hai, phir naya dalta hai.  ║
// ║  → Admin user, student, courses, faculty, contacts — sab     ║
// ║    ka sample data create karta hai.                          ║
// ║                                                              ║
// ║  WARNING: Ye file chalane se existing data ud jayega!        ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User    = require('./models/User');
const Course  = require('./models/Course');
const Contact = require('./models/Contact');
const Student = require('./models/Student');
const Gallery = require('./models/Gallery');
const Faculty = require('./models/Faculty');
const Alumni = require('./models/Alumni');
const Notice = require('./models/Notice');
const Fee = require('./models/Fee');
const Attendance = require('./models/Attendance');
const Timetable = require('./models/Timetable');
const Result = require('./models/Result');
const Assignment = require('./models/Assignment');
const Leave = require('./models/Leave');
const Book = require('./models/Book');
const BookIssue = require('./models/BookIssue');
const Certificate = require('./models/Certificate');
const HallTicket = require('./models/HallTicket');
const Feedback = require('./models/Feedback');
const { Scholarship, ScholarshipApplication } = require('./models/Scholarship');
const Notification = require('./models/Notification');
const Exam = require('./models/Exam');
const MCQExam = require('./models/MCQExam');
const Conversation = require('./models/Message');
const Event = require('./models/Event');
const { Job, CompanyVisit, PlacementStats } = require('./models/Placement');

const connectDB = require('./config/db');

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await User.deleteMany();
  await Course.deleteMany();
  await Contact.deleteMany();
  await Student.deleteMany();
  await Gallery.deleteMany();
  await Faculty.deleteMany();
  await Alumni.deleteMany();
  await Notice.deleteMany();
  await Fee.deleteMany();
  await Attendance.deleteMany();
  await Timetable.deleteMany();
  await Result.deleteMany();
  await Assignment.deleteMany();
  await Leave.deleteMany();
  await Book.deleteMany();
  await BookIssue.deleteMany();
  await Certificate.deleteMany();
  await HallTicket.deleteMany();
  await Feedback.deleteMany();
  await Scholarship.deleteMany();
  await ScholarshipApplication.deleteMany();
  await Notification.deleteMany();
  await Exam.deleteMany();
  await MCQExam.deleteMany();
  await Conversation.deleteMany();
  await Event.deleteMany();
  await Job.deleteMany();
  await CompanyVisit.deleteMany();
  await PlacementStats.deleteMany();
  console.log('🗑️  Cleared existing data');

  // ── Seed Users ──────────────────────────────────────────────
  const users = await User.create([
    { name: 'Admin User', email: 'admin@kingswellinstitute.ac.ke', password: 'admin123', role: 'admin' },
    { name: 'Jane Student', email: 'student@kingswellinstitute.ac.ke', password: 'student123', role: 'user' },
  ]);
  console.log(`✅  Created ${users.length} users`);

  // ── Seed Courses (26 Total) ─────────────────────────────────
  const courses = await Course.create([
    // TECHNOLOGY (4)
    { title: 'BCA: Bachelor of Computer Applications', department: 'Technology', level: 'Undergraduate', duration: '3 Years', tuitionFee: 75000, enrollmentCount: 240, shortDescription: 'Industry-focused BCA programme covering core CS concepts, web development, and software engineering.', description: 'BCA programme covering data structures, web development, database management, and cutting-edge software engineering practices.', featured: true, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', requirements: ['KCSE minimum Grade B', 'Mathematics B+'], outcomes: ['Build web applications', 'Design databases', 'Apply software engineering'] },
    { title: 'B.Sc IT: Bachelor of Science in Information Technology', department: 'Technology', level: 'Undergraduate', duration: '3 Years', tuitionFee: 85000, enrollmentCount: 210, shortDescription: 'Comprehensive IT education with hands-on experience in networking, databases, and system administration.', description: 'B.Sc IT programme covering networking, cybersecurity, system administration, and IT infrastructure management.', featured: true, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', requirements: ['KCSE minimum Grade B', 'Mathematics B+'], outcomes: ['Manage IT networks', 'Implement cybersecurity', 'Administer systems'] },
    { title: 'MCA: Master of Computer Applications', department: 'Technology', level: 'Postgraduate', duration: '2 Years', tuitionFee: 120000, enrollmentCount: 85, shortDescription: 'Advanced computer applications degree focusing on AI, cloud computing, and distributed systems.', description: 'MCA programme covering artificial intelligence, cloud computing, distributed systems, and advanced data structures.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', requirements: ['Bachelor\'s degree', 'Mathematics background'], outcomes: ['Develop AI solutions', 'Deploy cloud applications', 'Design distributed systems'] },
    { title: 'M.Sc CS: Master of Science in Computer Science', department: 'Technology', level: 'Postgraduate', duration: '2 Years', tuitionFee: 125000, enrollmentCount: 70, shortDescription: 'Research-oriented M.Sc programme in computer science with specializations in emerging technologies.', description: 'M.Sc CS programme emphasizing research, specializations in machine learning, blockchain, and quantum computing.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', requirements: ['Bachelor\'s degree in CS'], outcomes: ['Conduct research', 'Publish papers', 'Develop innovations'] },

    // ENGINEERING (4)
    { title: 'B.Tech: Bachelor of Technology', department: 'Engineering', level: 'Undergraduate', duration: '4 Years', tuitionFee: 110000, enrollmentCount: 180, shortDescription: 'Four-year B.Tech programme with specializations in various engineering disciplines.', description: 'B.Tech programme with specializations in civil, mechanical, electrical, and computer engineering.', featured: true, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', requirements: ['KCSE minimum Grade B', 'Physics & Mathematics B+'], outcomes: ['Design engineering solutions', 'Manage projects', 'Innovate technologies'] },
    { title: 'B.E.: Bachelor of Engineering', department: 'Engineering', level: 'Undergraduate', duration: '4 Years', tuitionFee: 105000, enrollmentCount: 165, shortDescription: 'Traditional engineering degree programme emphasizing practical application and project work.', description: 'B.E. programme combining theory with practical engineering applications and industry projects.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', requirements: ['KCSE minimum Grade B', 'Physics & Mathematics B+'], outcomes: ['Build structures', 'Solve real problems', 'Lead teams'] },
    { title: 'B.Arch: Bachelor of Architecture', department: 'Engineering', level: 'Undergraduate', duration: '5 Years', tuitionFee: 125000, enrollmentCount: 95, shortDescription: 'Five-year architecture programme with design studio, history, and professional practice modules.', description: 'B.Arch programme covering design principles, architectural history, sustainable design, and professional practice.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', requirements: ['KCSE minimum Grade B', 'Art/Design skills'], outcomes: ['Design buildings', 'Plan projects', 'Manage sites'] },
    { title: 'M.Tech: Master of Technology', department: 'Engineering', level: 'Postgraduate', duration: '2 Years', tuitionFee: 130000, enrollmentCount: 60, shortDescription: 'Specialized M.Tech degree with focus on advanced engineering topics and research projects.', description: 'M.Tech programme with specializations in advanced areas and industry-sponsored research projects.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80', requirements: ['Bachelor\'s degree in Engineering'], outcomes: ['Conduct research', 'Develop innovations', 'Lead technical teams'] },

    // BUSINESS (4)
    { title: 'BBA: Bachelor of Business Administration', department: 'Business', level: 'Undergraduate', duration: '3 Years', tuitionFee: 65000, enrollmentCount: 220, shortDescription: 'Three-year BBA programme covering management, economics, marketing, and business strategy.', description: 'BBA programme covering management principles, organizational behavior, marketing, finance, and business strategy.', featured: true, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', requirements: ['KCSE minimum Grade C+'], outcomes: ['Manage organizations', 'Analyze markets', 'Create strategies'] },
    { title: 'BMS: Bachelor of Management Studies', department: 'Business', level: 'Undergraduate', duration: '3 Years', tuitionFee: 62000, enrollmentCount: 200, shortDescription: 'Industry-aligned BMS programme with focus on organizational behavior and business management.', description: 'BMS programme emphasizing organizational behavior, human resources, and business management practices.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', requirements: ['KCSE minimum Grade C+'], outcomes: ['Lead teams', 'Manage change', 'Develop people'] },
    { title: 'MBA: Master of Business Administration', department: 'Business', level: 'Postgraduate', duration: '2 Years', tuitionFee: 150000, enrollmentCount: 60, shortDescription: 'Prestigious MBA programme with global perspective, case studies, and industry partnerships.', description: 'MBA programme designed for professionals, covering advanced management, global business, and strategic leadership.', featured: true, mode: 'Part-time', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', requirements: ['Bachelor\'s degree', '2+ years experience'], outcomes: ['Lead companies', 'Drive growth', 'Manage globally'] },
    { title: 'PGDM: Post Graduate Diploma in Management', department: 'Business', level: 'Postgraduate', duration: '2 Years', tuitionFee: 140000, enrollmentCount: 50, shortDescription: 'PGDM programme equivalent to MBA with focus on practical management skills and placements.', description: 'PGDM programme focusing on practical management skills, industry exposure, and 100% placement assistance.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80', requirements: ['Bachelor\'s degree'], outcomes: ['Master management', 'Secure jobs', 'Advance careers'] },

    // FINANCE (4)
    { title: 'B.Com: Bachelor of Commerce', department: 'Finance', level: 'Undergraduate', duration: '3 Years', tuitionFee: 55000, enrollmentCount: 280, shortDescription: 'Traditional B.Com degree covering accounting, finance, taxation, and business law.', description: 'B.Com programme covering financial accounting, auditing, taxation, business law, and economics.', featured: true, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80', requirements: ['KCSE minimum Grade C+'], outcomes: ['Prepare accounts', 'Analyze finances', 'Manage taxes'] },
    { title: 'BAF: Bachelor of Commerce in Accounting & Finance', department: 'Finance', level: 'Undergraduate', duration: '3 Years', tuitionFee: 65000, enrollmentCount: 150, shortDescription: 'Specialized B.Com with focus on advanced accounting, auditing, and financial management.', description: 'BAF programme with specialization in advanced accounting, auditing, financial analysis, and investment management.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80', requirements: ['KCSE minimum Grade B'], outcomes: ['Audit accounts', 'Manage investments', 'Advise clients'] },
    { title: 'M.Com: Master of Commerce', department: 'Finance', level: 'Postgraduate', duration: '2 Years', tuitionFee: 95000, enrollmentCount: 70, shortDescription: 'Advanced commerce studies with specializations in accounting, finance, and taxation.', description: 'M.Com programme covering advanced accounting, financial management, taxation, and research methodology.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80', requirements: ['B.Com degree'], outcomes: ['Conduct research', 'Teach commerce', 'Advise organizations'] },
    { title: 'CA: Chartered Accountant', department: 'Finance', level: 'Certificate', duration: '5 Years', tuitionFee: 180000, enrollmentCount: 40, shortDescription: 'Professional CA course with rigorous training in accounting, auditing, and tax law.', description: 'CA professional qualification covering accounting standards, auditing, taxation, and business law.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80', requirements: ['High school diploma'], outcomes: ['Become CA', 'Audit firms', 'Advise companies'] },

    // HEALTH SCIENCES (4)
    { title: 'MBBS: Bachelor of Medicine & Bachelor of Surgery', department: 'Health Sciences', level: 'Undergraduate', duration: '5.5 Years', tuitionFee: 200000, enrollmentCount: 80, shortDescription: 'Comprehensive medical education with clinical rotations at affiliated teaching hospitals.', description: 'MBBS programme with comprehensive medical training, clinical rotations, and research in modern hospitals.', featured: true, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80', requirements: ['KCSE minimum Grade A', 'Biology & Chemistry A'], outcomes: ['Diagnose diseases', 'Treat patients', 'Conduct research'] },
    { title: 'B.Pharm: Bachelor of Pharmacy', department: 'Health Sciences', level: 'Undergraduate', duration: '4 Years', tuitionFee: 90000, enrollmentCount: 120, shortDescription: 'Four-year pharmacy degree covering pharmaceutical sciences, clinical pharmacy, and drug development.', description: 'B.Pharm programme covering pharmaceutical sciences, pharmacology, clinical pharmacy, and drug development.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80', requirements: ['KCSE minimum Grade B', 'Chemistry B+'], outcomes: ['Dispense medicines', 'Counsel patients', 'Develop drugs'] },
    { title: 'B.Sc Nursing: Bachelor of Science in Nursing', department: 'Health Sciences', level: 'Undergraduate', duration: '4 Years', tuitionFee: 85000, enrollmentCount: 130, shortDescription: 'Evidence-based nursing education with hands-on clinical rotations at leading health facilities.', description: 'B.Sc Nursing programme covering nursing theory, clinical practice, and patient care at world-class health facilities.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80', requirements: ['KCSE minimum Grade B', 'Biology & Chemistry B'], outcomes: ['Care for patients', 'Manage wards', 'Lead teams'] },
    { title: 'MD/MS: Doctor of Medicine & Master of Surgery', department: 'Health Sciences', level: 'Postgraduate', duration: '3 Years', tuitionFee: 220000, enrollmentCount: 30, shortDescription: 'Postgraduate medical specialization with advanced clinical training and research opportunities.', description: 'MD/MS specialization programmes with advanced clinical training in surgical and medical specialties.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80', requirements: ['MBBS degree', '1+ years internship'], outcomes: ['Specialize in surgery', 'Lead departments', 'Teach doctors'] },

    // LAW (3)
    { title: 'BA LLB: Bachelor of Arts & Bachelor of Laws', department: 'Law', level: 'Undergraduate', duration: '5 Years', tuitionFee: 80000, enrollmentCount: 100, shortDescription: 'Integrated five-year law degree combining liberal arts with comprehensive legal education.', description: 'BA LLB integrated programme combining arts education with comprehensive legal training covering all law areas.', featured: true, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80', requirements: ['KCSE minimum Grade B'], outcomes: ['Practice law', 'Represent clients', 'Draft agreements'] },
    { title: 'LLB: Bachelor of Laws', department: 'Law', level: 'Undergraduate', duration: '3 Years', tuitionFee: 60000, enrollmentCount: 140, shortDescription: 'Three-year law degree covering criminal, civil, constitutional, and commercial law.', description: 'LLB programme covering criminal law, civil law, constitutional law, commercial law, and legal practice.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80', requirements: ['KCSE minimum Grade C+'], outcomes: ['Practice law', 'Advise clients', 'Advocate in court'] },
    { title: 'LLM: Master of Laws', department: 'Law', level: 'Postgraduate', duration: '2 Years', tuitionFee: 110000, enrollmentCount: 50, shortDescription: 'Advanced law studies with specializations in intellectual property, international law, and corporate law.', description: 'LLM programme with specializations in international law, corporate law, intellectual property, and human rights.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80', requirements: ['LLB degree'], outcomes: ['Specialize in law', 'Teach law', 'Lead firms'] },

    // ARTS (3)
    { title: 'B.A.: Bachelor of Arts', department: 'Arts', level: 'Undergraduate', duration: '3 Years', tuitionFee: 40000, enrollmentCount: 350, shortDescription: 'Three-year arts degree with diverse subject combinations in humanities and social sciences.', description: 'B.A. programme offering diverse subject combinations in humanities, social sciences, languages, and history.', featured: true, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', requirements: ['KCSE minimum Grade C'], outcomes: ['Earn degree', 'Teach subjects', 'Research topics'] },
    { title: 'BJMC: Bachelor of Journalism & Mass Communication', department: 'Arts', level: 'Undergraduate', duration: '3 Years', tuitionFee: 55000, enrollmentCount: 100, shortDescription: 'Specialized journalism degree with hands-on training in print, broadcast, and digital media.', description: 'BJMC programme providing hands-on training in journalism, broadcasting, digital media, and communication.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', requirements: ['KCSE minimum Grade C+'], outcomes: ['Report news', 'Create content', 'Manage media'] },
    { title: 'M.A.: Master of Arts', department: 'Arts', level: 'Postgraduate', duration: '2 Years', tuitionFee: 65000, enrollmentCount: 70, shortDescription: 'Postgraduate arts programme with research focus and specializations in various disciplines.', description: 'M.A. programme emphasizing research, with specializations in literature, history, philosophy, and social sciences.', featured: false, mode: 'Full-time', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80', requirements: ['Bachelor\'s degree in Arts'], outcomes: ['Conduct research', 'Publish papers', 'Teach at university'] },
  ]);
  console.log(`✅  Created ${courses.length} courses`);

  // ── Seed Contacts ───────────────────────────────────────────
  await Contact.create([
    { name: 'Mary Kamau', email: 'mary@example.com', subject: 'Admission Inquiry', message: 'Hello, I would like to know the requirements for the BSc Computer Science programme.', status: 'unread' },
    { name: 'David Ochieng', email: 'david@example.com', subject: 'Fee Structure', message: 'Please send me the full fee breakdown for the Diploma in Business Administration.', status: 'read' },
  ]);
  console.log('✅  Created contact enquiries');

  // ── Seed Faculty (9 Members) ────────────────────────────────
  const faculty = await Faculty.create([
    { name: 'Dr. James Mwangi',    title: 'HOD',                 dept: 'Technology',     edu: 'PhD Computer Science – University of Nairobi',          bio: 'Expert in software engineering and artificial intelligence with 18 years of academic and research experience.',        email: 'j.mwangi@kingswellinstitute.ac.ke',    order: 1, isActive: true },
    { name: 'Prof. Amina Hassan',  title: 'Professor',           dept: 'Business',        edu: 'PhD Business Administration – Strathmore University',   bio: 'Renowned business strategist and author with expertise in organizational behavior and corporate governance.',          email: 'a.hassan@kingswellinstitute.ac.ke',    order: 2, isActive: true },
    { name: 'Dr. Kevin Otieno',    title: 'Associate Professor', dept: 'Engineering',     edu: 'PhD Electrical Engineering – Technical University of Kenya', bio: 'Specializes in renewable energy systems and electrical infrastructure with 12 years of industry experience.',      email: 'k.otieno@kingswellinstitute.ac.ke',    order: 3, isActive: true },
    { name: 'Dr. Grace Njeri',     title: 'Senior Lecturer',     dept: 'Health Sciences', edu: 'MBChB, PhD – University of Nairobi Medical School',     bio: 'Practicing physician and researcher in public health, epidemiology, and community medicine.',                         email: 'g.njeri@kingswellinstitute.ac.ke',     order: 4, isActive: true },
    { name: 'Mr. Peter Kamau',     title: 'Lecturer',            dept: 'Finance',         edu: 'MBA Finance – USIU Africa, CPA Kenya',                  bio: 'Certified public accountant and financial analyst with 10 years of corporate finance experience.',                    email: 'p.kamau@kingswellinstitute.ac.ke',     order: 5, isActive: true },
    { name: 'Dr. Sarah Wanjiku',   title: 'Assistant Professor', dept: 'Law',             edu: 'LLB, LLM, PhD – University of Nairobi School of Law',   bio: 'Specializes in constitutional law, human rights, and corporate governance with extensive publication record.',          email: 's.wanjiku@kingswellinstitute.ac.ke',   order: 6, isActive: true },
    { name: 'Ms. Fatuma Ali',      title: 'Lecturer',            dept: 'Arts',            edu: 'MA Mass Communication – Kenyatta University',           bio: 'Accomplished journalist and media trainer with hands-on experience in broadcast and digital media.',                  email: 'f.ali@kingswellinstitute.ac.ke',       order: 7, isActive: true },
    { name: 'Dr. Samuel Kipchoge', title: 'Associate Professor', dept: 'Technology',      edu: 'PhD Information Systems – Jomo Kenyatta University',    bio: 'Expert in cybersecurity, network administration, and cloud computing infrastructure.',                               email: 's.kipchoge@kingswellinstitute.ac.ke',  order: 8, isActive: true },
    { name: 'Prof. Diana Odhiambo',title: 'Professor',           dept: 'Health Sciences', edu: 'PhD Nursing Science – Aga Khan University',             bio: 'Pioneer in evidence-based nursing practice with over 20 years of clinical and academic contributions.',               email: 'd.odhiambo@kingswellinstitute.ac.ke',  order: 9, isActive: true },
  ]);
  console.log(`✅  Created ${faculty.length} faculty members`);

  // ── Seed Gallery ────────────────────────────────────────────
  await Gallery.create([
    {
      title: 'Campus Front View',
      description: 'Main entrance and reception block of Kingswell College.',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
      category: 'Campus',
      featured: true,
      uploadedBy: users[0]._id,
    },
    {
      title: 'Computer Lab Session',
      description: 'Students practicing modern web development in the lab.',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
      category: 'Academics',
      featured: true,
      uploadedBy: users[0]._id,
    },
    {
      title: 'Annual Sports Day',
      description: 'Inter-house sports competition and cultural celebration.',
      imageUrl: 'https://images.unsplash.com/photo-1521417531051-b36b8d8e0f3b?w=1200&q=80',
      category: 'Sports',
      featured: false,
      uploadedBy: users[0]._id,
    },
  ]);
  console.log('✅  Created gallery images');

  // ── Seed Alumni ─────────────────────────────────────────────
  await Alumni.create([
    {
      name: 'Aisha Karim',
      email: 'aisha.karim@alumni.example',
      batch: '2022',
      course: 'BCA',
      currentJob: 'Frontend Developer',
      company: 'Nairobi Tech Labs',
      location: 'Nairobi',
      bio: 'Works on modern web apps and mentors current students.',
      linkedin: 'https://linkedin.com/in/aishakarim',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    },
    {
      name: 'Brian Otieno',
      email: 'brian.otieno@alumni.example',
      batch: '2021',
      course: 'BBA',
      currentJob: 'Operations Manager',
      company: 'Coastline Logistics',
      location: 'Mombasa',
      bio: 'Manages operations and helps with placement drives.',
      linkedin: 'https://linkedin.com/in/brianotieno',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
    {
      name: 'Grace Wanjiru',
      email: 'grace.wanjiru@alumni.example',
      batch: '2020',
      course: 'B.Sc Nursing',
      currentJob: 'Senior Nurse',
      company: 'City Care Hospital',
      location: 'Nakuru',
      bio: 'Leading clinical care and training junior nurses.',
      linkedin: 'https://linkedin.com/in/gracewanjiru',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    },
  ]);
  console.log('✅  Created alumni records');

  const adminUser = users[0];
  const studentUser = users[1];
  const primaryCourse = courses[0];
  const now = new Date();
  const semester = `Semester 1 - ${now.getFullYear()}`;
  const addDays = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  // ── Seed Notice Board ───────────────────────────────────────
  await Notice.create([
    {
      title: 'Semester 1 Timetable Published',
      message: 'The official Semester 1 timetable is now available in the timetable section. Please check your class timings and room allocations.',
      category: 'exam',
      pinned: true,
      expiresAt: addDays(14),
      createdBy: adminUser._id,
    },
    {
      title: 'College Closed for Public Holiday',
      message: 'The college will remain closed on Friday due to the national public holiday. Regular classes will resume on Monday.',
      category: 'holiday',
      pinned: false,
      expiresAt: addDays(10),
      createdBy: adminUser._id,
    },
    {
      title: 'Library Late Fine Waiver Week',
      message: 'Students can return overdue library books this week without any late fine. Please use this opportunity to clear pending issues.',
      category: 'urgent',
      pinned: true,
      expiresAt: addDays(7),
      createdBy: adminUser._id,
    },
  ]);
  console.log('✅  Created public notices');

  // ── Seed Events ─────────────────────────────────────────────
  await Event.create([
    {
      title: 'Orientation Week 2026',
      description: 'Welcome sessions, campus tours, and program introductions for new students.',
      category: 'academic',
      startDate: addDays(-2),
      endDate: addDays(0),
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      venue: 'Main Auditorium',
      organizer: 'Student Affairs',
      featured: true,
      status: 'ongoing',
      createdBy: adminUser._id,
    },
    {
      title: 'Tech Expo & Project Showcase',
      description: 'Final year students present their capstone projects to faculty and industry guests.',
      category: 'workshop',
      startDate: addDays(8),
      endDate: addDays(8),
      startTime: '09:30 AM',
      endTime: '03:30 PM',
      venue: 'Engineering Block',
      organizer: 'Department of Technology',
      featured: true,
      status: 'upcoming',
      createdBy: adminUser._id,
    },
    {
      title: 'Annual Sports Day',
      description: 'Track events, team games, and cultural performances across all departments.',
      category: 'sports',
      startDate: addDays(18),
      endDate: addDays(18),
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      venue: 'College Grounds',
      organizer: 'Sports Committee',
      featured: false,
      status: 'upcoming',
      createdBy: adminUser._id,
    },
  ]);
  console.log('✅  Created events');

  // ── Seed Placement Data ─────────────────────────────────────
  await Job.create([
    {
      title: 'Junior Software Engineer',
      company: 'CloudNine Systems',
      description: 'Entry-level software engineering role for campus recruits.',
      location: 'Nairobi',
      salary: 'KSh 70,000 - 95,000',
      eligibility: 'BCA / BSc IT graduates',
      applyLink: 'https://example.com/jobs/junior-software-engineer',
      deadline: addDays(30),
    },
    {
      title: 'Business Analyst',
      company: 'Prime Advisory',
      description: 'Operations and analytics role for business students.',
      location: 'Mombasa',
      salary: 'KSh 60,000 - 85,000',
      eligibility: 'BBA / BMS graduates',
      applyLink: 'https://example.com/jobs/business-analyst',
      deadline: addDays(24),
    },
  ]);

  await CompanyVisit.create([
    {
      company: 'TechNova Ltd',
      visitDate: addDays(12),
      description: 'Campus hiring and internship briefing session.',
      contactPerson: 'Sarah Kimani',
    },
    {
      company: 'Greenfield Health',
      visitDate: addDays(19),
      description: 'Hiring for health sciences internships and entry roles.',
      contactPerson: 'Dr. Peter Mwangi',
    },
  ]);

  await PlacementStats.create([
    {
      year: now.getFullYear(),
      totalStudents: 420,
      placed: 352,
      highestPackage: 'KSh 220,000',
      averagePackage: 'KSh 92,000',
      companiesVisited: 18,
    },
  ]);
  console.log('✅  Created alumni, event, and placement data');

  // ── Seed a fully linked student profile ─────────────────────
  const student = await Student.create({
    firstName: 'Jane',
    lastName: 'Student',
    email: studentUser.email,
    phone: '+91 98765 43210',
    dateOfBirth: new Date('2004-06-15'),
    gender: 'Female',
    address: '12 Demo Street',
    city: 'Bengaluru',
    country: 'India',
    courseApplied: primaryCourse._id,
    previousSchool: 'Demo Public School',
    previousGrade: 'A',
    profilePhoto: '',
    status: 'accepted',
    applicationDate: now,
    admissionNumber: `ADM-${now.getFullYear()}-001`,
    user: studentUser._id,
  });
  console.log('✅  Created linked student profile');

  // ── Student-facing demo records ─────────────────────────────
  await Fee.create({
    student: student._id,
    feeType: 'tuition',
    semester,
    totalAmount: 75000,
    dueDate: addDays(30),
    waiverAmount: 0,
    transactions: [
      {
        amount: 25000,
        method: 'mpesa',
        reference: 'MPESA-DEMO-001',
        note: 'Initial installment',
        recordedBy: adminUser._id,
        paidAt: now,
      },
    ],
  });

  await Attendance.create({
    date: now,
    subject: 'Programming Fundamentals',
    semester,
    records: [{ student: student._id, status: 'present' }],
    markedBy: adminUser._id,
  });

  await Timetable.create({
    day: 'Monday',
    subject: 'Web Development',
    teacher: 'Dr. James Mwangi',
    room: 'Lab A-01',
    startTime: '09:00',
    endTime: '11:00',
    semester,
    course: primaryCourse._id,
    type: 'lab',
  });

  const result = await Result.create({
    student: student._id,
    semester,
    examType: 'final',
    subjects: [
      { subject: 'Web Development', marksObtained: 82, totalMarks: 100 },
      { subject: 'Database Systems', marksObtained: 76, totalMarks: 100 },
    ],
    remarks: 'Good performance',
    publishedAt: now,
  });

  const assignment = await Assignment.create({
    title: 'Build a Student Portal',
    description: 'Create a responsive student portal with login, dashboard, and profile page.',
    course: primaryCourse._id,
    subject: 'Web Development',
    dueDate: addDays(7),
    totalMarks: 100,
    type: 'project',
    assignedDate: now,
    createdBy: adminUser._id,
  });

  const leave = await Leave.create({
    student: student._id,
    leaveType: 'casual',
    subject: 'Family Function',
    reason: 'Need to attend a family function out of town.',
    startDate: addDays(2),
    endDate: addDays(3),
    status: 'pending',
  });

  const book = await Book.create({
    title: 'Modern Web Development',
    author: 'A. Sharma',
    isbn: '9780000000010',
    category: 'textbook',
    publisher: 'Demo Press',
    publishYear: 2024,
    description: 'Introductory web development textbook.',
    totalCopies: 10,
    availableCopies: 9,
    shelfLocation: 'IT-101',
  });

  await BookIssue.create({
    book: book._id,
    student: student._id,
    dueDate: addDays(14),
    status: 'issued',
    remarks: 'Handle with care',
  });

  await Certificate.create({
    student: student._id,
    certificateNo: `KIT-CERT-${now.getFullYear()}-00001`,
    type: 'course-completion',
    title: 'Certificate of Achievement',
    description: 'Awarded for excellent performance in the demo semester.',
    issueDate: now,
    validUntil: null,
    grade: 'A',
    courseName: primaryCourse.title,
    semester,
    status: 'active',
    issuedBy: adminUser._id,
  });

  const hallTicket = await HallTicket.create({
    examName: 'Semester End Examination',
    examType: 'final',
    semester,
    course: primaryCourse._id,
    startDate: addDays(21),
    endDate: addDays(26),
    reportTime: '09:00 AM',
    venue: 'Main Examination Hall',
    subjects: ['Web Development', 'Database Systems', 'Computer Networks'],
    instructions: 'Bring your student ID card. No electronic devices allowed.',
    seats: [{ student: student._id, seatNumber: 'A-101' }],
    isPublished: true,
  });

  const scholarship = await Scholarship.create({
    name: 'Merit Excellence Scholarship',
    description: 'Awarded to high-performing students for academic excellence.',
    category: 'merit',
    amount: 15000,
    seats: 20,
    eligibility: 'Students with strong academic performance and regular attendance.',
    deadline: addDays(20),
    isActive: true,
    createdBy: adminUser._id,
  });

  await ScholarshipApplication.create({
    scholarship: scholarship._id,
    student: student._id,
    reason: 'To support tuition expenses and continue performing well.',
    documents: 'Income certificate and marksheet attached.',
    cgpa: 8.7,
    familyIncome: 240000,
    status: 'pending',
  });

  await Notification.create({
    user: studentUser._id,
    type: 'notice',
    title: 'Welcome to Kingswell College',
    message: 'Your student profile is ready. You can now access fees, timetable, results, and exams.',
    data: { studentId: student._id.toString() },
  });

  await MCQExam.create({
    title: 'Computer Basics Quiz',
    description: 'Quick MCQ practice quiz for first-year students.',
    duration: 15,
    isActive: true,
    questions: [
      {
        question: 'Which one is a programming language?',
        options: ['HTML', 'CSS', 'JavaScript', 'Markdown'],
        correctOption: 2,
      },
      {
        question: 'Which device is used to connect networks?',
        options: ['Monitor', 'Router', 'Printer', 'Keyboard'],
        correctOption: 1,
      },
      {
        question: 'RAM is mainly used for:',
        options: ['Permanent storage', 'Temporary working memory', 'Printing', 'Scanning'],
        correctOption: 1,
      },
    ],
  });

  await Exam.create({
    title: 'Web Development Midterm',
    description: 'Covers HTML, CSS, and JavaScript fundamentals.',
    course: primaryCourse._id,
    subject: 'Web Development',
    duration: 60,
    totalMarks: 50,
    passingMarks: 20,
    questions: [
      {
        questionText: 'What does HTML stand for?',
        options: [
          'HyperText Markup Language',
          'High Text Machine Language',
          'Hyper Tool Markup Language',
          'Home Tool Markup Language',
        ],
        correctOption: 0,
        marks: 5,
      },
      {
        questionText: 'Which symbol is used for IDs in CSS?',
        options: ['.', '#', '*', '@'],
        correctOption: 1,
        marks: 5,
      },
      {
        questionText: 'Which method converts JSON text into a JavaScript object?',
        options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.object()'],
        correctOption: 1,
        marks: 5,
      },
    ],
    startTime: addDays(-1),
    endTime: addDays(7),
    isPublished: true,
    isActive: true,
  });

  await Conversation.create({
    student: student._id,
    studentUser: studentUser._id,
    subject: 'Admission and Fees',
    messages: [
      {
        sender: 'student',
        senderUser: studentUser._id,
        text: 'Hello, I would like to ask about my fee payment schedule.',
        readByStudent: true,
        readByAdmin: false,
      },
      {
        sender: 'admin',
        senderUser: adminUser._id,
        text: 'Sure, your installment plan is visible in the Fees section.',
        readByStudent: false,
        readByAdmin: true,
      },
    ],
    status: 'active',
    lastMessageAt: now,
    unreadByAdmin: 0,
    unreadByStudent: 1,
  });

  await Feedback.create({
    student: student._id,
    category: 'course',
    subject: 'Web Development Lab',
    message: 'The lab setup is very practical and helps in understanding frontend and backend concepts clearly.',
    rating: 5,
    anonymous: false,
    status: 'reviewed',
  });

  console.log('✅  Created demo fee, attendance, timetable, result, assignment, leave, library, certificate, hall ticket, scholarship, exam, feedback, notice, and chat data');

  console.log('\n🎉  Database seeded successfully!');
  console.log('👤  Admin: admin@kingswellinstitute.ac.ke / admin123');
  console.log('👤  Student: student@kingswellinstitute.ac.ke / student123');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
