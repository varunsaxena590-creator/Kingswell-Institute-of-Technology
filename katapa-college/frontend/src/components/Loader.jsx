// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Loader.jsx (Component)                               ║
// ║  PATH: frontend/src/components/Loader.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Full-screen loading spinner/animation.           ║
// ║  → Data load ho rha hai tab dikhta hai.                     ║
// ║  → Framer Motion se fade-in/out animation.                  ║
// ╚══════════════════════════════════════════════════════════════╝
// src/components/Loader.jsx — Full-screen loader
import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-dark flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinning gold ring */}
        <motion.div
          className="w-16 h-16 border-4 border-dark-300 border-t-gold rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          className="gold-text font-heading text-lg tracking-widest uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Kingswell Institute of Technology
        </motion.p>
      </div>
    </div>
  );
}
