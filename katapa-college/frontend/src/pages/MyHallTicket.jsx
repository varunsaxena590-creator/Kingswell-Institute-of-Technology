// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: MyHallTicket.jsx (Student Page)                      ║
// ║  PATH: frontend/src/pages/MyHallTicket.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Student apna exam hall ticket dekhta/download    ║
// ║    karta hai yaha pe.                                       ║
// ║  → Exam name, seat number, venue, dates dikhata hai.        ║
// ║  → html2canvas se PNG download aur print kar sakte hain.    ║
// ║  → Route: /my-hall-ticket (protected — login required)      ║
// ╚══════════════════════════════════════════════════════════════╝
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaPrint, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaChair } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

const COLLEGE_NAME = 'Kingswell College';
const COLLEGE_TAGLINE = 'Institute of Technology & Sciences';

export default function MyHallTicket() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const ticketRefs = useRef({});

  useEffect(() => {
    api.get('/hall-tickets/my')
      .then(({ data }) => setTickets(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (ticket) => {
    const ref = ticketRefs.current[ticket._id];
    if (!ref) return;
    setDownloading(ticket._id);
    try {
      const canvas = await html2canvas(ref, {
        scale: 3, useCORS: true, backgroundColor: null, logging: false,
      });
      const link = document.createElement('a');
      link.download = `HallTicket-${ticket.student?.admissionNumber || 'student'}-${ticket.examName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { /* silent */ }
    finally { setDownloading(null); }
  };

  const handlePrint = (ticket) => {
    const ref = ticketRefs.current[ticket._id];
    if (!ref) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Hall Ticket — ${ticket.examName}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#fff; }
      </style></head>
      <body>${ref.outerHTML}<script>window.onload=()=>{window.print();window.close();}<\/script></body></html>
    `);
    win.document.close();
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark pt-24 flex items-center justify-center text-gray-500">
          Loading your hall tickets...
        </div>
        <Footer />
      </>
    );
  }

  if (tickets.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark pt-24 flex flex-col items-center justify-center text-gray-500 gap-4">
          <FaTicketAlt size={52} className="opacity-10" />
          <p className="text-lg text-white">No Hall Tickets Available</p>
          <p className="text-sm">Hall tickets will appear here once published by the admin.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-dark pt-24 pb-16">
        <div className="max-w-3xl mx-auto section-padding">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="font-heading font-bold text-white text-3xl mb-1">My Hall Tickets</h1>
            <p className="text-gray-400">Download or print your exam hall tickets</p>
          </motion.div>

          <div className="space-y-10">
            {tickets.map((ticket, idx) => (
              <motion.div key={ticket._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                {/* The actual ticket card — captured by html2canvas */}
                <div
                  ref={el => ticketRefs.current[ticket._id] = el}
                  style={{
                    maxWidth: '640px',
                    margin: '0 auto',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, #141420 0%, #1a1a2e 100%)',
                    border: '2px solid rgba(212,175,55,0.4)',
                    boxShadow: '0 0 40px rgba(212,175,55,0.12)',
                    fontFamily: 'Georgia, serif',
                    position: 'relative',
                  }}
                >
                  {/* Header strip */}
                  <div style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #a0821a 100%)',
                    padding: '16px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: '#0a0a0f', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', border: '2px solid rgba(255,255,255,0.3)',
                      }}>
                        <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '16px' }}>K</span>
                      </div>
                      <div>
                        <p style={{ color: '#0a0a0f', fontWeight: 'bold', fontSize: '14px', lineHeight: 1.2 }}>{COLLEGE_NAME}</p>
                        <p style={{ color: 'rgba(10,10,15,0.6)', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{COLLEGE_TAGLINE}</p>
                      </div>
                    </div>
                    <span style={{
                      background: 'rgba(10,10,15,0.2)', color: '#0a0a0f',
                      fontSize: '9px', fontWeight: 'bold', padding: '4px 10px',
                      borderRadius: '999px', letterSpacing: '1.5px',
                    }}>HALL TICKET</span>
                  </div>

                  {/* Exam Info */}
                  <div style={{ padding: '20px 24px' }}>
                    <p style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{ticket.examName}</p>
                    <p style={{ color: '#9ca3af', fontSize: '12px', textTransform: 'capitalize', marginBottom: '16px' }}>
                      {ticket.examType} Examination · {ticket.semester}
                    </p>

                    {/* Student Info Row */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      gap: '12px', marginBottom: '16px',
                    }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px' }}>
                        <p style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Student Name</p>
                        <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>{ticket.student?.name}</p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px' }}>
                        <p style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Admission No.</p>
                        <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>{ticket.student?.admissionNumber || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Course & Seat */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      gap: '12px', marginBottom: '16px',
                    }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '12px' }}>
                        <p style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Course</p>
                        <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>{ticket.course?.title || '—'}</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)',
                        borderRadius: '10px', padding: '12px',
                        border: '1px solid rgba(212,175,55,0.3)',
                      }}>
                        <p style={{ color: '#d4af37', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Seat Number</p>
                        <p style={{ color: '#d4af37', fontSize: '22px', fontWeight: 'bold', marginTop: '2px', fontFamily: 'monospace' }}>{ticket.seatNumber}</p>
                      </div>
                    </div>

                    {/* Details Row */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '10px', marginBottom: '16px',
                    }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px' }}>
                        <p style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dates</p>
                        <p style={{ color: '#d1d5db', fontSize: '11px', marginTop: '4px' }}>
                          {fmtDate(ticket.startDate)} — {fmtDate(ticket.endDate)}
                        </p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px' }}>
                        <p style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>Report Time</p>
                        <p style={{ color: '#d1d5db', fontSize: '11px', marginTop: '4px' }}>{ticket.reportTime}</p>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px' }}>
                        <p style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>Venue</p>
                        <p style={{ color: '#d1d5db', fontSize: '11px', marginTop: '4px' }}>{ticket.venue}</p>
                      </div>
                    </div>

                    {/* Subjects */}
                    {ticket.subjects?.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <p style={{ color: '#6b7280', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Subjects</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {ticket.subjects.map((s, i) => (
                            <span key={i} style={{
                              background: 'rgba(212,175,55,0.1)', color: '#d4af37',
                              fontSize: '10px', padding: '4px 10px', borderRadius: '999px',
                              border: '1px solid rgba(212,175,55,0.2)',
                            }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    {ticket.instructions && (
                      <div style={{
                        background: 'rgba(239,68,68,0.06)', borderRadius: '10px', padding: '10px 14px',
                        border: '1px solid rgba(239,68,68,0.15)',
                      }}>
                        <p style={{ color: '#ef4444', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 'bold' }}>Instructions</p>
                        <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: '1.5' }}>{ticket.instructions}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', padding: '10px 24px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <p style={{ color: '#4b5563', fontSize: '9px' }}>This is a computer-generated hall ticket.</p>
                    <p style={{ color: '#4b5563', fontSize: '9px' }}>{COLLEGE_NAME} © {new Date().getFullYear()}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center gap-4 mt-5">
                  <button onClick={() => handleDownload(ticket)} disabled={downloading === ticket._id}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold/15 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/25 transition-colors disabled:opacity-50">
                    <FaDownload size={13} />
                    {downloading === ticket._id ? 'Downloading...' : 'Download PNG'}
                  </button>
                  <button onClick={() => handlePrint(ticket)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-dark-200 border border-gray-700 text-gray-300 text-sm font-medium hover:text-white hover:border-gray-600 transition-colors">
                    <FaPrint size={13} /> Print
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
