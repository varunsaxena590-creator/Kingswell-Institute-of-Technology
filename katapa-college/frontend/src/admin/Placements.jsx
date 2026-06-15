import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaBriefcase,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaBuilding,
  FaUsers,
  FaMapMarkerAlt,
  FaChartLine,
} from 'react-icons/fa';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const emptyJob = {
  title: '',
  company: '',
  description: '',
  location: '',
  salary: '',
  eligibility: '',
  applyLink: '',
  deadline: '',
};

const emptyVisit = {
  company: '',
  visitDate: '',
  description: '',
  contactPerson: '',
};

const emptyStats = {
  year: new Date().getFullYear(),
  totalStudents: '',
  placed: '',
  highestPackage: '',
  averagePackage: '',
  companiesVisited: '',
};

export default function Placements() {
  const [jobs, setJobs] = useState([]);
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState([]);
  const [tab, setTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [visitForm, setVisitForm] = useState(emptyVisit);
  const [statsForm, setStatsForm] = useState(emptyStats);

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
        setStats(statRes.status === 'fulfilled' ? statRes.value.data.stats || statRes.value.data.data || [] : []);
      } catch {
        toast.error('Failed to load placement data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestStats = useMemo(() => stats[0] || {}, [stats]);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.company.trim()) {
      toast.error('Job title and company are required');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/placements/jobs', {
        ...jobForm,
        deadline: jobForm.deadline || null,
      });
      const created = data.job || data.data || data;
      setJobs((prev) => [created, ...prev]);
      setJobForm(emptyJob);
      toast.success('Job posted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    } finally {
      setSaving(false);
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!visitForm.company.trim() || !visitForm.visitDate) {
      toast.error('Company and visit date are required');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/placements/company-visits', visitForm);
      const created = data.visit || data.data || data;
      setVisits((prev) => [created, ...prev]);
      setVisitForm(emptyVisit);
      toast.success('Company visit added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add visit');
    } finally {
      setSaving(false);
    }
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    if (!statsForm.year || !statsForm.totalStudents || !statsForm.placed) {
      toast.error('Year, total students and placed students are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...statsForm,
        year: Number(statsForm.year),
        totalStudents: Number(statsForm.totalStudents),
        placed: Number(statsForm.placed),
        companiesVisited: statsForm.companiesVisited ? Number(statsForm.companiesVisited) : undefined,
      };
      const { data } = await api.post('/placements/stats', payload);
      const updated = data.stats || data.data || data;
      setStats((prev) => {
        const next = prev.filter((row) => Number(row.year) !== Number(updated.year));
        return [updated, ...next].sort((a, b) => Number(b.year) - Number(a.year));
      });
      setStatsForm(emptyStats);
      toast.success('Placement report saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/placements/jobs/${id}`);
      setJobs((prev) => prev.filter((job) => job._id !== id));
      toast.success('Job deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const summary = [
    { label: 'Jobs', value: jobs.length, icon: FaBriefcase, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Visits', value: visits.length, icon: FaBuilding, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Latest Year', value: latestStats.year || '—', icon: FaChartLine, color: 'text-gold', bg: 'bg-gold/10' },
    { label: 'Placed', value: latestStats.placed || '—', icon: FaUsers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading font-bold text-white text-2xl">Placements</h1>
          <p className="text-gray-400 text-sm mt-1">Manage jobs, company visits and annual placement reports.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summary.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-dark-200 border border-gray-800 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">{item.label}</p>
                    <p className={`text-2xl font-heading font-bold mt-1 ${item.color}`}>{item.value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg}`}>
                    <Icon className={item.color} size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'jobs', label: 'Jobs' },
          { key: 'visits', label: 'Company Visits' },
          { key: 'stats', label: 'Reports' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              tab === item.key
                ? 'bg-gold text-dark border-gold'
                : 'bg-dark-200 text-gray-400 border-gray-800 hover:text-white hover:border-gold/40'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading placement data...</div>
      ) : (
        <>
          {tab === 'jobs' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <FaPlus className="text-gold" />
                  <h2 className="font-semibold text-white">Post New Job</h2>
                </div>
                <form className="space-y-4" onSubmit={handleJobSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input-field" placeholder="Job title" value={jobForm.title} onChange={(e) => setJobForm((p) => ({ ...p, title: e.target.value }))} />
                    <input className="input-field" placeholder="Company" value={jobForm.company} onChange={(e) => setJobForm((p) => ({ ...p, company: e.target.value }))} />
                    <input className="input-field" placeholder="Location" value={jobForm.location} onChange={(e) => setJobForm((p) => ({ ...p, location: e.target.value }))} />
                    <input className="input-field" placeholder="Salary" value={jobForm.salary} onChange={(e) => setJobForm((p) => ({ ...p, salary: e.target.value }))} />
                    <input className="input-field sm:col-span-2" placeholder="Eligibility" value={jobForm.eligibility} onChange={(e) => setJobForm((p) => ({ ...p, eligibility: e.target.value }))} />
                    <input className="input-field sm:col-span-2" placeholder="Apply link" value={jobForm.applyLink} onChange={(e) => setJobForm((p) => ({ ...p, applyLink: e.target.value }))} />
                    <input type="date" className="input-field" value={jobForm.deadline} onChange={(e) => setJobForm((p) => ({ ...p, deadline: e.target.value }))} />
                  </div>
                  <textarea
                    rows="4"
                    className="input-field w-full"
                    placeholder="Job description"
                    value={jobForm.description}
                    onChange={(e) => setJobForm((p) => ({ ...p, description: e.target.value }))}
                  />
                  <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50">
                    <FaPlus size={12} />
                    {saving ? 'Saving...' : 'Publish Job'}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-white">Existing Jobs</h2>
                  <span className="text-gray-500 text-xs">{jobs.length} total</span>
                </div>
                {jobs.length === 0 ? (
                  <div className="bg-dark-200 border border-gray-800 rounded-2xl p-6 text-gray-500">No jobs posted yet.</div>
                ) : (
                  jobs.map((job) => (
                    <div key={job._id} className="bg-dark-200 border border-gray-800 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-white font-medium">{job.title}</p>
                          <p className="text-gray-500 text-sm">{job.company}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            {job.location && <span className="inline-flex items-center gap-1"><FaMapMarkerAlt size={10} /> {job.location}</span>}
                            {job.deadline && <span className="inline-flex items-center gap-1"><FaCalendarAlt size={10} /> {new Date(job.deadline).toLocaleDateString('en-IN')}</span>}
                          </div>
                        </div>
                        <button onClick={() => handleDeleteJob(job._id)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'visits' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <FaPlus className="text-gold" />
                  <h2 className="font-semibold text-white">Add Company Visit</h2>
                </div>
                <form className="space-y-4" onSubmit={handleVisitSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="input-field" placeholder="Company" value={visitForm.company} onChange={(e) => setVisitForm((p) => ({ ...p, company: e.target.value }))} />
                    <input type="date" className="input-field" value={visitForm.visitDate} onChange={(e) => setVisitForm((p) => ({ ...p, visitDate: e.target.value }))} />
                    <input className="input-field sm:col-span-2" placeholder="Contact person" value={visitForm.contactPerson} onChange={(e) => setVisitForm((p) => ({ ...p, contactPerson: e.target.value }))} />
                  </div>
                  <textarea
                    rows="4"
                    className="input-field w-full"
                    placeholder="Visit description"
                    value={visitForm.description}
                    onChange={(e) => setVisitForm((p) => ({ ...p, description: e.target.value }))}
                  />
                  <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50">
                    <FaPlus size={12} />
                    {saving ? 'Saving...' : 'Add Visit'}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h2 className="font-semibold text-white">Scheduled Visits</h2>
                {visits.length === 0 ? (
                  <div className="bg-dark-200 border border-gray-800 rounded-2xl p-6 text-gray-500">No visits scheduled yet.</div>
                ) : (
                  visits.map((visit) => (
                    <div key={visit._id} className="bg-dark-200 border border-gray-800 rounded-2xl p-4">
                      <p className="text-white font-medium">{visit.company}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {visit.visitDate ? new Date(visit.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date pending'}
                      </p>
                      {visit.contactPerson && <p className="text-gray-600 text-xs mt-2">Contact: {visit.contactPerson}</p>}
                      {visit.description && <p className="text-gray-400 text-sm mt-3">{visit.description}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'stats' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <FaChartLine className="text-gold" />
                  <h2 className="font-semibold text-white">Upsert Placement Report</h2>
                </div>
                <form className="space-y-4" onSubmit={handleStatsSubmit}>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" className="input-field" placeholder="Year" value={statsForm.year} onChange={(e) => setStatsForm((p) => ({ ...p, year: e.target.value }))} />
                    <input type="number" className="input-field" placeholder="Total students" value={statsForm.totalStudents} onChange={(e) => setStatsForm((p) => ({ ...p, totalStudents: e.target.value }))} />
                    <input type="number" className="input-field" placeholder="Placed students" value={statsForm.placed} onChange={(e) => setStatsForm((p) => ({ ...p, placed: e.target.value }))} />
                    <input type="number" className="input-field" placeholder="Companies visited" value={statsForm.companiesVisited} onChange={(e) => setStatsForm((p) => ({ ...p, companiesVisited: e.target.value }))} />
                    <input className="input-field" placeholder="Highest package" value={statsForm.highestPackage} onChange={(e) => setStatsForm((p) => ({ ...p, highestPackage: e.target.value }))} />
                    <input className="input-field" placeholder="Average package" value={statsForm.averagePackage} onChange={(e) => setStatsForm((p) => ({ ...p, averagePackage: e.target.value }))} />
                  </div>
                  <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50">
                    <FaPlus size={12} />
                    {saving ? 'Saving...' : 'Save Report'}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h2 className="font-semibold text-white">Annual Reports</h2>
                {stats.length === 0 ? (
                  <div className="bg-dark-200 border border-gray-800 rounded-2xl p-6 text-gray-500">No placement reports saved yet.</div>
                ) : (
                  stats.map((row) => (
                    <div key={row._id || row.year} className="bg-dark-200 border border-gray-800 rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-white font-medium">{row.year}</p>
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
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-widest">Companies</p>
                          <p className="text-white mt-1">{row.companiesVisited || '—'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
