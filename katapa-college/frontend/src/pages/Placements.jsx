import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaBriefcase,
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaBuilding,
  FaGraduationCap,
  FaArrowRight,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

export default function Placements() {
  const [jobs, setJobs] = useState([]);
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, visitRes, statRes] = await Promise.allSettled([
          api.get('/placements/jobs'),
          api.get('/placements/company-visits'),
          api.get('/placements/stats'),
        ]);
        setJobs(jobRes.status === 'fulfilled' ? jobRes.value.data.jobs || jobRes.value.data.data || [] : []);
        setVisits(visitRes.status === 'fulfilled' ? visitRes.value.data.visits || visitRes.value.data.data || [] : []);
        const placementStats = statRes.status === 'fulfilled' ? statRes.value.data.stats || statRes.value.data.data || [] : [];
        setStats(placementStats);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) =>
      [job.title, job.company, job.location, job.salary, job.eligibility]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [jobs, search]);

  const openJobs = useMemo(() => jobs.filter((job) => !job.deadline || new Date(job.deadline) >= new Date()), [jobs]);
  const latestStats = stats[0] || {};

  const summaryCards = [
    { label: 'Open Jobs', value: openJobs.length, icon: FaBriefcase, helper: 'Current opportunities' },
    { label: 'Recruiter Visits', value: visits.length, icon: FaBuilding, helper: 'Industry connects' },
    { label: 'Placed Students', value: latestStats.placed || '—', icon: FaUsers, helper: `${latestStats.year || 'Latest'} report` },
    { label: 'Highest Package', value: latestStats.highestPackage || '—', icon: FaMoneyBillWave, helper: 'Placement record' },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-dark min-h-screen">
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%)]" />
          <div className="relative max-w-7xl mx-auto section-padding py-16 md:py-20">
            <div className="max-w-3xl">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/25 bg-gold/10 text-gold text-xs font-semibold uppercase tracking-[0.3em] mb-6"
              >
                <FaBriefcase size={12} />
                Career Hub
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight"
              >
                Placement support that feels
                <span className="gold-text block">professional and current</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 max-w-2xl mt-5 text-lg leading-relaxed"
              >
                Explore open roles, visiting companies, and yearly placement performance in one clean dashboard-style page.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-10">
              {summaryCards.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    className="card border border-white/5 bg-white/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">{item.label}</p>
                        <p className="text-white font-heading text-3xl font-bold mt-2">{item.value}</p>
                        <p className="text-gray-500 text-sm mt-1">{item.helper}</p>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                        <Icon size={18} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto section-padding py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            <div className="lg:col-span-8">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search jobs by company, title, package or location"
                  className="input-field w-full pl-10"
                />
              </div>
            </div>
            <div className="lg:col-span-4 flex items-center justify-end">
              <Link to="/alumni" className="text-gold text-sm hover:underline inline-flex items-center gap-2">
                Explore alumni network
                <FaArrowRight size={12} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-bold text-white text-2xl">Open Positions</h2>
                  <p className="text-gray-400 text-sm mt-1">{filteredJobs.length} jobs matching your search</p>
                </div>
              </div>

              {loading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="h-5 w-40 bg-white/10 rounded mb-3" />
                      <div className="h-4 w-64 bg-white/10 rounded mb-2" />
                      <div className="h-4 w-full bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="card text-center py-16">
                  <FaBriefcase size={36} className="mx-auto text-gold/40 mb-3" />
                  <h3 className="text-white font-semibold text-lg">No jobs match your search</h3>
                  <p className="text-gray-400 text-sm mt-2">Try another keyword or clear the search box.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredJobs.map((job, index) => (
                    <motion.article
                      key={job._id}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04 }}
                      className="card border border-white/5 hover:border-gold/20 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-white text-xl font-semibold">{job.title}</h3>
                            <span className="text-[10px] px-2 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 uppercase tracking-widest">
                              {job.company}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-400">
                            {job.location && (
                              <span className="inline-flex items-center gap-2">
                                <FaMapMarkerAlt size={12} className="text-gold" />
                                {job.location}
                              </span>
                            )}
                            {job.salary && (
                              <span className="inline-flex items-center gap-2">
                                <FaMoneyBillWave size={12} className="text-gold" />
                                {job.salary}
                              </span>
                            )}
                            {job.deadline && (
                              <span className="inline-flex items-center gap-2">
                                <FaCalendarAlt size={12} className="text-gold" />
                                Apply by {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                          {job.description && <p className="text-gray-400 text-sm leading-relaxed mt-3">{job.description}</p>}
                          {job.eligibility && <p className="text-gray-500 text-xs mt-3">Eligibility: {job.eligibility}</p>}
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                          {job.applyLink ? (
                            <a
                              href={job.applyLink}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-gold text-sm inline-flex items-center gap-2"
                            >
                              Apply Now
                              <FaArrowRight size={12} />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-500">Application link unavailable</span>
                          )}
                          <p className="text-xs text-gray-600">
                            Posted {job.postedAt ? new Date(job.postedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'recently'}
                          </p>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card border border-white/5">
                <h3 className="font-heading text-white text-xl font-bold flex items-center gap-2">
                  <FaBuilding className="text-gold" />
                  Visiting Companies
                </h3>
                <div className="mt-4 space-y-3">
                  {visits.length === 0 ? (
                    <p className="text-gray-400 text-sm">No company visits scheduled yet.</p>
                  ) : (
                    visits.map((visit) => (
                      <div key={visit._id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                        <p className="text-white font-medium">{visit.company}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date pending'}
                        </p>
                        {visit.description && <p className="text-gray-500 text-sm mt-2 line-clamp-3">{visit.description}</p>}
                        {visit.contactPerson && <p className="text-gray-600 text-xs mt-2">Contact: {visit.contactPerson}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card border border-white/5">
                <h3 className="font-heading text-white text-xl font-bold flex items-center gap-2">
                  <FaGraduationCap className="text-gold" />
                  Placement Snapshot
                </h3>
                <div className="mt-4 space-y-3">
                  {stats.length === 0 ? (
                    <p className="text-gray-400 text-sm">No placement reports available yet.</p>
                  ) : (
                    stats.map((row) => (
                      <div key={row._id || row.year} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-white font-semibold">{row.year}</p>
                          <p className="text-gold text-sm font-semibold">{row.placed}/{row.totalStudents} placed</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-widest">Highest</p>
                            <p className="text-white mt-1">{row.highestPackage || '—'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-widest">Average</p>
                            <p className="text-white mt-1">{row.averagePackage || '—'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
