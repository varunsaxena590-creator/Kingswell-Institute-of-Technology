// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Analytics.jsx (Admin Page)                           ║
// ║  PATH: frontend/src/admin/Analytics.jsx                     ║
// ║                                                              ║
// ║  KYA HAI? → Admin ke liye reports & analytics dashboard.     ║
// ║  → Charts (Recharts) se students, fees, attendance ka       ║
// ║    graphical overview dikhata hai.                            ║
// ║  → GET /api/analytics/dashboard se data fetch karta hai.    ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from 'recharts';
import {
  FaChartBar, FaUsers, FaMoneyBillWave, FaGraduationCap, FaChalkboardTeacher,
  FaEnvelope, FaCheckCircle, FaSpinner, FaSync, FaPercentage, FaTrophy,
} from 'react-icons/fa';
import api from '../utils/axios';

// ── Colors ──────────────────────────────────────────────────────
const GOLD      = '#d4af37';
const COLORS    = ['#34d399', '#fb923c', '#60a5fa', '#f87171', '#a78bfa', '#f472b6'];
const FEE_COLORS = { Paid: '#34d399', Unpaid: '#fb923c', Partial: '#60a5fa', Overdue: '#f87171' };

// ── Helpers ──────────────────────────────────────────────────────
function fmtCurrency(n) {
  if (n >= 1_000_000) return `KSh ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `KSh ${(n / 1_000).toFixed(1)}K`;
  return `KSh ${n}`;
}

// ── Custom tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-[rgba(212,175,55,0.2)] rounded-xl px-4 py-3 shadow-2xl">
      {label && <p className="text-[rgba(255,255,255,0.5)] text-xs mb-2">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-medium" style={{ color: p.color || GOLD }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Stat card ────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#141420] border border-[rgba(212,175,55,0.12)] rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[rgba(255,255,255,0.4)] text-xs uppercase tracking-widest truncate">{label}</p>
        <p className="text-white text-2xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-[rgba(255,255,255,0.3)] text-xs mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Chart wrapper ────────────────────────────────────────────────
function ChartCard({ title, icon, children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-[#141420] border border-[rgba(212,175,55,0.12)] rounded-2xl p-5 ${className}`}
    >
      <h3 className="text-[#d4af37] text-sm font-semibold uppercase tracking-widest flex items-center gap-2 mb-5">
        {icon} {title}
      </h3>
      {children}
    </motion.div>
  );
}

// ── Pie label ────────────────────────────────────────────────────
const renderPieLabel = ({ name, percent }) =>
  percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : '';

