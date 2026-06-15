// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyResults.jsx (Student Page)                         ║
// ║  PATH: frontend/src/pages/MyResults.jsx                     ║
// ║                                                              ║
// ║  KYA HAI? → Student ke exam results dekhne ka page.          ║
// ║  → Subject, marks, percentage, grade dikhata hai.           ║
// ║  → Sirf published results dikhte hain.                     ║
// ║  → Route: /my-results (protected — login required)          ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/MyResults.jsx — Student Results Portal
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaMedal, FaChevronDown, FaChevronUp, FaFilePdf } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';
import { downloadResultPDF, downloadMyResultsPDF } from '../utils/pdfReports';

const GRADE_COLOR = {
  'A+': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'A':  'text-green-400 bg-green-400/10 border-green-400/20',
  'B+': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  'B':  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'C':  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  'D':  'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'F':  'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function MyResults() {
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/results/my')
      .then(({ data }) => setResults(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgPct = results.length
    ? Math.round(results.reduce((s, r) => s + r.overallPercentage, 0) / results.length)
    : 0;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-4xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">My Results</h1>
            <p className="text-gray-400">View your published exam results and grades</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading results...</div>
          ) : results.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FaChartBar size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg">No results published yet.</p>
              <p className="text-sm mt-1">Check back after your exams.</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Results',    value: results.length,  color: 'text-white' },
                  { label: 'Avg Score',  value: `${avgPct}%`,    color: avgPct >= 50 ? 'text-green-400' : 'text-red-400' },
                  { label: 'Best Grade', value: results.sort((a, b) => b.overallPercentage - a.overallPercentage)[0]?.overallGrade || '—', color: 'text-gold' },
                ].map(c => (
                  <div key={c.label} className="bg-dark-200 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-gray-500 text-xs uppercase tracking-widest">{c.label}</p>
                    <p className={`text-2xl font-bold font-heading mt-1 ${c.color}`}>{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mb-4">
                <button onClick={() => downloadMyResultsPDF(results)}
                  className="flex items-center gap-2 bg-dark-200 border border-gray-700 text-gray-300 hover:text-gold hover:border-gold/40 font-semibold px-4 py-2 rounded-lg transition-all text-sm">
                  <FaFilePdf size={13} /> Download Report Card
                </button>
              </div>

              {/* Result cards */}
              <div className="space-y-4">
                {results.map((r, i) => {
                  const isOpen = expanded === r._id;
                  return (
                    <motion.div key={r._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                      className="bg-dark-200 border border-gray-800 rounded-2xl overflow-hidden">
                      {/* Card header */}
                      <div
                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-dark-300/40 transition-colors"
                        onClick={() => setExpanded(isOpen ? null : r._id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 ${GRADE_COLOR[r.overallGrade] || ''}`}>
                            {r.overallGrade}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{r.semester}</p>
                            <p className="text-gray-400 text-xs capitalize">{r.examType} · {r.subjects.length} subjects</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-white font-bold text-xl">{r.overallPercentage}%</p>
                            <p className="text-gray-500 text-xs">{new Date(r.publishedAt).toLocaleDateString()}</p>
                          </div>
                          {isOpen ? <FaChevronUp className="text-gray-400" size={14} /> : <FaChevronDown className="text-gray-400" size={14} />}
                        </div>
                      </div>

                      {/* Expanded subject table */}
                      {isOpen && (
                        <div className="border-t border-gray-800 px-5 py-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-800">
                                <th className="text-left text-gray-500 text-xs py-2 font-medium">Subject</th>
                                <th className="text-center text-gray-500 text-xs py-2 font-medium">Marks</th>
                                <th className="text-center text-gray-500 text-xs py-2 font-medium">Percentage</th>
                                <th className="text-center text-gray-500 text-xs py-2 font-medium">Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {r.subjects.map((s, j) => (
                                <tr key={j} className="border-b border-gray-800/50">
                                  <td className="py-2.5 text-gray-300">{s.subject}</td>
                                  <td className="py-2.5 text-center text-gray-400">{s.marksObtained} / {s.totalMarks}</td>
                                  <td className="py-2.5 text-center text-gray-400">{s.percentage}%</td>
                                  <td className="py-2.5 text-center">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${GRADE_COLOR[s.grade] || ''}`}>
                                      {s.grade}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {r.remarks && (
                            <p className="text-gray-400 text-sm mt-3 bg-dark-300 rounded-lg px-4 py-2.5">
                              <span className="text-gray-500">Remarks: </span>{r.remarks}
                            </p>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); downloadResultPDF(r); }}
                            className="mt-3 flex items-center gap-2 text-gray-400 hover:text-gold text-xs font-semibold transition-colors">
                            <FaFilePdf size={12} /> Download PDF
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
