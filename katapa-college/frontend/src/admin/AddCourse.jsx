// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: AddCourse.jsx (Admin Page)                           ║
// ║  PATH: frontend/src/admin/AddCourse.jsx                     ║
// ║                                                              ║
// ║  KYA HAI? → Admin ke liye new course create karne ka form.   ║
// ║  → Course title, department, duration, fee, image upload.   ║
// ║  → POST /api/courses pe data bhejta hai.                    ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/AddCourse.jsx — Create New Course
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaCheckCircle, FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const initialForm = {
  title: '', description: '', shortDescription: '', department: '',
  duration: '', credits: '', tuitionFee: '', level: '', mode: 'Full-time',
  requirements: [''], outcomes: [''], featured: false,
};

export default function AddCourse() {
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleList = (field, i, value) => {
    setForm((p) => {
      const arr = [...p[field]];
      arr[i] = value;
      return { ...p, [field]: arr };
    });
  };

  const addListItem = (field) => setForm((p) => ({ ...p, [field]: [...p[field], ''] }));
  const removeListItem = (field, i) => setForm((p) => ({ ...p, [field]: p[field].filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.department || !form.duration || !form.tuitionFee || !form.level) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'requirements' || k === 'outcomes') {
          fd.append(k, JSON.stringify(v.filter(Boolean)));
        } else {
          fd.append(k, v);
        }
      });
      if (imageFile) fd.append('image', imageFile);

      await api.post('/courses', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      toast.success('Course created successfully!');
      setForm(initialForm);
      setImageFile(null);
      setImagePreview('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-white text-2xl">Add New Course</h2>
        <p className="text-gray-400 text-sm mt-1">Create a new academic programme for the college.</p>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-5 text-sm"
        >
          <FaCheckCircle /> Course created successfully!
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FaBookOpen className="text-gold" size={15} /> Basic Information
          </h3>

          {/* Image Upload */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Course Image</label>
            <div
              className="border-2 border-dashed border-gray-700 hover:border-gold/50 rounded-xl transition-colors cursor-pointer overflow-hidden"
              onClick={() => fileRef.current.click()}
            >
              {imagePreview ? (
                <div className="relative group">
                  <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-sm flex items-center gap-2"><FaImage /> Click to change image</p>
                  </div>
                </div>
              ) : (
                <div className="h-36 flex flex-col items-center justify-center text-gray-500 gap-2">
                  <FaImage size={30} />
                  <p className="text-sm">Click to upload course image</p>
                  <p className="text-xs">JPG, PNG, WEBP � Max 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Course Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. BSc Computer Science" className="input-field" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Department *</label>
              <select name="department" value={form.department} onChange={handleChange} className="input-field" required>
                <option value="">Select department</option>
                {['Technology', 'Business', 'Health Sciences', 'Finance', 'Engineering', 'Arts', 'Law'].map(d => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Level *</label>
              <select name="level" value={form.level} onChange={handleChange} className="input-field" required>
                <option value="">Select level</option>
                {['Certificate', 'Diploma', 'Undergraduate', 'Postgraduate'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Duration *</label>
              <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 4 Years" className="input-field" required />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Tuition Fee (₹) *</label>
              <input name="tuitionFee" type="number" value={form.tuitionFee} onChange={handleChange} placeholder="85000" className="input-field" required />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Mode</label>
              <select name="mode" value={form.mode} onChange={handleChange} className="input-field">
                {['Full-time', 'Part-time', 'Online', 'Evening'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Short Description (max 200 chars)</label>
            <input name="shortDescription" value={form.shortDescription} onChange={handleChange} maxLength={200} placeholder="Brief overview shown on cards..." className="input-field" />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Full Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Detailed course description..." className="input-field resize-none" required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-gold" />
            <label htmlFor="featured" className="text-gray-300 text-sm cursor-pointer">Feature this course on the homepage</label>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-white">Entry Requirements</h3>
          {form.requirements.map((req, i) => (
            <div key={i} className="flex gap-2">
              <input value={req} onChange={(e) => handleList('requirements', i, e.target.value)} placeholder={`Requirement ${i + 1}`} className="input-field flex-1 text-sm" />
              {form.requirements.length > 1 && (
                <button type="button" onClick={() => removeListItem('requirements', i)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                  <FaTrash size={13} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addListItem('requirements')} className="flex items-center gap-2 text-gold text-sm hover:underline">
            <FaPlus size={11} /> Add Requirement
          </button>
        </div>

        {/* Outcomes */}
        <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-white">Learning Outcomes</h3>
          {form.outcomes.map((out, i) => (
            <div key={i} className="flex gap-2">
              <input value={out} onChange={(e) => handleList('outcomes', i, e.target.value)} placeholder={`Outcome ${i + 1}`} className="input-field flex-1 text-sm" />
              {form.outcomes.length > 1 && (
                <button type="button" onClick={() => removeListItem('outcomes', i)} className="text-red-400 hover:text-red-300 p-2 transition-colors">
                  <FaTrash size={13} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addListItem('outcomes')} className="flex items-center gap-2 text-gold text-sm hover:underline">
            <FaPlus size={11} /> Add Outcome
          </button>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-gold py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <button type="button" onClick={() => setForm(initialForm)} className="btn-outline-gold py-3 px-6">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