// ════════════════════════════════════════════════════════════════
export default function Analytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/analytics/dashboard');
      setData(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <FaSpinner className="animate-spin text-[#d4af37] text-4xl" />
        <p className="text-[rgba(255,255,255,0.4)] text-sm">Loading analytics data...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[#f87171]">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] text-[#d4af37] rounded-xl text-sm">
          Try Again
        </button>
      </div>
    );
  }

  const { overview, admissionStatus, studentsPerCourse, monthlyAdmissions, feeChartData, gradeDistribution, attendanceSummary } = data;

  return (
    <div className="p-6 md:p-8 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#a0821a] flex items-center justify-center text-black">
            <FaChartBar />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
            <p className="text-[rgba(255,255,255,0.3)] text-xs mt-0.5">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.2)] text-[#d4af37] rounded-xl text-sm hover:bg-[rgba(212,175,55,0.15)] transition-colors"
        >
          <FaSync /> Refresh
        </button>
      </div>

      {/* ── Overview stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<FaUsers />}         label="Total Students"    value={overview.totalStudents}          sub={`${overview.acceptanceRate}% acceptance`} color="bg-[rgba(212,175,55,.1)] text-[#d4af37]"  delay={0.05} />
        <StatCard icon={<FaCheckCircle />}   label="Accepted"          value={overview.accepted}               sub={`${overview.pending} pending`}            color="bg-[rgba(52,211,153,.1)] text-[#34d399]"  delay={0.1}  />
        <StatCard icon={<FaMoneyBillWave />} label="Revenue Collected" value={fmtCurrency(overview.totalRevenue)}   sub={`${fmtCurrency(overview.pendingRevenue)} pending`} color="bg-[rgba(96,165,250,.1)] text-[#60a5fa]"  delay={0.15} />
        <StatCard icon={<FaPercentage />}    label="Avg Attendance"    value={`${overview.avgAttendancePct}%`} sub="Last 30 days"                             color="bg-[rgba(167,139,250,.1)] text-[#a78bfa]"  delay={0.2}  />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<FaGraduationCap />}     label="Active Courses"   value={overview.totalCourses}   color="bg-[rgba(251,146,60,.1)] text-[#fb923c]"  delay={0.25} />
        <StatCard icon={<FaChalkboardTeacher />} label="Faculty Members"  value={overview.totalFaculty}   color="bg-[rgba(248,113,113,.1)] text-[#f87171]"  delay={0.3}  />
        <StatCard icon={<FaTrophy />}            label="Under Review"     value={overview.underReview}    color="bg-[rgba(244,114,182,.1)] text-[#f472b6]"  delay={0.35} />
        <StatCard icon={<FaEnvelope />}          label="New Inquiries"    value={overview.totalContacts}  color="bg-[rgba(52,211,153,.1)] text-[#34d399]"   delay={0.4}  />
      </div>

      {/* ── Row 1: Monthly admissions + Admission status pie ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Monthly Applications" icon={<FaUsers />} delay={0.45} className="lg:col-span-2">
          {monthlyAdmissions.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.3)] text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyAdmissions} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
                <Bar dataKey="applications" name="Applications" fill="rgba(96,165,250,0.7)"  radius={[4, 4, 0, 0]} />
                <Bar dataKey="accepted"     name="Accepted"     fill="rgba(52,211,153,0.7)"  radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Admission Status" icon={<FaChartBar />} delay={0.5}>
          {admissionStatus.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.3)] text-sm text-center py-8">No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={admissionStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                    dataKey="value" nameKey="name" labelLine={false}>
                    {admissionStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {admissionStatus.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-[rgba(255,255,255,0.5)]">{s.name}</span>
                    </span>
                    <span className="text-white font-bold">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* ── Row 2: Students per course + Fee breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Students Per Course" icon={<FaGraduationCap />} delay={0.55}>
          {studentsPerCourse.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.3)] text-sm text-center py-8">No accepted students yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={studentsPerCourse} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                <Bar dataKey="students" name="Students" radius={[0, 4, 4, 0]}>
                  {studentsPerCourse.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Fee Collection Breakdown" icon={<FaMoneyBillWave />} delay={0.6}>
          {feeChartData.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.3)] text-sm text-center py-8">No fee records yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={feeChartData} cx="50%" cy="50%" outerRadius={75}
                    dataKey="value" label={renderPieLabel} labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                    style={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }}>
                    {feeChartData.map((entry) => (
                      <Cell key={entry.name} fill={FEE_COLORS[entry.name] || GOLD} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {feeChartData.map((f) => (
                  <div key={f.name} className="flex items-center justify-between bg-[#0f0f1a] rounded-lg px-3 py-2">
                    <span className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ background: FEE_COLORS[f.name] || GOLD }} />
                      <span className="text-[rgba(255,255,255,0.5)]">{f.name}</span>
                    </span>
                    <span className="text-xs font-bold text-white">{fmtCurrency(f.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* ── Row 3: Attendance trend + Grade distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Attendance Trend (14 Days)" icon={<FaChartBar />} delay={0.65} className="lg:col-span-2">
          {attendanceSummary.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.3)] text-sm text-center py-8">No attendance data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceSummary} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#d4af37" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(212,175,55,0.3)' }} />
                <Area type="monotone" dataKey="pct" name="Attendance %" stroke={GOLD} strokeWidth={2} fill="url(#attendGrad)" dot={{ fill: GOLD, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Grade Distribution" icon={<FaTrophy />} delay={0.7}>
          {gradeDistribution.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.3)] text-sm text-center py-8">No published results yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={gradeDistribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="grade" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212,175,55,0.05)' }} />
                  <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                    {gradeDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3">
                {gradeDistribution.map((g, i) => {
                  const total = gradeDistribution.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((g.count / total) * 100) : 0;
                  return (
                    <div key={g.grade} className="flex items-center gap-2">
                      <span className="text-xs font-bold w-6 text-center" style={{ color: COLORS[i % COLORS.length] }}>
                        {g.grade || '?'}
                      </span>
                      <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs text-[rgba(255,255,255,0.4)] w-12 text-right">{g.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
