// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Dashboard.jsx (Admin Page)                           ║
// ║  PATH: frontend/src/admin/Dashboard.jsx                     ║
// ║                                                              ║
// ║  KYA HAI? → Admin dashboard ka overview page.                ║
// ║  → Total students, courses, faculty, fees ka summary.       ║
// ║  → Quick stats cards + recent activity dikhata hai.         ║
// ║  → GET /api/analytics/dashboard se data aata hai.           ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/Dashboard.jsx — Admin Dashboard Overview
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaUserGraduate,
  FaBookOpen,
  FaEnvelope,
  FaImages,
  FaExclamationTriangle,
  FaBriefcase,
  FaUsers,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    contacts: 0,
    gallery: 0,
    alumni: 0,
    jobs: 0,
    visits: 0,
    pendingStudents: 0,
    overdueCount: 0,
    latestPlacementYear: null,
    highestPackage: '—',
    averagePackage: '—',
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stuRes, courRes, conRes, galRes, feeRes, aluRes, jobRes, visitRes, placementRes] = await Promise.allSettled([
          api.get('/students'),
          api.get('/courses'),
          api.get('/contacts'),
          api.get('/gallery'),
          api.get('/fees/summary'),
          api.get('/alumni'),
          api.get('/placements/jobs'),
          api.get('/placements/company-visits'),
          api.get('/placements/stats'),
        ]);
        const students = stuRes.status === 'fulfilled' ? stuRes.value.data.data : [];
        const courses  = courRes.status === 'fulfilled' ? courRes.value.data.data : [];
        const contacts = conRes.status === 'fulfilled'  ? conRes.value.data.data  : [];
        const gallery  = galRes.status === 'fulfilled'  ? galRes.value.data.data  : [];
        const feeSummary = feeRes.status === 'fulfilled' ? feeRes.value.data : {};
        const alumni = aluRes.status === 'fulfilled' ? aluRes.value.data.alumni || aluRes.value.data.data || [] : [];
        const jobs = jobRes.status === 'fulfilled' ? jobRes.value.data.jobs || jobRes.value.data.data || [] : [];
        const visits = visitRes.status === 'fulfilled' ? visitRes.value.data.visits || visitRes.value.data.data || [] : [];
        const placementStats = placementRes.status === 'fulfilled' ? placementRes.value.data.stats || placementRes.value.data.data || [] : [];
        const latestPlacement = placementStats[0] || {};

        setStats({
          students: students.length,
          courses: courses.length,
          contacts: contacts.length,
          gallery: gallery.length,
          alumni: alumni.length,
          jobs: jobs.length,
          visits: visits.length,
          pendingStudents: students.filter(s => s.status === 'pending').length,
          overdueCount: feeSummary.overdueCount || 0,
          latestPlacementYear: latestPlacement.year || null,
          highestPackage: latestPlacement.highestPackage || '—',
          averagePackage: latestPlacement.averagePackage || '—',
        });
        setRecentStudents(students.slice(0, 5));
        setRecentContacts(contacts.slice(0, 5));
        setRecentJobs(jobs.slice(0, 3));
        setRecentVisits(visits.slice(0, 3));
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const statCards = [
    { icon: FaUserGraduate, label: 'Total Applications', value: stats.students, sub: `${stats.pendingStudents} pending`, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: FaBookOpen, label: 'Courses', value: stats.courses, sub: 'Active programmes', color: 'text-gold', bg: 'bg-gold/10' },
    { icon: FaUsers, label: 'Alumni', value: stats.alumni, sub: 'Active alumni profiles', color: 'text-purple-400', bg: 'bg-purple-500/10', link: '/alumni' },
    { icon: FaBriefcase, label: 'Open Jobs', value: stats.jobs, sub: 'Placement opportunities', color: 'text-green-400', bg: 'bg-green-500/10', link: '/admin/placements' },
    { icon: FaMapMarkerAlt, label: 'Company Visits', value: stats.visits, sub: 'Placement drives', color: 'text-cyan-400', bg: 'bg-cyan-500/10', link: '/admin/placements' },
    { icon: FaEnvelope, label: 'Messages', value: stats.contacts, sub: 'Contact enquiries', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: FaImages, label: 'Gallery', value: stats.gallery, sub: 'Uploaded images', color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: FaExclamationTriangle, label: 'Overdue Fees', value: stats.overdueCount, sub: 'Past due date', color: 'text-red-400', bg: 'bg-red-500/10', link: '/admin/fees' },
  ];

  const statusColors = { pending: 'text-yellow-400 bg-yellow-400/10', under_review: 'text-blue-400 bg-blue-400/10', accepted: 'text-green-400 bg-green-400/10', rejected: 'text-red-400 bg-red-400/10' };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading font-bold text-white text-2xl">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening at Kingswell Institute of Technology.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, sub, color, bg, link }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-dark-200 border rounded-2xl p-5 transition-colors ${link ? 'border-red-500/30 hover:border-red-500/60 cursor-pointer' : 'border-gray-800 hover:border-gold/30'}`}
            onClick={() => link && navigate(link)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon className={color} size={20} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold text-gray-600`}>
                Live
              </span>
            </div>
            <p className="font-heading font-bold text-white text-3xl">{loading ? '—' : value}</p>
            <p className="text-gray-400 text-sm mt-1">{label}</p>
            <p className="text-gray-600 text-xs mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Applications</h3>
            <Link to="/admin/students" className="text-gold text-xs hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recentStudents.length > 0 ? recentStudents.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                    {s.firstName?.[0]}{s.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{s.firstName} {s.lastName}</p>
                    <p className="text-gray-500 text-xs">{s.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[s.status] || ''}`}>
                  {s.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <FaUserGraduate size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No applications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Messages</h3>
          </div>
          <div className="space-y-3">
            {recentContacts.length > 0 ? recentContacts.map((c) => (
              <div key={c._id} className="flex items-start justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                    {c.name?.[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{c.name}</p>
                    <p className="text-gray-500 text-xs line-clamp-1">{c.subject}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'unread' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
                  {c.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <FaEnvelope size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No messages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Placement Snapshot */}
        <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Placement Snapshot</h3>
            <Link to="/admin/placements" className="text-gold text-xs hover:underline">Open module</Link>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-800 bg-dark-300 p-3">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">Latest Year</p>
                <p className="text-white font-heading text-xl mt-1">{stats.latestPlacementYear || '—'}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-dark-300 p-3">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">Highest Package</p>
                <p className="text-white font-heading text-xl mt-1">{stats.highestPackage}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-dark-300 p-3">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">Average Package</p>
                <p className="text-white font-heading text-xl mt-1">{stats.averagePackage}</p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-dark-300 p-3">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">Total Visits</p>
                <p className="text-white font-heading text-xl mt-1">{stats.visits}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Recent Jobs</p>
              <div className="space-y-2">
                {recentJobs.length > 0 ? recentJobs.map((job) => (
                  <div key={job._id} className="rounded-xl border border-gray-800 bg-dark-300 p-3">
                    <p className="text-white text-sm font-medium">{job.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{job.company} {job.location ? `• ${job.location}` : ''}</p>
                  </div>
                )) : (
                  <div className="text-gray-500 text-sm">No jobs posted yet.</div>
                )}
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Recent Visits</p>
              <div className="space-y-2">
                {recentVisits.length > 0 ? recentVisits.map((visit) => (
                  <div key={visit._id} className="rounded-xl border border-gray-800 bg-dark-300 p-3">
                    <p className="text-white text-sm font-medium">{visit.company}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                )) : (
                  <div className="text-gray-500 text-sm">No visits scheduled yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Add New Course', to: '/admin/courses/add', icon: FaBookOpen, color: 'border-gold/30 hover:border-gold' },
          { label: 'View Applications', to: '/admin/students', icon: FaUserGraduate, color: 'border-blue-500/30 hover:border-blue-500' },
          { label: 'Upload to Gallery', to: '/admin/gallery/upload', icon: FaImages, color: 'border-green-500/30 hover:border-green-500' },
          { label: 'Manage Placements', to: '/admin/placements', icon: FaBriefcase, color: 'border-cyan-500/30 hover:border-cyan-500' },
        ].map(({ label, to, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-3 bg-dark-200 ${color} border rounded-xl p-4 text-gray-300 hover:text-white transition-all duration-200 group`}
          >
            <Icon size={18} className="text-gold group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
