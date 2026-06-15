// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: ManageFaculty.jsx (Admin Page)                       ║
// ║  PATH: frontend/src/admin/ManageFaculty.jsx                 ║
// ║                                                              ║
// ║  KYA HAI? → Admin faculty members manage karne ka page.      ║
// ║  → Add, edit, delete faculty members (with photo upload).   ║
// ║  → Department wise filter aur active/inactive toggle.        ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/ManageFaculty.jsx — Add, Edit & Delete Faculty Members
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaImage, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const DEPTS = ['Technology', 'Business', 'Health Sciences', 'Finance', 'Engineering', 'Arts', 'Law', 'Education', 'Administration'];
const TITLES = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Instructor', 'Teaching Assistant', 'HOD', 'Dean', 'Registrar', 'Senior Lecturer'];

const empty = {
  name: '', title: '', dept: '', edu: '', bio: '',
  email: '', linkedin: '', order: 0,
};

export default function ManageFaculty() {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = add new
  const [form, setForm] = useState(empty);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetchMembers = async () => {
    try {
      const { data } = await api.get('/faculty');
      setMembers(data.data || []);
      setFiltered(data.data || []);
    } catch {
      toast.error('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(members); return; }
    setFiltered(members.filter(m =>
      `${m.name} ${m.dept} ${m.title}`.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, members]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(empty);
    setPhotoFile(null);
    setPhotoPreview('');
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditTarget(member);
    setForm({
      name: member.name || '',
      title: member.title || '',
      dept: member.dept || '',
      edu: member.edu || '',
      bio: member.bio || '',
      email: member.email || '',
      linkedin: member.linkedin || '',
      order: member.order || 0,
    });
    setPhotoFile(null);
    setPhotoPreview(member.photo || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm(empty);
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handlePhotoPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Full Name is required'); return; }
    if (!form.title) { toast.error('Please select a Title / Position'); return; }
    if (!form.dept) { toast.error('Please select a Department'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);

      if (editTarget) {
        const { data } = await api.put(`/faculty/${editTarget._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMembers(prev => prev.map(m => m._id === editTarget._id ? data.data : m));
        toast.success('Faculty member updated!');
      } else {
        const { data } = await api.post('/faculty', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMembers(prev => [...prev, data.data]);
        toast.success('Faculty member added!');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return;
    try {
      await api.delete(`/faculty/${id}`);
      setMembers(prev => prev.filter(m => m._id !== id));
      toast.success('Faculty member deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-white text-2xl">Manage Faculty</h2>
          <p className="text-gray-400 text-sm mt-1">{members.length} faculty members</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="input-field pl-9 py-2 text-sm w-52"
            />
          </div>
          <button onClick={openAdd} className="btn-gold py-2 px-4 flex items-center gap-2 text-sm">
            <FaPlus size={12} /> Add Faculty
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(member => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-200 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-dark-300 flex items-center justify-center">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover"
                    onError={e => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-gold-gradient items-center justify-center font-bold text-dark text-lg"
                  style={{ display: member.photo ? 'none' : 'flex' }}
                >
                  {member.initials || member.name?.slice(0,2).toUpperCase()}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{member.name}</p>
                <p className="text-gold text-xs">{member.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{member.dept}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(member)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors text-xs font-medium"
                >
                  <FaEdit size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(member._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-medium"
                >
                  <FaTrash size={11} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              {members.length === 0 ? 'No faculty members yet. Click "Add Faculty" to get started.' : 'No results found.'}
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-dark-200 z-10">
                <h3 className="font-heading font-bold text-white text-lg">
                  {editTarget ? 'Edit Faculty Member' : 'Add New Faculty Member'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Photo Upload */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Photo</label>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-gray-700 hover:border-gold/50 transition-colors cursor-pointer flex items-center justify-center shrink-0 bg-dark-300"
                      onClick={() => fileRef.current.click()}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FaImage className="text-gray-600" size={22} />
                      )}
                    </div>
                    <div>
                      <button type="button" onClick={() => fileRef.current.click()} className="text-gold text-xs hover:underline">
                        {photoPreview ? 'Change Photo' : 'Upload Photo'}
                      </button>
                      <p className="text-gray-600 text-xs mt-1">JPG, PNG · Max 3MB</p>
                    </div>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
                </div>

                {/* Name + Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Dr. Jane Doe" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Title / Position *</label>
                    <select name="title" value={form.title} onChange={handleChange} className="input-field text-sm">
                      <option value="">Select title</option>
                      {TITLES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Dept + Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Department *</label>
                    <select name="dept" value={form.dept} onChange={handleChange} className="input-field text-sm">
                      <option value="">Select department</option>
                      {DEPTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Display Order</label>
                    <input name="order" type="number" value={form.order} onChange={handleChange} placeholder="0" className="input-field text-sm" />
                  </div>
                </div>

                {/* Education */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Education / Qualification</label>
                  <input name="edu" value={form.edu} onChange={handleChange} placeholder="e.g. PhD Computer Science – MIT" className="input-field text-sm" />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Short Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Brief description..." className="input-field resize-none text-sm" />
                </div>

                {/* Email + LinkedIn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="faculty@college.ac.ke" className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">LinkedIn URL</label>
                    <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="input-field text-sm" />
                  </div>
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} disabled={saving} className="btn-gold py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex-1">
                    {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Member'}
                  </button>
                  <button onClick={closeModal} className="btn-outline-gold py-2.5 px-5">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
