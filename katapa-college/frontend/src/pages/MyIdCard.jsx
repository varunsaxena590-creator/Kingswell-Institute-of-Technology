// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyIdCard.jsx (Student Page)                          ║
// ║  PATH: frontend/src/pages/MyIdCard.jsx                      ║
// ║                                                              ║
// ║  KYA HAI? → Student ID card generate + download page.        ║
// ║  → Student photo, name, enrollment number, course dikhata.  ║
// ║  → html2canvas se image download kar sakte hain.            ║
// ║  → Route: /my-id-card (protected — login required)          ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/MyIdCard.jsx — Student ID Card with Download
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaPrint, FaIdCard, FaUserCircle, FaQrcode } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

const VALID_YEAR = new Date().getFullYear() + 1;
const COLLEGE_NAME = 'Kingswell College';
const COLLEGE_TAGLINE = 'Institute of Technology & Sciences';
const COLLEGE_ADDRESS = 'Nairobi, Kenya';

// Tiny deterministic barcode from admissionNumber
function Barcode({ text }) {
  const bars = Array.from(text || '----------').map(c => c.charCodeAt(0));
  return (
    <div className="flex items-end gap-px h-8">
      {bars.map((v, i) => (
        <div
          key={i}
          style={{ height: `${12 + (v % 20)}px`, width: '3px' }}
          className="bg-dark rounded-sm"
        />
      ))}
    </div>
  );
}

export default function MyIdCard() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    api.get('/students/my-profile')
      .then(({ data }) => setStudent(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `ID-Card-${student?.admissionNumber || 'student'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      /* silent */
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    const card = cardRef.current;
    if (!card) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>ID Card — ${student?.firstName} ${student?.lastName}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#111; }
        img { max-width:100%; }
      </style></head>
      <body>${card.outerHTML}<script>window.onload=()=>{window.print();window.close();}<\/script></body></html>
    `);
    win.document.close();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark pt-24 flex items-center justify-center text-gray-500">
          Loading your ID card...
        </div>
        <Footer />
      </>
    );
  }

  if (!student) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark pt-24 flex flex-col items-center justify-center text-gray-500 gap-4">
          <FaIdCard size={52} className="opacity-10" />
          <p className="text-lg">No student profile found.</p>
          <p className="text-sm">Please complete your admission application first.</p>
        </div>
        <Footer />
      </>
    );
  }

  if (student.status !== 'accepted') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark pt-24 flex flex-col items-center justify-center text-gray-500 gap-4">
          <FaIdCard size={52} className="opacity-10" />
          <p className="text-lg text-white">ID Card not available yet</p>
          <p className="text-sm">Your ID card will be issued once your application is accepted.</p>
          <span className={`mt-2 text-xs px-3 py-1 rounded-full border font-medium capitalize ${
            student.status === 'pending'      ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
            student.status === 'under_review' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                                                'text-red-400 border-red-400/30 bg-red-400/10'
          }`}>
            Status: {student.status.replace('_', ' ')}
          </span>
        </div>
        <Footer />
      </>
    );
  }

  const photoUrl = student.profilePhoto
    ? `http://localhost:5001/uploads/profiles/${student.profilePhoto}`
    : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-2xl mx-auto section-padding">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">Student ID Card</h1>
            <p className="text-gray-400">Download or print your official ID card</p>
          </motion.div>

          {/* The actual card — this gets captured by html2canvas */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <div
              ref={cardRef}
              style={{
                width: '100%',
                maxWidth: '480px',
                margin: '0 auto',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #141420 0%, #1a1a2e 100%)',
                border: '2px solid rgba(212,175,55,0.4)',
                boxShadow: '0 0 40px rgba(212,175,55,0.15)',
                fontFamily: 'Georgia, serif',
                position: 'relative',
              }}
            >
              {/* Card top strip — gold */}
              <div style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #a0821a 100%)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                {/* Logo placeholder circle */}
                <div style={{
                  width: '46px', height: '46px', borderRadius: '50%',
                  background: '#0a0a0f', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                  border: '2px solid rgba(255,255,255,0.3)',
                }}>
                  <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '18px', fontFamily: 'Georgia, serif' }}>K</span>
                </div>
                <div>
                  <p style={{ color: '#0a0a0f', fontWeight: 'bold', fontSize: '15px', lineHeight: 1.2 }}>{COLLEGE_NAME}</p>
                  <p style={{ color: 'rgba(10,10,15,0.7)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>{COLLEGE_TAGLINE}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{
                    background: 'rgba(10,10,15,0.2)', color: '#0a0a0f',
                    fontSize: '9px', fontWeight: 'bold', padding: '3px 8px',
                    borderRadius: '999px', letterSpacing: '1.5px',
                  }}>STUDENT ID</span>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '20px', display: 'flex', gap: '16px' }}>
                {/* Photo */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{
                    width: '88px', height: '100px', borderRadius: '12px', overflow: 'hidden',
                    border: '2px solid rgba(212,175,55,0.5)',
                    background: '#1a1a2e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="#d4af37" style={{ width: '40px', opacity: 0.4 }}>
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#d4af37', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {student.courseApplied?.level || 'Undergraduate'}
                  </p>
                  <p style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '17px', lineHeight: 1.2, marginBottom: '10px' }}>
                    {student.firstName} {student.lastName}
                  </p>

                  {[
                    { label: 'ADM NO.',   value: student.admissionNumber },
                    { label: 'COURSE',    value: student.courseApplied?.title || '—' },
                    { label: 'GENDER',    value: student.gender },
                    { label: 'VALID TILL',value: `Dec ${VALID_YEAR}` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', gap: '6px', marginBottom: '5px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '1px', minWidth: '68px', paddingTop: '1px' }}>{label}</span>
                      <span style={{ color: '#e5e5e5', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)', margin: '0 20px' }} />

              {/* Card bottom — barcode + address */}
              <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Barcode text={student.admissionNumber} />
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', letterSpacing: '1.5px', marginTop: '4px' }}>
                    {student.admissionNumber}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', letterSpacing: '1px' }}>{COLLEGE_ADDRESS}</p>
                  <p style={{ color: 'rgba(212,175,55,0.5)', fontSize: '8px', letterSpacing: '1px', marginTop: '2px' }}>www.kingswellcollege.ac.ke</p>
                </div>
              </div>

              {/* Corner accent dots */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(212,175,55,0.4)' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(212,175,55,0.4)' }} />
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 bg-gold text-dark font-semibold px-6 py-3 rounded-xl hover:bg-gold-light transition-colors text-sm"
            >
              <FaDownload size={14} />
              {downloading ? 'Generating...' : 'Download PNG'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 border border-gold/40 text-gold font-semibold px-6 py-3 rounded-xl hover:bg-gold/10 transition-colors text-sm"
            >
              <FaPrint size={14} />
              Print
            </button>
          </motion.div>

          {/* Note */}
          <p className="text-center text-gray-600 text-xs mt-4">
            This is an official document of {COLLEGE_NAME}. Please carry it on campus at all times.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
