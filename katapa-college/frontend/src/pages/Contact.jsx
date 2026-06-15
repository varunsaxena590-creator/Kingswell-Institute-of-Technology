// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Contact.jsx (Public Page)                            ║
// ║  PATH: frontend/src/pages/Contact.jsx                       ║
// ║                                                              ║
// ║  KYA HAI? → Contact us page with enquiry form.               ║
// ║  → Name, email, subject, message bhar ke submit.            ║
// ║  → College address, phone, map bhi dikhata hai.             ║
// ║  → Route: /contact                                          ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/Contact.jsx — Contact Page
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error(t('contact.fillRequired'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/contacts', form);
      setSent(true);
      toast.success(t('contact.sentSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('contact.sentFail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-dark-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(212,175,55,0.08),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto section-padding relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm font-semibold uppercase tracking-widest">{t('contact.badge')}</span>
            <h1 className="section-title mt-2">
              {t('contact.title')} <span className="gold-text">{t('contact.highlight')}</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mt-3">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto section-padding grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {[
              { icon: FaMapMarkerAlt, label: t('contact.addressLabel'), value: t('footer.address') },
              { icon: FaPhone, label: t('contact.phoneLabel'), value: '+254 700 123 456' },
              { icon: FaEnvelope, label: t('contact.emailLabel'), value: 'info@kingswellinstitute.ac.ke' },
              { icon: FaClock, label: t('contact.officeLabel'), value: t('footer.officeHours') },
            ].map(({ icon: Icon, label, value }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="card flex items-start gap-4"
              >
                <div className="w-11 h-11 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-white text-sm font-medium">{value}</p>
                </div>
              </motion.div>
            ))}

            {/* Map embed placeholder */}
            <div className="rounded-2xl overflow-hidden border border-gray-700 h-44 bg-dark-300 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FaMapMarkerAlt size={28} className="mx-auto mb-2 text-gold/40" />
                <p className="text-sm">{t('contact.mapReady')}</p>
                <p className="text-xs">{t('contact.mapAdd')}</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            {sent ? (
              <div className="card flex flex-col items-center justify-center py-16 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mb-6"
                >
                  <FaCheckCircle className="text-gold" size={40} />
                </motion.div>
                <h3 className="font-heading font-bold text-white text-2xl mb-2">{t('contact.sentTitle')}</h3>
                <p className="text-gray-400 mb-6">{t('contact.sentDesc')}</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="btn-outline-gold">
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card space-y-5">
                <h3 className="font-heading font-bold text-white text-xl mb-2">{t('contact.formTitle')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('contact.nameLabel')} *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('contact.emailLabel')} *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('contact.phoneLabel')} ({t('contact.optional')})</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder={t('contact.phonePlaceholder')} className="input-field" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('contact.subjectLabel')} *</label>
                    <select name="subject" value={form.subject} onChange={handleChange} className="input-field" required>
                      <option value="">{t('contact.selectSubject')}</option>
                      <option value="Admission Inquiry">{t('contact.subAdmission')}</option>
                      <option value="Course Information">{t('contact.subCourse')}</option>
                      <option value="Fee Structure">{t('contact.subFee')}</option>
                      <option value="Student Support">{t('contact.subSupport')}</option>
                      <option value="General Inquiry">{t('contact.subGeneral')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('contact.messageLabel')} *</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5} placeholder={t('contact.messagePlaceholder')} className="input-field resize-none" required />
                </div>
                <button type="submit" disabled={loading} className="btn-gold w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? t('contact.sending') : t('contact.sendBtn')}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
