// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: About.jsx (Public Page)                              ║
// ║  PATH: frontend/src/pages/About.jsx                         ║
// ║                                                              ║
// ║  KYA HAI? → College ke baare mein information page.          ║
// ║  → Mission, vision, values dikhata hai.                      ║
// ║  → Route: /about                                             ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/About.jsx — About Page
import { motion } from 'framer-motion';
import { FaCheckCircle, FaBullseye, FaEye, FaHeart } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionHeader from '../components/SectionHeader';
import { useLanguage } from '../context/LanguageContext';

const valueIcons = [FaBullseye, FaEye, FaHeart];
const valueKeys = ['mission', 'vision', 'coreValues'];
const valueTextKeys = ['missionText', 'visionText', 'coreValuesText'];

const milestoneYears = ['1985', '1995', '2005', '2015', '2024'];
const milestoneKeys = ['mile1', 'mile2', 'mile3', 'mile4', 'mile5'];

export default function About() {
  const { t } = useLanguage();

  const values = valueIcons.map((icon, i) => ({
    icon,
    title: t(`about.${valueKeys[i]}`),
    text: t(`about.${valueTextKeys[i]}`),
  }));

  const milestones = milestoneYears.map((year, i) => ({
    year,
    event: t(`about.${milestoneKeys[i]}`),
  }));
  return (
    <>
      <Navbar />

      {/* Page Header */}
      <section className="pt-32 pb-16 bg-dark-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.1),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto section-padding relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-gold text-sm font-semibold uppercase tracking-widest">{t('about.badge')}</span>
            <h1 className="section-title mt-2">
              {t('about.title')} <span className="gold-text">{t('about.highlight')}</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mt-4 leading-relaxed">
              {t('about.desc')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto section-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card border-t-2 border-t-gold"
              >
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="text-gold" size={22} />
                </div>
                <h3 className="font-heading font-bold text-white text-xl mb-3">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 bg-dark-100">
        <div className="max-w-4xl mx-auto section-padding">
          <SectionHeader badge={t('about.journeyBadge')} title={t('about.journeyTitle')} highlight={t('about.journeyHL')} />
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gold/20" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 pl-16 relative"
                >
                  {/* Dot */}
                  <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-gold border-2 border-dark-100 shadow-gold" />
                  <div className="bg-dark-300 border border-gray-700 rounded-xl p-5 flex-1 hover:border-gold/50 transition-colors">
                    <span className="gold-text font-heading font-bold text-xl">{m.year}</span>
                    <p className="text-gray-300 text-sm mt-1">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto section-padding">
          <SectionHeader badge={t('about.achieveBadge')} title={t('about.achieveTitle')} highlight={t('about.achieveHL')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              t('about.ach1'),
              t('about.ach2'),
              t('about.ach3'),
              t('about.ach4'),
              t('about.ach5'),
              t('about.ach6'),
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 bg-dark-300 border border-gray-700 rounded-xl p-4 hover:border-gold/50 transition-colors"
              >
                <FaCheckCircle className="text-gold mt-0.5 shrink-0" size={16} />
                <span className="text-gray-300 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
