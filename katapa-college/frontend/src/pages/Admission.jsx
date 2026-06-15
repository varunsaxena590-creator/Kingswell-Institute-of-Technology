// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Admission.jsx (Public Page)                          ║
// ║  PATH: frontend/src/pages/Admission.jsx                     ║
// ║                                                              ║
// ║  KYA HAI? → Online admission application form.               ║
// ║  → Student personal details, course select, submit.         ║
// ║  → POST /api/students/apply pe data jaata hai.              ║
// ║  → Route: /admission                                       ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/Admission.jsx — Online Admission Form
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';
import { useLanguage } from '../context/LanguageContext';

const initialForm = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', gender: '', address: '', city: '', country: 'Kenya',
  idProofType: '', idProofNumber: '',
  guardianName: '', emergencyContact: '',
  courseApplied: '', previousSchool: '', previousGrade: '',
};

export default function Admission() {
  const { t } = useLanguage();
  const STEPS = [t('admission.step0'), t('admission.step1'), t('admission.step2')];
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/courses').then(({ data }) => {
      const list = data.data || [];
      setCourses(list);
      // Auto-select course from URL param ?course=<id>
      const courseId = searchParams.get('course');
      if (courseId) {
        setForm(p => ({ ...p, courseApplied: courseId }));
        // Start at Personal Info (step 0) — course will be pre-selected on step 1
      }
    }).catch(() => {});
  }, [searchParams]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateStep = () => {
    if (step === 0) {
      if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dateOfBirth || !form.gender || !form.address || !form.city) {
        toast.error(t('contact.fillRequired')); return false;
      }
      if (!form.idProofType || !form.idProofNumber) {
        toast.error(t('contact.fillRequired')); return false;
      }
      if (!form.guardianName || !form.emergencyContact) {
        toast.error(t('contact.fillRequired')); return false;
      }
    }
    if (step === 1) {
      if (!form.courseApplied) { toast.error(t('contact.fillRequired')); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 2)); };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/students/apply', form);
      setSubmitted(true);
      toast.success(t('admission.successTitle'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('contact.sentFail'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-dark flex items-center justify-center pt-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card max-w-md w-full mx-4 text-center py-14"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FaCheckCircle className="text-gold" size={48} />
            </motion.div>
            <h2 className="font-heading font-bold text-white text-3xl mb-3">{t('admission.successTitle')}</h2>
            <p className="text-gray-400 mb-2"><span className="text-gold font-semibold">{form.firstName}</span>!</p>
            <p className="text-gray-400 text-sm mb-8">{t('admission.successMsg')} <span className="text-white">{form.email}</span></p>
            <button onClick={() => { setSubmitted(false); setForm(initialForm); setStep(0); }} className="btn-outline-gold">
              {t('admission.submitAnother')}
            </button>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12 bg-dark-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.08),_transparent_60%)]" />
        <div className="max-w-3xl mx-auto section-padding relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm font-semibold uppercase tracking-widest">{t('admission.badge')}</span>
            <h1 className="section-title mt-2">{t('admission.title')} <span className="gold-text">{t('admission.highlight')}</span></h1>
            <p className="text-gray-400 mt-3">{t('admission.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-dark">
        <div className="max-w-3xl mx-auto section-padding">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-10 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700 z-0">
              <div className="h-full bg-gold-gradient transition-all duration-500" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
            </div>
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  i < step ? 'bg-gold border-gold text-dark' :
                  i === step ? 'bg-dark-400 border-gold text-gold shadow-gold' :
                  'bg-dark-400 border-gray-600 text-gray-500'
                }`}>
                  {i < step ? <FaCheckCircle size={16} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-gold' : 'text-gray-500'}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="card space-y-5"
          >
            <h3 className="font-heading font-bold text-white text-xl">{STEPS[step]}</h3>

            {/* Step 0 — Personal Info */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.firstName')} *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.lastName')} *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.email')} *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.phone')} *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+254 700 000 000" className="input-field" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.dob')} *</label>
                    <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="input-field" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.gender')} *</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="input-field" required>
                      <option value="">{t('admission.gender')}</option>
                      <option value="Male">{t('admission.male')}</option>
                      <option value="Female">{t('admission.female')}</option>
                      <option value="Other">{t('admission.other')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.address')} *</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street" className="input-field" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.city')} *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Nairobi" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.country')}</label>
                    <input name="country" value={form.country} onChange={handleChange} className="input-field" />
                  </div>
                </div>

                {/* ID Proof */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.idProofType')} *</label>
                    <select name="idProofType" value={form.idProofType} onChange={handleChange} className="input-field" required>
                      <option value="">{t('admission.idProofType')}</option>
                      <option value="aadhar">{t('admission.aadhar')}</option>
                      <option value="passport">{t('admission.passport')}</option>
                      <option value="national_id">{t('admission.nationalId')}</option>
                      <option value="driving_license">{t('admission.drivingLicense')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.idNumber')} *</label>
                    <input name="idProofNumber" value={form.idProofNumber} onChange={handleChange} placeholder="e.g. 1234 5678 9012" className="input-field" required />
                  </div>
                </div>

                {/* Guardian & Emergency Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.guardianName')} *</label>
                    <input name="guardianName" value={form.guardianName} onChange={handleChange} placeholder="e.g. Robert Doe" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.emergencyContact')} *</label>
                    <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="+254 700 000 000" className="input-field" required />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 — Academic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.programme')} *</label>
                  <select name="courseApplied" value={form.courseApplied} onChange={handleChange} className="input-field" required>
                    <option value="">—</option>
                    {courses.length > 0
                      ? courses.map((c) => <option key={c._id} value={c._id}>{c.title} ({c.level})</option>)
                      : [
                          ['bsc-cs', 'BSc Computer Science (Undergraduate)'],
                          ['dip-ba', 'Diploma in Business Administration'],
                          ['bsc-nursing', 'BSc Nursing (Undergraduate)'],
                          ['cert-accounting', 'Certificate in Accounting'],
                        ].map(([val, label]) => <option key={val} value={val}>{label}</option>)
                    }
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.prevSchool')}</label>
                  <input name="previousSchool" value={form.previousSchool} onChange={handleChange} placeholder="e.g. Nairobi High School" className="input-field" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('admission.prevGrade')}</label>
                  <input name="previousGrade" value={form.previousGrade} onChange={handleChange} placeholder="e.g. B+ / Kenya Certificate of Secondary Education" className="input-field" />
                </div>
              </div>
            )}

            {/* Step 2 — Review */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">{t('admission.review')}</p>
                <div className="bg-dark-400 rounded-xl p-5 space-y-3 text-sm">
                  {[
                    ['Full Name', `${form.firstName} ${form.lastName}`],
                    [t('admission.email'), form.email],
                    [t('admission.phone'), form.phone],
                    [t('admission.dob'), form.dateOfBirth],
                    [t('admission.gender'), form.gender],
                    [t('admission.address'), `${form.address}, ${form.city}, ${form.country}`],
                    [t('admission.idProofType'), form.idProofType ? `${form.idProofType.replace('_', ' ')} — ${form.idProofNumber}` : '—'],
                    [t('admission.guardianName'), form.guardianName || '—'],
                    [t('admission.emergencyContact'), form.emergencyContact || '—'],
                    [t('admission.programme'), courses.find(c => c._id === form.courseApplied)?.title || form.courseApplied],
                    [t('admission.prevSchool'), form.previousSchool || '—'],
                    [t('admission.prevGrade'), form.previousGrade || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-gray-700 pb-2 last:border-0">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-white font-medium text-right max-w-xs">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-400 bg-gold/5 border border-gold/20 rounded-lg p-3">
                  <FaCheckCircle className="text-gold mt-0.5 shrink-0" size={13} />
                  By submitting, you confirm that the information provided is accurate to the best of your knowledge.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4 border-t border-gray-700">
              {step > 0 ? (
                <button onClick={prevStep} className="btn-outline-gold py-2.5 px-5 flex items-center gap-2 text-sm">
                  <FaArrowLeft size={12} /> {t('admission.previous')}
                </button>
              ) : <div />}
              {step < 2 ? (
                <button onClick={nextStep} className="btn-gold py-2.5 px-6 flex items-center gap-2 text-sm">
                  {t('admission.next')} <FaArrowRight size={12} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="btn-gold py-2.5 px-6 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? t('admission.submitting') : t('admission.submit')}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
