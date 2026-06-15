// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Courses.jsx (Public Page)                            ║
// ║  PATH: frontend/src/pages/Courses.jsx                       ║
// ║                                                              ║
// ║  KYA HAI? → All courses listing page.                        ║
// ║  → Department wise filter aur search karna.                 ║
// ║  → CourseCard component se courses dikhata hai.             ║
// ║  → Route: /courses                                          ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/Courses.jsx — Courses Listing Page
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import SectionHeader from '../components/SectionHeader';
import Loader from '../components/Loader';
import api from '../utils/axios';

const LEVELS = ['All', 'Certificate', 'Diploma', 'Undergraduate', 'Postgraduate', 'Professional'];
const DEPARTMENTS = ['All', 'Technology', 'Business', 'Health Sciences', 'Law', 'Finance', 'Engineering', 'Arts'];

// Fallback static courses for when the API is not connected
export const STATIC_COURSES = [
  // ── Technology (4) ──
  { _id: '1', title: 'BCA: Bachelor of Computer Applications', department: 'Technology', level: 'Undergraduate', duration: '3 Years', tuitionFee: 75000, enrollmentCount: 240, shortDescription: 'Industry-focused BCA programme covering core CS concepts, web development, and software engineering.', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80' },
  { _id: '2', title: 'B.Sc IT: Bachelor of Science in Information Technology', department: 'Technology', level: 'Undergraduate', duration: '3 Years', tuitionFee: 85000, enrollmentCount: 210, shortDescription: 'Comprehensive IT education with hands-on experience in networking, databases, and system administration.', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80' },
  { _id: '3', title: 'MCA: Master of Computer Applications', department: 'Technology', level: 'Postgraduate', duration: '2 Years', tuitionFee: 120000, enrollmentCount: 85, shortDescription: 'Advanced computer applications degree focusing on AI, cloud computing, and distributed systems.', image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80' },
  { _id: '4', title: 'M.Sc CS: Master of Science in Computer Science', department: 'Technology', level: 'Postgraduate', duration: '2 Years', tuitionFee: 125000, enrollmentCount: 70, shortDescription: 'Research-oriented M.Sc programme in computer science with specializations in emerging technologies.', image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80' },

  // ── Engineering (4) ──
  { _id: '5', title: 'B.Tech: Bachelor of Technology', department: 'Engineering', level: 'Undergraduate', duration: '4 Years', tuitionFee: 110000, enrollmentCount: 180, shortDescription: 'Four-year B.Tech programme with specializations in various engineering disciplines.', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80' },
  { _id: '6', title: 'B.E.: Bachelor of Engineering', department: 'Engineering', level: 'Undergraduate', duration: '4 Years', tuitionFee: 105000, enrollmentCount: 165, shortDescription: 'Traditional engineering degree programme emphasizing practical application and project work.', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80' },
  { _id: '7', title: 'B.Arch: Bachelor of Architecture', department: 'Engineering', level: 'Undergraduate', duration: '5 Years', tuitionFee: 125000, enrollmentCount: 95, shortDescription: 'Five-year architecture programme with design studio, history, and professional practice modules.', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80' },
  { _id: '8', title: 'M.Tech: Master of Technology', department: 'Engineering', level: 'Postgraduate', duration: '2 Years', tuitionFee: 130000, enrollmentCount: 60, shortDescription: 'Specialized M.Tech degree with focus on advanced engineering topics and research projects.', image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&q=80' },

  // ── Business (4) ──
  { _id: '9', title: 'BBA: Bachelor of Business Administration', department: 'Business', level: 'Undergraduate', duration: '3 Years', tuitionFee: 65000, enrollmentCount: 220, shortDescription: 'Three-year BBA programme covering management, economics, marketing, and business strategy.', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80' },
  { _id: '10', title: 'BMS: Bachelor of Management Studies', department: 'Business', level: 'Undergraduate', duration: '3 Years', tuitionFee: 62000, enrollmentCount: 200, shortDescription: 'Industry-aligned BMS programme with focus on organizational behavior and business management.', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80' },
  { _id: '11', title: 'MBA: Master of Business Administration', department: 'Business', level: 'Postgraduate', duration: '2 Years', tuitionFee: 150000, enrollmentCount: 60, shortDescription: 'Prestigious MBA programme with global perspective, case studies, and industry partnerships.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' },
  { _id: '12', title: 'PGDM: Post Graduate Diploma in Management', department: 'Business', level: 'Postgraduate', duration: '2 Years', tuitionFee: 140000, enrollmentCount: 50, shortDescription: 'PGDM programme equivalent to MBA with focus on practical management skills and placements.', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80' },

  // ── Finance (4) ──
  { _id: '13', title: 'B.Com: Bachelor of Commerce', department: 'Finance', level: 'Undergraduate', duration: '3 Years', tuitionFee: 55000, enrollmentCount: 280, shortDescription: 'Traditional B.Com degree covering accounting, finance, taxation, and business law.', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80' },
  { _id: '14', title: 'BAF: Bachelor of Commerce in Accounting & Finance', department: 'Finance', level: 'Undergraduate', duration: '3 Years', tuitionFee: 65000, enrollmentCount: 150, shortDescription: 'Specialized B.Com with focus on advanced accounting, auditing, and financial management.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { _id: '15', title: 'M.Com: Master of Commerce', department: 'Finance', level: 'Postgraduate', duration: '2 Years', tuitionFee: 95000, enrollmentCount: 70, shortDescription: 'Advanced commerce studies with specializations in accounting, finance, and taxation.', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80' },
  { _id: '16', title: 'CA: Chartered Accountant', department: 'Finance', level: 'Professional', duration: '5 Years', tuitionFee: 180000, enrollmentCount: 40, shortDescription: 'Professional CA course with rigorous training in accounting, auditing, and tax law.', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80' },

  // ── Health Sciences (4) ──
  { _id: '17', title: 'MBBS: Bachelor of Medicine & Bachelor of Surgery', department: 'Health Sciences', level: 'Undergraduate', duration: '5.5 Years', tuitionFee: 200000, enrollmentCount: 80, shortDescription: 'Comprehensive medical education with clinical rotations at affiliated teaching hospitals.', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80' },
  { _id: '18', title: 'B.Pharm: Bachelor of Pharmacy', department: 'Health Sciences', level: 'Undergraduate', duration: '4 Years', tuitionFee: 90000, enrollmentCount: 120, shortDescription: 'Four-year pharmacy degree covering pharmaceutical sciences, clinical pharmacy, and drug development.', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80' },
  { _id: '19', title: 'B.Sc Nursing: Bachelor of Science in Nursing', department: 'Health Sciences', level: 'Undergraduate', duration: '4 Years', tuitionFee: 85000, enrollmentCount: 130, shortDescription: 'Evidence-based nursing education with hands-on clinical rotations at leading health facilities.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80' },
  { _id: '20', title: 'MD/MS: Doctor of Medicine & Master of Surgery', department: 'Health Sciences', level: 'Postgraduate', duration: '3 Years', tuitionFee: 220000, enrollmentCount: 30, shortDescription: 'Postgraduate medical specialization with advanced clinical training and research opportunities.', image: 'https://images.unsplash.com/photo-1551190822-a9ce113ac100?w=800&q=80' },

  // ── Law (3) ──
  { _id: '21', title: 'BA LLB: Bachelor of Arts & Bachelor of Laws', department: 'Law', level: 'Undergraduate', duration: '5 Years', tuitionFee: 80000, enrollmentCount: 100, shortDescription: 'Integrated five-year law degree combining liberal arts with comprehensive legal education.', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80' },
  { _id: '22', title: 'LLB: Bachelor of Laws', department: 'Law', level: 'Undergraduate', duration: '3 Years', tuitionFee: 60000, enrollmentCount: 140, shortDescription: 'Three-year law degree covering criminal, civil, constitutional, and commercial law.', image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80' },
  { _id: '23', title: 'LLM: Master of Laws', department: 'Law', level: 'Postgraduate', duration: '2 Years', tuitionFee: 110000, enrollmentCount: 50, shortDescription: 'Advanced law studies with specializations in intellectual property, international law, and corporate law.', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80' },

  // ── Arts (3) ──
  { _id: '24', title: 'B.A.: Bachelor of Arts', department: 'Arts', level: 'Undergraduate', duration: '3 Years', tuitionFee: 40000, enrollmentCount: 350, shortDescription: 'Three-year arts degree with diverse subject combinations in humanities and social sciences.', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80' },
  { _id: '25', title: 'BJMC: Bachelor of Journalism & Mass Communication', department: 'Arts', level: 'Undergraduate', duration: '3 Years', tuitionFee: 55000, enrollmentCount: 100, shortDescription: 'Specialized journalism degree with hands-on training in print, broadcast, and digital media.', image: 'https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=800&q=80' },
  { _id: '26', title: 'M.A.: Master of Arts', department: 'Arts', level: 'Postgraduate', duration: '2 Years', tuitionFee: 65000, enrollmentCount: 70, shortDescription: 'Postgraduate arts programme with research focus and specializations in various disciplines.', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80' },
];

export default function Courses() {
  const [courses, setCourses] = useState(STATIC_COURSES);
  const [filtered, setFiltered] = useState(STATIC_COURSES);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [department, setDepartment] = useState('All');

  useEffect(() => {
    setLoading(true);
    api.get('/courses')
      .then(({ data }) => {
        if (data.data?.length) {
          setCourses(data.data);
          setFiltered(data.data);
        }
      })
      .catch(() => {
        // Use static fallback - courses already set
        console.log('Using static course data');
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...courses];

    if (search.trim()) {
      result = result.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.department.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (level !== 'All') {
      result = result.filter(c => c.level === level);
    }

    if (department !== 'All') {
      result = result.filter(c => c.department === department);
    }

    setFiltered(result);
  }, [search, level, department, courses]);

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-dark-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.08),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto section-padding relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm font-semibold uppercase tracking-widest">Academic Programmes</span>
            <h1 className="section-title mt-2">
              Our <span className="gold-text">Courses</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mt-3">
              {courses.length} programmes available across {DEPARTMENTS.length - 1} departments.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-dark border-b border-gray-800 sticky top-16 md:top-20 z-40 glass">
        <div className="max-w-7xl mx-auto section-padding flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Search courses or departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 text-sm"
            />
          </div>
          {/* Level filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <FaFilter className="text-gold" size={13} />
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  level === l ? 'bg-gold text-dark' : 'bg-dark-300 text-gray-400 hover:text-gold border border-gray-700 hover:border-gold'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Department filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {DEPARTMENTS.map((d) => (
              <button
                key={d}
                onClick={() => setDepartment(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  department === d ? 'bg-gold text-dark' : 'bg-dark-300 text-gray-400 hover:text-gold border border-gray-700 hover:border-gold'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-16 bg-dark min-h-[50vh]">
        <div className="max-w-7xl mx-auto section-padding">
          {filtered.length > 0 ? (
            <>
              <p className="text-gray-500 text-sm mb-8">
                Showing <span className="text-gold font-semibold">{filtered.length}</span> programme{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((course, i) => (
                  <CourseCard key={course._id} course={course} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🎓</p>
              <p className="text-gray-400 text-lg">No courses match your search. Try adjusting the filters.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
