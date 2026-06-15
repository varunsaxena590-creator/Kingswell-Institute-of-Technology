// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Faculty.jsx (Public Page)                            ║
// ║  PATH: frontend/src/pages/Faculty.jsx                       ║
// ║                                                              ║
// ║  KYA HAI? → Faculty / staff members page.                    ║
// ║  → Teachers ki list with photo, name, department, bio.      ║
// ║  → Department wise filter karna.                            ║
// ║  → Route: /faculty                                          ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/Faculty.jsx — Faculty / Staff Page
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaEnvelope, FaGraduationCap } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionHeader from '../components/SectionHeader';
import api from '../utils/axios';

const STATIC_FACULTY = [
  { _id: '1', name: 'Prof. James Kariuki', title: 'Dean of Technology', dept: 'Technology', edu: 'PhD Computer Science – MIT', bio: 'Over 20 years in software engineering and academic research. Specialises in AI and machine learning.', initials: 'JK', photo: '/pics/faculty-jk.jpg' },
  { _id: '2', name: 'Dr. Amina Odhiambo', title: 'Head of Business School', dept: 'Business', edu: 'PhD Business Administration – University of Cape Town', bio: 'International business consultant with experience in 12 countries. Expert in strategic management.', initials: 'AO', photo: '/pics/faculty-ao.jpg' },
  { _id: '3', name: 'Dr. Samuel Waweru', title: 'Head of Health Sciences', dept: 'Health Sciences', edu: 'MBChB, PhD – University of Nairobi', bio: 'Practising physician with a passion for medical education and community healthcare.', initials: 'SW', photo: '/pics/faculty-sw.jpg' },
  { _id: '4', name: 'Ms. Grace Achieng', title: 'Senior Lecturer', dept: 'Technology', edu: 'MSc Software Engineering – University of Edinburgh', bio: 'Full-stack developer and educator. Passionate about bridging the gap between academia and industry.', initials: 'GA', photo: '/pics/faculty-ga.jpg' },
  { _id: '5', name: 'Mr. Peter Otieno', title: 'Head of Finance Department', dept: 'Finance', edu: 'MBA Finance – Strathmore University', bio: 'Chartered Accountant with 15 years in corporate finance and taxation advisory.', initials: 'PO', photo: '/pics/faculty-po.jpg' },
  { _id: '6', name: 'Dr. Fatuma Mwangi', title: 'Senior Lecturer, Education', dept: 'Education', edu: 'PhD Curriculum Design – Kenyatta University', bio: 'Curriculum development specialist committed to innovative and inclusive teaching practices.', initials: 'FM', photo: '/pics/faculty-fm.jpg' },
  { _id: '7', name: 'Eng. Collins Mutua', title: 'Head of Engineering', dept: 'Engineering', edu: 'MEng Civil Engineering – University of Manchester', bio: 'Registered Professional Engineer with 18 years of experience in infrastructure development.', initials: 'CM', photo: '/pics/faculty-cm.jpg' },
  { _id: '8', name: 'Ms. Joyce Njoki', title: 'Registrar', dept: 'Administration', edu: 'MA Education Management – USIU Africa', bio: 'Overseeing student affairs and academic administration for over 12 years at Kingswell Institute of Technology.', initials: 'JN', photo: '/pics/faculty-jn.jpg' },
];

const deptColors = {
  Technology: 'bg-blue-500/20 text-blue-400',
  Business: 'bg-amber-500/20 text-amber-400',
  'Health Sciences': 'bg-green-500/20 text-green-400',
  Finance: 'bg-purple-500/20 text-purple-400',
  Education: 'bg-pink-500/20 text-pink-400',
  Engineering: 'bg-orange-500/20 text-orange-400',
  Administration: 'bg-gray-500/20 text-gray-400',
};

export default function Faculty() {
  const [faculty, setFaculty] = useState(STATIC_FACULTY);

  useEffect(() => {
    api.get('/faculty')
      .then(({ data }) => { if (data.data?.length) setFaculty(data.data); })
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-dark-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(212,175,55,0.08),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto section-padding relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm font-semibold uppercase tracking-widest">Meet the Team</span>
            <h1 className="section-title mt-2">
              Our <span className="gold-text">Faculty</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mt-3">
              World-class academics and industry professionals dedicated to your success.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {faculty.map((member, i) => (
              <motion.div
                key={member._id || member.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="card text-center group"
              >
                {/* Avatar */}
                <div className="relative mx-auto mb-4">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-20 h-20 rounded-full object-cover mx-auto shadow-gold group-hover:shadow-gold-lg transition-shadow" onError={(e) => { e.target.onerror=null; e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} />
                  ) : null}
                  <div className={`w-20 h-20 rounded-full bg-gold-gradient items-center justify-center mx-auto text-dark font-heading font-bold text-2xl shadow-gold group-hover:shadow-gold-lg transition-shadow${member.photo ? '' : ' flex'}`} style={member.photo ? {display:'none'} : {}}>
                    {member.initials || member.name.split(' ').filter(w => /^[A-Za-z]/.test(w)).slice(-2).map(w => w[0].toUpperCase()).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-dark-300 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-heading font-bold text-white text-base leading-snug">{member.name}</h3>
                <p className="text-gold text-xs mt-1 font-medium">{member.title}</p>

                {/* Dept badge */}
                <span className={`inline-block text-xs px-2.5 py-1 rounded-full mt-2 font-medium ${deptColors[member.dept] || 'bg-gold/20 text-gold'}`}>
                  {member.dept}
                </span>

                {/* Education */}
                <div className="flex items-start gap-2 mt-3 text-xs text-gray-500">
                  <FaGraduationCap className="text-gold shrink-0 mt-0.5" size={12} />
                  <span className="text-left">{member.edu}</span>
                </div>

                {/* Bio */}
                <p className="text-gray-400 text-xs mt-3 leading-relaxed text-left line-clamp-3">{member.bio}</p>

                {/* Social links */}
                <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-700">
                  <button className="text-gray-500 hover:text-blue-400 transition-colors">
                    <FaLinkedin size={16} />
                  </button>
                  <button className="text-gray-500 hover:text-gold transition-colors">
                    <FaEnvelope size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join us banner */}
      <section className="py-16 bg-dark-100">
        <div className="max-w-3xl mx-auto section-padding text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-dark-300 border border-gold/20 rounded-3xl p-10"
          >
            <h2 className="font-heading font-bold text-white text-3xl mb-3">
              Join Our <span className="gold-text">Academic Team</span>
            </h2>
            <p className="text-gray-400 mb-6">We are always looking for passionate educators and researchers to join the Kingswell family.</p>
            <a href="mailto:hr@kingswellinstitute.ac.ke" className="btn-gold inline-block">
              Send Your CV
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
