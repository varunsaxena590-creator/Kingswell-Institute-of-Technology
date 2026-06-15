// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: CourseCard.jsx (Reusable Component)                  ║
// ║  PATH: frontend/src/components/CourseCard.jsx               ║
// ║                                                              ║
// ║  KYA HAI? → Course dikhane ke liye card component.           ║
// ║  → Title, image, department, fee, duration dikhata hai.     ║
// ║  → Courses page aur Home page mein reuse hota hai.          ║
// ╚══════════════════════════════════════════════════════════════╝
// src/components/CourseCard.jsx — Reusable Course Card
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaGraduationCap, FaUsers, FaArrowRight, FaEdit } from 'react-icons/fa';

export default function CourseCard({ course, index = 0 }) {
  const navigate = useNavigate();
  const {
    _id,
    title,
    department,
    level,
    duration,
    tuitionFee,
    shortDescription,
    image,
    enrollmentCount,
  } = course;

  const levelColors = {
    Certificate: 'bg-blue-500/20 text-blue-400',
    Diploma: 'bg-purple-500/20 text-purple-400',
    Undergraduate: 'bg-gold/20 text-gold',
    Postgraduate: 'bg-green-500/20 text-green-400',
    Professional: 'bg-red-500/20 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -6 }}
      className="card group flex flex-col h-full overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-44 -mx-6 -mt-6 mb-5 overflow-hidden bg-dark-400 rounded-t-2xl">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-dark-gradient flex items-center justify-center">
            <FaGraduationCap className="text-gold/30" size={56} />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-300/90 to-transparent" />
        {/* Level badge */}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full ${levelColors[level] || 'bg-gold/20 text-gold'}`}>
          {level}
        </span>
      </div>

      {/* Department */}
      <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-1">{department}</p>

      {/* Title */}
      <h3 className="font-heading font-bold text-white text-lg leading-snug mb-2 group-hover:text-gold transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
        {shortDescription || 'A comprehensive programme designed to equip you with practical skills and theoretical knowledge.'}
      </p>

      {/* Meta info */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1.5">
          <FaClock className="text-gold" size={11} /> {duration}
        </span>
        <span className="flex items-center gap-1.5">
          <FaUsers className="text-gold" size={11} /> {enrollmentCount || 0} enrolled
        </span>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-auto">
        <div>
          <p className="text-gray-500 text-xs">Tuition / Year</p>
          <p className="gold-text font-bold text-base">
            ₹ {tuitionFee?.toLocaleString() || 'N/A'}
          </p>
        </div>
        <button
          onClick={() => navigate(`/admission?course=${_id}`)}
          className="flex items-center gap-1.5 bg-gold-gradient text-dark text-xs font-bold px-3 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
        >
          <FaEdit size={11} /> Apply Now
        </button>
      </div>
    </motion.div>
  );
}
