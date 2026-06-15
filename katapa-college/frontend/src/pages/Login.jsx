// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Login.jsx (Public Page)                              ║
// ║  PATH: frontend/src/pages/Login.jsx                         ║
// ║                                                              ║
// ║  KYA HAI? → Login page — email + password form.              ║
// ║  → AuthContext.login() call karta hai.                      ║
// ║  → Login hone pe dashboard/home pe redirect.                ║
// ║  → Route: /login                                            ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/Login.jsx — Login Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error(t('login.fillAll')); return; }
    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const destination = user.role === 'admin' ? '/admin' : '/';
      // Allow AuthContext state to settle before the route guard runs.
      setTimeout(() => navigate(destination, { replace: true }), 0);
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      if (!apiMessage && (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error'))) {
        toast.error('Backend server is not reachable. Please make sure the backend is running on port 5000.');
        return;
      }
      toast.error(apiMessage || t('login.invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-dark flex items-center justify-center pt-20 pb-12 relative overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md section-padding z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/pics/logo.png" alt="Kingswell Logo" className="w-14 h-14 rounded-full object-cover mx-auto mb-4 shadow-gold" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} />
            <div className="w-14 h-14 rounded-full bg-gold-gradient items-center justify-center mx-auto mb-4 shadow-gold text-dark font-heading font-bold text-2xl" style={{display:'none'}}>
              K
            </div>
            <h1 className="font-heading font-bold text-white text-3xl">
              {t('login.welcome')} <span className="gold-text">{t('login.back')}</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            {/* Email */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">{t('login.emailLabel')}</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-gray-400 text-xs uppercase tracking-widest">{t('login.password')}</label>
                <Link to="/contact" className="text-gold text-xs hover:underline">{t('login.forgot')}</Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors"
                >
                  {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.signingIn') : t('login.signIn')}
            </button>

            <p className="text-center text-gray-400 text-sm">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-gold hover:underline font-medium">
                {t('login.registerHere')}
              </Link>
            </p>

            <div className="border-t border-gray-700 pt-4">
              <p className="text-center text-gray-500 text-xs mb-3">{t('login.demoCreds')}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: t('login.useAdmin'), email: 'admin@kingswellinstitute.ac.ke', pass: 'admin123' },
                  { label: t('login.useStudent'), email: 'student@kingswellinstitute.ac.ke', pass: 'student123' },
                ].map(({ label, email, pass }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => setForm({ email, password: pass })}
                    className="text-xs bg-dark-400 border border-gray-700 rounded-lg py-2 text-gray-400 hover:text-gold hover:border-gold transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}
