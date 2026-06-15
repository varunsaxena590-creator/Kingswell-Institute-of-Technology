// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Register.jsx (Public Page)                           ║
// ║  PATH: frontend/src/pages/Register.jsx                      ║
// ║                                                              ║
// ║  KYA HAI? → Registration/signup page.                        ║
// ║  → Name, email, password, confirm password form.            ║
// ║  → AuthContext.register() call karta hai.                   ║
// ║  → Route: /register                                         ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/Register.jsx — Registration Page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaUser, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // Password strength checker
  const strength = (() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success('Account created successfully! Welcome to Kingswell Institute of Technology.');
      navigate('/');
    } catch (err) {
      const apiMessage = err.response?.data?.message;
      if (!apiMessage && (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error'))) {
        toast.error('Backend server is not reachable. Please make sure the backend is running on port 5000.');
        return;
      }
      toast.error(apiMessage || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-dark flex items-center justify-center pt-20 pb-12 relative overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gold/4 rounded-full blur-3xl pointer-events-none" />

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
              Create <span className="gold-text">Account</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Join the Kingswell Institute of Technology community</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="input-field pl-10" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field pl-10" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors">
                  {showPass ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-gray-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 ${['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-emerald-400'][strength]}`}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`input-field pl-10 ${form.confirm && (form.password === form.confirm ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500')}`}
                  required
                />
                {form.confirm && form.password === form.confirm && (
                  <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={15} />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}
