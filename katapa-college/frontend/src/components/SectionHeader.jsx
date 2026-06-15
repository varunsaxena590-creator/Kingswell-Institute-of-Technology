// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: SectionHeader.jsx (Reusable Component)               ║
// ║  PATH: frontend/src/components/SectionHeader.jsx            ║
// ║                                                              ║
// ║  KYA HAI? → Reusable section title + subtitle block.         ║
// ║  → Animated heading with underline decoration.              ║
// ║  → About, Courses, Faculty pages mein use hota hai.         ║
// ╚══════════════════════════════════════════════════════════════╝
// src/components/SectionHeader.jsx — Reusable section title block
import { motion } from 'framer-motion';

export default function SectionHeader({ badge, title, highlight, subtitle, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${center ? 'text-center' : ''}`}
    >
      {badge && (
        <span className="inline-block text-gold text-xs font-semibold uppercase tracking-widest bg-gold/10 border border-gold/20 px-4 py-1.5 rounded-full mb-4">
          {badge}
        </span>
      )}
      <h2 className="section-title">
        {title}{' '}
        {highlight && <span className="gold-text">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-3 leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
