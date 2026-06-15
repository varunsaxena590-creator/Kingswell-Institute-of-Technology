// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Home.jsx (Public Page)                               ║
// ║  PATH: frontend/src/pages/Home.jsx                          ║
// ║                                                              ║
// ║  KYA HAI? → Website ka landing/home page.                    ║
// ║  → Hero section (3D), featured courses, stats, notices.     ║
// ║  → Ye sabse pehle dikhne wala page hai.                     ║
// ║  → Route: / (root)                                          ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/Home.jsx — Landing Page
import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaAward, FaUsers, FaBookOpen, FaGlobe, FaArrowRight, FaStar, FaBullhorn, FaThumbtack } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import SectionHeader from '../components/SectionHeader';
import api from '../utils/axios';
import { STATIC_COURSES } from './Courses';
import { useLanguage } from '../context/LanguageContext';

const Hero3D = lazy(() => import('../components/Hero3D'));

// ── Feature Cards data (icons only — text from translations) ──
const featureIcons = [FaAward, FaUsers, FaBookOpen, FaGlobe];

// ── Testimonials data ──────────────────────────────────────
const testimonials = [
  { name: 'Amara Osei', course: 'BSc Computer Science', text: 'Kingswell Institute of Technology gave me the foundation I needed to land my dream job at a top tech company. The faculty is amazing!', rating: 5, photo: '/pics/student-amara.jpg' },
  { name: 'Fatima Hassan', course: 'Diploma in Business', text: 'The business programme here is world-class. I graduated with both theory and practical skills ready for the real world.', rating: 5, photo: '/pics/student-fatima.jpg' },
  { name: 'David Mutua', course: 'BSc Nursing', text: 'The nursing department is equipped with state-of-the-art facilities. I felt fully prepared for my clinical rotations.', rating: 5, photo: '/pics/student-david.jpg' },
];

export default function Home() {
  const { t } = useLanguage();
  const [courses, setCourses] = useState(STATIC_COURSES.slice(0, 6));
  const [notices, setNotices] = useState([]);

  const features = featureIcons.map((icon, i) => ({
    icon,
    title: t(`home.feat${i + 1}Title`),
    desc: t(`home.feat${i + 1}Desc`),
  }));

  useEffect(() => {
    api.get('/courses')
      .then(({ data }) => { if (data.data?.length) setCourses(data.data.slice(0, 6)); })
      .catch(() => {});
    api.get('/notices')
      .then(({ data }) => { if (data.data?.length) setNotices(data.data.slice(0, 6)); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />

      {/* 3D Hero */}
      <Suspense
        fallback={
          <section className="relative min-h-screen flex items-center overflow-hidden bg-dark">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
            <div className="relative z-10 section-padding max-w-7xl mx-auto w-full pt-24">
              <div className="max-w-2xl animate-pulse">
                <div className="h-8 w-56 bg-white/10 rounded-full mb-6" />
                <div className="h-20 w-full max-w-xl bg-white/10 rounded-2xl mb-4" />
                <div className="h-6 w-full max-w-lg bg-white/10 rounded-xl mb-2" />
                <div className="h-6 w-3/4 bg-white/10 rounded-xl mb-10" />
                <div className="flex gap-4">
                  <div className="h-12 w-36 bg-gold/20 rounded-xl" />
                  <div className="h-12 w-40 bg-white/10 rounded-xl" />
                </div>
              </div>
            </div>
          </section>
        }
      >
        <Hero3D />
      </Suspense>

      {/* ── Why Choose Us ── */}
      <section className="py-24 bg-dark-100">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionHeader
            badge={t('home.whyBadge')}
            title={t('home.whyTitle')}
            highlight={t('home.whyHighlight')}
            subtitle={t('home.whySubtitle')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="card text-center group hover:-translate-y-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-gold/20 transition-colors">
                  <Icon className="text-gold" size={26} />
                </div>
                <h3 className="font-heading font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className="py-24 bg-dark">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionHeader
            badge={t('home.coursesBadge')}
            title={t('home.coursesTitle')}
            highlight={t('home.coursesHL')}
            subtitle={t('home.coursesSub')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {courses.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>
          <div className="text-center">
            <Link to="/courses" className="btn-outline-gold inline-flex items-center gap-2">
              {t('home.viewAll')} <FaArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="py-16 bg-gold-gradient">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-dark">
            {[
              { value: '15,000+', label: t('home.graduates') },
              { value: '60+', label: t('home.programmes') },
              { value: '200+', label: t('home.facultyMembers') },
              { value: '40+', label: t('home.yearsOp') },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-heading font-bold text-4xl md:text-5xl">{stat.value}</p>
                <p className="font-medium text-dark/70 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-dark-100">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionHeader badge={t('home.storiesBadge')} title={t('home.storiesTitle')} highlight={t('home.storiesHL')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card relative"
              >
                {/* Quote mark */}
                <span className="absolute top-4 right-5 text-6xl text-gold/10 font-serif leading-none select-none">"</span>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <FaStar key={j} className="text-gold" size={14} />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.target.onerror=null; e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} />
                  ) : null}
                  <div className={`w-10 h-10 rounded-full bg-gold-gradient items-center justify-center font-bold text-dark text-sm${t.photo ? '' : ' flex'}`} style={t.photo ? {display:'none'} : {}}>
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gold text-xs">{t.course}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Notice Board ── */}
      {notices.length > 0 && (
        <section className="py-20 bg-dark">
          <div className="max-w-7xl mx-auto section-padding">
            <SectionHeader
              badge={t('home.noticeBadge')}
              title={t('home.noticeTitle')}
              highlight={t('home.noticeHL')}
              subtitle={t('home.noticeSub')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notices.map((n, i) => {
                const CAT_STYLE = {
                  general: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                  exam:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                  holiday: 'bg-green-500/10 text-green-400 border-green-500/20',
                  urgent:  'bg-red-500/10 text-red-400 border-red-500/20',
                  event:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
                };
                const CAT_ICON = { general: '📋', exam: '📝', holiday: '🏖️', urgent: '🚨', event: '🎉' };
                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`card flex gap-4 items-start ${
                      n.pinned ? 'border-gold/30 bg-gold/5' : ''
                    }`}
                  >
                    <span className="text-2xl mt-0.5 shrink-0">{CAT_ICON[n.category] || '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {n.pinned && (
                          <span className="flex items-center gap-1 text-xs text-yellow-400 font-semibold">
                            <FaThumbtack size={9} /> {t('home.pinned')}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${CAT_STYLE[n.category] || ''}`}>
                          {n.category}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-base">{n.title}</h3>
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed line-clamp-3">{n.message}</p>
                      <p className="text-gray-600 text-xs mt-2">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA Banner ── */}
      <section className="py-20 bg-dark">
        <div className="max-w-4xl mx-auto section-padding text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-dark-300 border border-gold/20 rounded-3xl p-12 shadow-gold"
          >
            <h2 className="section-title mb-4">
              {t('home.ctaTitle')} <span className="gold-text">{t('home.ctaHL')}</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              {t('home.ctaDesc')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/admission" className="btn-gold px-8 py-3.5 text-base">
                {t('home.ctaApply')}
              </Link>
              <Link to="/contact" className="btn-outline-gold px-8 py-3.5 text-base">
                {t('home.ctaAdvisor')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
