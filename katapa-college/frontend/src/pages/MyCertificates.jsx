// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyCertificates.jsx (Student Page)                    ║
// ║  PATH: frontend/src/pages/MyCertificates.jsx                 ║
// ║                                                              ║
// ║  KYA HAI? → Student certificate view & verify page.         ║
// ║  → View own certificates with details.                      ║
// ║  → Verify any certificate by number.                        ║
// ║  → Route: /my-certificates (protected — login required)     ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCertificate, FaCheckCircle, FaTimesCircle,
  FaSearch, FaCalendarAlt, FaShieldAlt,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  'course-completion': 'bg-blue-400/15 text-blue-400 border-blue-400/20',
  merit:              'bg-gold/15 text-gold border-gold/20',
  participation:      'bg-purple-400/15 text-purple-400 border-purple-400/20',
  character:          'bg-green-400/15 text-green-400 border-green-400/20',
  transfer:           'bg-orange-400/15 text-orange-400 border-orange-400/20',
  bonafide:           'bg-cyan-400/15 text-cyan-400 border-cyan-400/20',
  other:              'bg-gray-400/15 text-gray-400 border-gray-400/20',
};

export default function MyCertificates() {
  const [certs, setCerts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [verifyNo, setVerifyNo]   = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    api.get('/certificates/my')
      .then(({ data }) => setCerts(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyNo.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const { data } = await api.get(`/certificates/verify/${encodeURIComponent(verifyNo.trim())}`);
      setVerifyResult(data.data);
    } catch {
      toast.error('Certificate not found');
      setVerifyResult(null);
    } finally { setVerifying(false); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-3xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">My Certificates</h1>
            <p className="text-gray-400">View your certificates & verify any certificate</p>
          </motion.div>

          {/* ═══ VERIFY SECTION ═══ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
            className="bg-dark-200 border border-gray-800 rounded-2xl p-5 mb-8">
            <h2 className="text-gold text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaShieldAlt size={12} /> Verify Certificate
            </h2>
            <form onSubmit={handleVerify} className="flex gap-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
                <input value={verifyNo} onChange={e => setVerifyNo(e.target.value)}
                  placeholder="Enter certificate number, e.g. KIT-CERT-2026-00001"
                  className="input-field w-full pl-8 text-sm" />
              </div>
              <button type="submit" disabled={verifying} className="btn-gold px-5 text-sm">
                {verifying ? '...' : 'Verify'}
              </button>
            </form>

            <AnimatePresence>
              {verifyResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-4 border rounded-xl p-4 ${
                    verifyResult.status === 'active'
                      ? 'bg-green-400/5 border-green-500/20'
                      : 'bg-red-400/5 border-red-500/20'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {verifyResult.status === 'active'
                      ? <FaCheckCircle className="text-green-400" />
                      : <FaTimesCircle className="text-red-400" />}
                    <span className={`text-sm font-bold ${verifyResult.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                      {verifyResult.status === 'active' ? 'Valid Certificate' : 'Revoked Certificate'}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium">{verifyResult.title}</p>
                  <p className="text-gold text-[10px] font-mono">{verifyResult.certificateNo}</p>
                  {verifyResult.student && (
                    <p className="text-gray-400 text-xs mt-1">
                      Student: {verifyResult.student.firstName} {verifyResult.student.lastName}
                      {verifyResult.student.enrollmentNumber && ` — ${verifyResult.student.enrollmentNumber}`}
                    </p>
                  )}
                  <p className="text-gray-600 text-[10px] mt-1">Issued: {fmtDate(verifyResult.issueDate)}</p>
                  {verifyResult.revokedReason && <p className="text-red-400/70 text-xs mt-1">Reason: {verifyResult.revokedReason}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Loading */}
          {loading && <div className="text-center py-20 text-gray-500">Loading certificates...</div>}

          {/* Empty */}
          {!loading && certs.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-gray-500">
              <FaCertificate size={52} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg text-white mb-1">No Certificates Yet</p>
              <p className="text-sm">Certificates issued to you will appear here.</p>
            </motion.div>
          )}

          {/* Certificate List */}
          {!loading && certs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-gray-400 text-sm font-medium">Your Certificates ({certs.length})</h2>
              {certs.map((c, i) => (
                <motion.div key={c._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-dark-200 border rounded-2xl p-5 transition-colors ${
                    c.status === 'revoked' ? 'border-red-500/20 opacity-70' : 'border-gray-800'
                  }`}>
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${
                      c.status === 'revoked' ? 'bg-red-400/10 text-red-400' : 'bg-gold/10 text-gold'
                    }`}>
                      <FaCertificate size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-gold text-[10px] font-mono font-bold">{c.certificateNo}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${TYPE_COLORS[c.type] || TYPE_COLORS.other}`}>
                          {c.type.replace(/-/g, ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          c.status === 'active'
                            ? 'bg-green-400/10 text-green-400 border-green-400/20'
                            : 'bg-red-400/10 text-red-400 border-red-400/20'
                        }`}>
                          {c.status === 'active' ? <FaCheckCircle size={8} /> : <FaTimesCircle size={8} />} {c.status}
                        </span>
                      </div>

                      <h3 className="text-white font-medium text-sm">{c.title}</h3>
                      {c.description && <p className="text-gray-500 text-xs mt-1">{c.description}</p>}

                      <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-gray-600">
                        {c.courseName && <span>Course: {c.courseName}</span>}
                        {c.semester && <span>Sem: {c.semester}</span>}
                        {c.grade && <span className="text-gold">Grade: {c.grade}</span>}
                        <span className="flex items-center gap-1"><FaCalendarAlt size={8} /> Issued: {fmtDate(c.issueDate)}</span>
                        {c.validUntil && <span>Valid Until: {fmtDate(c.validUntil)}</span>}
                      </div>

                      {c.revokedReason && (
                        <p className="text-red-400/70 text-xs mt-2">Revoke reason: {c.revokedReason}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
