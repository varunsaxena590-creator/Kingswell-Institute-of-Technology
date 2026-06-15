// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Profile.jsx (Protected Page)                         ║
// ║  PATH: frontend/src/pages/Profile.jsx                       ║
// ║                                                              ║
// ║  KYA HAI? → User profile page (student + admin dono ke liye).║
// ║  → Name, email, photo dikhata + edit karna.                 ║
// ║  → Password change bhi kar sakte hain.                      ║
// ║  → Route: /profile (protected — login required)             ║
// ╚══════════════════════════════════════════════════════════════╝
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, FaCity,
  FaCheckCircle, FaExclamationTriangle, FaCamera, FaEdit, FaSave,
  FaTimes, FaGraduationCap, FaIdCard, FaCalendarAlt, FaShieldAlt,
  FaEye, FaEyeSlash, FaSpinner,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

// ── Avatar with initials fallback ───────────────────────────────
function Avatar({ src, name, size = 'lg' }) {
  const [error, setError] = useState(false);
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const dim = size === 'lg' ? 'w-28 h-28 text-3xl' : 'w-10 h-10 text-sm';
  if (src && !error) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setError(true)}
        className={`${dim} rounded-full object-cover border-2 border-[#d4af37]`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-[#d4af37] to-[#a0821a] text-black border-2 border-[#d4af37]`}>
      {initials}
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────
function Section({ title, icon, children }) {
  return (
    <div className="bg-[#141420] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6">
      <h2 className="text-[#d4af37] font-semibold text-sm uppercase tracking-widest flex items-center gap-2 mb-5">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

// ── Input field ──────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', disabled = false, placeholder, suffix }) {
  return (
    <div>
      <label className="block text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-2.5 text-sm text-white placeholder-[rgba(255,255,255,0.2)] focus:outline-none transition-colors
            ${disabled
              ? 'border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.3)] cursor-not-allowed'
              : 'border-[rgba(255,255,255,0.08)] focus:border-[#d4af37]'
            }
            ${suffix ? 'pr-10' : ''}
          `}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
      </div>
    </div>
  );
}

// ── Info row (read-only) ─────────────────────────────────────────
function InfoRow({ label, value, badge, badgeColor }) {
  const colors = {
    green:  'bg-[rgba(52,211,153,.1)] border-[rgba(52,211,153,.3)] text-[#34d399]',
    red:    'bg-[rgba(248,113,113,.1)] border-[rgba(248,113,113,.3)] text-[#f87171]',
    gold:   'bg-[rgba(212,175,55,.1)]  border-[rgba(212,175,55,.3)]  text-[#d4af37]',
    blue:   'bg-[rgba(96,165,250,.1)]  border-[rgba(96,165,250,.3)]  text-[#60a5fa]',
    orange: 'bg-[rgba(251,146,60,.1)]  border-[rgba(251,146,60,.3)]  text-[#fb923c]',
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
      <span className="text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-widest">{label}</span>
      {badge ? (
        <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${colors[badgeColor] || colors.gold}`}>{value}</span>
      ) : (
        <span className="text-sm text-white font-medium">{value || '—'}</span>
      )}
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 80, opacity: 0 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border max-w-xs
        ${ok ? 'bg-[#0f2318] border-[rgba(52,211,153,.3)] text-[#34d399]' : 'bg-[#2b1111] border-[rgba(248,113,113,.3)] text-[#f87171]'}`}
    >
      {ok ? <FaCheckCircle /> : <FaExclamationTriangle />}
      <span className="text-sm">{toast.message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><FaTimes /></button>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
export default function Profile() {
  const { user, updateUser } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Account fields
  const [name, setName]       = useState(user?.name || '');
  const [avatar, setAvatar]   = useState(user?.avatar || '');
  const [editingAccount, setEditingAccount] = useState(false);
  const [savingAccount, setSavingAccount]   = useState(false);

  // Password
  const [currentPass, setCurrentPass]   = useState('');
  const [newPass, setNewPass]           = useState('');
  const [confirmPass, setConfirmPass]   = useState('');
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [savingPass, setSavingPass]     = useState(false);

  // Student contact fields
  const [phone, setPhone]     = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity]       = useState('');
  const [country, setCountry] = useState('');
  const [editingContact, setEditingContact] = useState(false);
  const [savingContact, setSavingContact]   = useState(false);

  // Student admission info (read-only)
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(!isAdmin);

  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Load student profile ──────────────────────────────────────
  useEffect(() => {
    if (isAdmin) return;
    api.get('/students/my-profile')
      .then(({ data }) => {
        const s = data.data;
        setStudentProfile(s);
        setPhone(s.phone || '');
        setAddress(s.address || '');
        setCity(s.city || '');
        setCountry(s.country || '');
        if (s.profilePhoto) setAvatar(s.profilePhoto);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [isAdmin]);

  // Sync name from user context
  useEffect(() => {
    setName(user?.name || '');
    setAvatar(user?.avatar || '');
  }, [user]);

  // ── Avatar: convert file to base64 ───────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      setEditingAccount(true);
    };
    reader.readAsDataURL(file);
  };

  // ── Save account (name + avatar) ─────────────────────────────
  const saveAccount = async () => {
    if (!name.trim()) { showToast('Name cannot be empty', 'error'); return; }
    setSavingAccount(true);
    try {
      const { data } = await api.put('/auth/profile', { name: name.trim(), avatar });
      updateUser({ name: data.data.name, avatar: data.data.avatar, token: data.data.token });
      // Also update student profilePhoto if student
      if (!isAdmin && studentProfile) {
        await api.put('/students/my-profile', { profilePhoto: avatar }).catch(() => {});
      }
      setEditingAccount(false);
      showToast('Account updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update account', 'error');
    } finally {
      setSavingAccount(false);
    }
  };

  // ── Save password ─────────────────────────────────────────────
  const savePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      showToast('All password fields are required', 'error'); return;
    }
    if (newPass.length < 6) {
      showToast('New password must be at least 6 characters', 'error'); return;
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match', 'error'); return;
    }
    setSavingPass(true);
    try {
      // Verify current password by logging in
      await api.post('/auth/login', { email: user.email, password: currentPass });
      const { data } = await api.put('/auth/profile', { password: newPass });
      updateUser({ token: data.data.token });
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
      showToast('Password changed successfully!');
    } catch {
      showToast('Current password is incorrect', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  // ── Save student contact info ─────────────────────────────────
  const saveContact = async () => {
    if (!phone.trim() || !address.trim() || !city.trim()) {
      showToast('Phone, address, and city are required', 'error'); return;
    }
    setSavingContact(true);
    try {
      const { data } = await api.put('/students/my-profile', {
        phone: phone.trim(), address: address.trim(), city: city.trim(), country: country.trim(),
      });
      setStudentProfile(data.data);
      setEditingContact(false);
      showToast('Contact info updated!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update contact info', 'error');
    } finally {
      setSavingContact(false);
    }
  };

  const statusColor = {
    accepted:     'green',
    rejected:     'red',
    pending:      'orange',
    under_review: 'blue',
  };
  const statusLabel = {
    accepted:     'Accepted',
    rejected:     'Rejected',
    pending:      'Pending',
    under_review: 'Under Review',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-[rgba(255,255,255,0.4)] text-sm mt-1">
            Manage your account information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══ Left: Avatar + quick info ══ */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-5"
          >
            {/* Avatar card */}
            <div className="bg-[#141420] border border-[rgba(212,175,55,0.15)] rounded-2xl p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar src={avatar} name={name || user?.name} size="lg" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#d4af37] text-black flex items-center justify-center hover:bg-[#f0d060] transition-colors"
                  title="Change photo"
                >
                  <FaCamera className="text-xs" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <h2 className="text-white font-bold text-lg">{user?.name}</h2>
              <p className="text-[rgba(255,255,255,0.4)] text-sm">{user?.email}</p>
              <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border
                ${isAdmin
                  ? 'bg-[rgba(212,175,55,.1)] border-[rgba(212,175,55,.3)] text-[#d4af37]'
                  : 'bg-[rgba(96,165,250,.1)] border-[rgba(96,165,250,.3)] text-[#60a5fa]'
                }`}
              >
                {isAdmin ? 'Admin' : 'Student'}
              </span>
              <p className="text-xs text-[rgba(255,255,255,0.2)] mt-3">
                Max 2MB · JPG, PNG, WEBP
              </p>
            </div>

            {/* Student admission summary */}
            {!isAdmin && (
              <div className="bg-[#141420] border border-[rgba(212,175,55,0.15)] rounded-2xl p-5">
                <h2 className="text-[#d4af37] font-semibold text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaGraduationCap /> Admission Info
                </h2>
                {profileLoading ? (
                  <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-[#d4af37] text-xl" /></div>
                ) : studentProfile ? (
                  <>
                    <InfoRow label="ADM Number" value={studentProfile.admissionNumber || 'Not Assigned'} />
                    <InfoRow label="Status" value={statusLabel[studentProfile.status] || studentProfile.status} badge badgeColor={statusColor[studentProfile.status] || 'gold'} />
                    <InfoRow label="Course" value={studentProfile.courseApplied?.title} />
                    <InfoRow label="Level" value={studentProfile.courseApplied?.level} />
                    <InfoRow label="Applied" value={studentProfile.applicationDate ? new Date(studentProfile.applicationDate).toLocaleDateString('en-GB') : '—'} />
                  </>
                ) : (
                  <p className="text-xs text-[rgba(255,255,255,0.3)] text-center py-2">No admission record found</p>
                )}
              </div>
            )}
          </motion.div>

          {/* ══ Right: Forms ══ */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-2 space-y-5"
          >

            {/* Account info */}
            <Section title="Account Information" icon={<FaUser />}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Full Name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setEditingAccount(true); }}
                    placeholder="Your name"
                  />
                  <Field label="Email Address" value={user?.email || ''} disabled />
                </div>
                <Field
                  label="Avatar URL (or use camera button to upload)"
                  value={avatar}
                  onChange={(e) => { setAvatar(e.target.value); setEditingAccount(true); }}
                  placeholder="https://... or leave blank"
                />
                <AnimatePresence>
                  {editingAccount && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
                      <button
                        onClick={saveAccount}
                        disabled={savingAccount}
                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#a0821a] text-black font-bold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {savingAccount ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        Save Changes
                      </button>
                      <button
                        onClick={() => { setName(user?.name || ''); setAvatar(user?.avatar || ''); setEditingAccount(false); }}
                        className="flex items-center gap-2 px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.5)] text-sm rounded-xl hover:border-[rgba(255,255,255,0.2)] transition-colors"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Section>

            {/* Student contact info */}
            {!isAdmin && studentProfile && (
              <Section title="Contact Information" icon={<FaMapMarkerAlt />}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-[rgba(255,255,255,0.3)]">Update your contact details</p>
                    {!editingContact && (
                      <button
                        onClick={() => setEditingContact(true)}
                        className="flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-[#f0d060] transition-colors"
                      >
                        <FaEdit /> Edit
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editingContact} placeholder="+254 xxx xxx xxx" />
                    <Field label="City" value={city} onChange={(e) => setCity(e.target.value)} disabled={!editingContact} placeholder="Nairobi" />
                  </div>
                  <Field label="Address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!editingContact} placeholder="Street address" />
                  <Field label="Country" value={country} onChange={(e) => setCountry(e.target.value)} disabled={!editingContact} placeholder="Kenya" />
                  <AnimatePresence>
                    {editingContact && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
                        <button
                          onClick={saveContact}
                          disabled={savingContact}
                          className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#a0821a] text-black font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-50"
                        >
                          {savingContact ? <FaSpinner className="animate-spin" /> : <FaSave />}
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setPhone(studentProfile.phone || '');
                            setAddress(studentProfile.address || '');
                            setCity(studentProfile.city || '');
                            setCountry(studentProfile.country || '');
                            setEditingContact(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.5)] text-sm rounded-xl hover:border-[rgba(255,255,255,0.2)] transition-colors"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Section>
            )}

            {/* Personal details (student read-only) */}
            {!isAdmin && studentProfile && (
              <Section title="Personal Details" icon={<FaIdCard />}>
                <div className="grid grid-cols-2 gap-0">
                  <InfoRow label="First Name" value={studentProfile.firstName} />
                  <InfoRow label="Last Name" value={studentProfile.lastName} />
                  <InfoRow label="Gender" value={studentProfile.gender} />
                  <InfoRow label="Date of Birth" value={studentProfile.dateOfBirth ? new Date(studentProfile.dateOfBirth).toLocaleDateString('en-GB') : '—'} />
                  <InfoRow label="Previous School" value={studentProfile.previousSchool} />
                  <InfoRow label="Previous Grade" value={studentProfile.previousGrade} />
                </div>
                <p className="text-xs text-[rgba(255,255,255,0.2)] mt-3 flex items-center gap-1">
                  <FaShieldAlt /> Personal details can only be changed by admin
                </p>
              </Section>
            )}

            {/* Change password */}
            <Section title="Change Password" icon={<FaLock />}>
              <div className="space-y-4">
                <Field
                  label="Current Password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  suffix={
                    <button type="button" onClick={() => setShowCurrent((p) => !p)} className="text-[rgba(255,255,255,0.3)] hover:text-[#d4af37]">
                      {showCurrent ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  }
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="New Password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    type={showNew ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    suffix={
                      <button type="button" onClick={() => setShowNew((p) => !p)} className="text-[rgba(255,255,255,0.3)] hover:text-[#d4af37]">
                        {showNew ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    }
                  />
                  <Field
                    label="Confirm New Password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    type="password"
                    placeholder="Re-enter new password"
                  />
                </div>
                {/* Password strength bar */}
                {newPass && (
                  <div>
                    <div className="h-1 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500
                          ${newPass.length < 6 ? 'w-1/4 bg-[#f87171]'
                          : newPass.length < 10 ? 'w-2/4 bg-[#fb923c]'
                          : newPass.length < 14 ? 'w-3/4 bg-[#d4af37]'
                          : 'w-full bg-[#34d399]'
                          }`}
                      />
                    </div>
                    <p className="text-xs text-[rgba(255,255,255,0.3)] mt-1">
                      {newPass.length < 6 ? 'Too short' : newPass.length < 10 ? 'Weak' : newPass.length < 14 ? 'Good' : 'Strong'}
                    </p>
                  </div>
                )}
                {confirmPass && newPass !== confirmPass && (
                  <p className="text-xs text-[#f87171] flex items-center gap-1"><FaExclamationTriangle /> Passwords do not match</p>
                )}
                <button
                  onClick={savePassword}
                  disabled={savingPass || !currentPass || !newPass || !confirmPass}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.3)] text-[#d4af37] font-semibold text-sm rounded-xl hover:bg-[rgba(212,175,55,0.2)] transition-colors disabled:opacity-40"
                >
                  {savingPass ? <FaSpinner className="animate-spin" /> : <FaLock />}
                  Update Password
                </button>
              </div>
            </Section>

          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </AnimatePresence>
    </div>
  );
}
