// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: ManageCourses.jsx (Admin Page)                       ║
// ║  PATH: frontend/src/admin/ManageCourses.jsx                 ║
// ║                                                              ║
// ║  KYA HAI? → Admin courses manage karne ka page.              ║
// ║  → Existing courses list dikhata hai.                       ║
// ║  → Edit (inline form) aur delete karna.                     ║
// ║  → AddCourse.jsx se naye courses add hote hain.             ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/ManageCourses.jsx — View, Edit & Delete Courses
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const DEPTS = ['Technology', 'Business', 'Health Sciences', 'Finance', 'Engineering', 'Arts', 'Law'];
const LEVELS = ['Certificate', 'Diploma', 'Undergraduate', 'Postgraduate'];
const MODES = ['Full-time', 'Part-time', 'Online', 'Evening'];

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data.data || []);
      setFiltered(data.data || []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (!search) { setFiltered(courses); return; }
    setFiltered(courses.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase())
    ));
  }, [search, courses]);

  const openEdit = (course) => {
    setEditCourse(course);
    setForm({
      title: course.title || '',
      department: course.department || '',
      level: course.level || '',
      duration: course.duration || '',
      tuitionFee: course.tuitionFee || '',
      mode: course.mode || 'Full-time',
      shortDescription: course.shortDescription || '',
      description: course.description || '',
      featured: course.featured || false,
      requirements: course.requirements?.length ? [...course.requirements] : [''],
      outcomes: course.outcomes?.length ? [...course.outcomes] : [''],
    });
    setImageFile(null);
    setImagePreview(course.image || '');
  };

  const closeEdit = () => {
    setEditCourse(null);
    setForm({});
    setImageFile(null);
    setImagePreview('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleList = (field, i, value) => {
    setForm(p => { const arr = [...p[field]]; arr[i] = value; return { ...p, [field]: arr }; });
  };
  const addListItem = (field) => setForm(p => ({ ...p, [field]: [...p[field], ''] }));
  const removeListItem = (field, i) => setForm(p => ({ ...p, [field]: p[field].filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.title || !form.description || !form.department || !form.duration || !form.tuitionFee || !form.level) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
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

      const { data } = await api.put(`/courses/${editCourse._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCourses(prev => prev.map(c => c._id === editCourse._id ? data.data : c));
      toast.success('Course updated successfully!');
      closeEdit();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course₹')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-white text-2xl">Manage Courses</h2>
          <p className="text-gray-400 text-sm mt-1">{courses.length} courses total</p>
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={13} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or department..."
            className="input-field pl-9 py-2 text-sm w-64"
          />
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading courses...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(course => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-200 border border-gray-800 rounded-xl p-4 flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-dark-300">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FaImage size={20} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{course.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{course.department} · {course.level} · {course.duration}</p>
                <p className="text-gold text-xs mt-0.5">₹ {Number(course.tuitionFee).toLocaleString()}/yr</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(course)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors text-xs font-medium"
                >
                  <FaEdit size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs font-medium"
                >
                  <FaTrash size={11} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">No courses found</div>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-dark-200 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-dark-200 z-10">
                <h3 className="font-heading font-bold text-white text-lg">Edit Course</h3>
                <button onClick={closeEdit} className="text-gray-400 hover:text-white transition-colors">
                  <FaTimes size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
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
                        <FaImage size={28} />
                        <p className="text-sm">Click to upload image</p>
                        <p className="text-xs">JPG, PNG, WEBP · Max 5MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                </div>

                {/* Title */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Course Title *</label>
                  <input name="title" value={form.title || ''} onChange={handleChange} className="input-field" />
                </div>

                {/* Dept + Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Department *</label>
                    <select name="department" value={form.department || ''} onChange={handleChange} className="input-field">
                      {DEPTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Level *</label>
                    <select name="level" value={form.level || ''} onChange={handleChange} className="input-field">
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Duration + Fee + Mode */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Duration *</label>
                    <input name="duration" value={form.duration || ''} onChange={handleChange} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Tuition (₹) *</label>
                    <input name="tuitionFee" type="number" value={form.tuitionFee || ''} onChange={handleChange} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Mode</label>
                    <select name="mode" value={form.mode || 'Full-time'} onChange={handleChange} className="input-field text-sm">
                      {MODES.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Short Desc */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Short Description</label>
                  <input name="shortDescription" value={form.shortDescription || ''} onChange={handleChange} maxLength={200} className="input-field text-sm" />
                </div>

                {/* Full Desc */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Full Description *</label>
                  <textarea name="description" value={form.description || ''} onChange={handleChange} rows={4} className="input-field resize-none text-sm" />
                </div>

                {/* Requirements */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Entry Requirements</label>
                  <div className="space-y-2">
                    {(form.requirements || ['']).map((req, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={req} onChange={e => handleList('requirements', i, e.target.value)} placeholder={`Requirement ${i + 1}`} className="input-field flex-1 text-sm" />
                        {(form.requirements || []).length > 1 && (
                          <button type="button" onClick={() => removeListItem('requirements', i)} className="text-red-400 hover:text-red-300 p-2">
                            <FaTimes size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addListItem('requirements')} className="flex items-center gap-2 text-gold text-xs hover:underline">
                      <FaPlus size={10} /> Add Requirement
                    </button>
                  </div>
                </div>

                {/* Outcomes */}
                <div>
                  <label className="text-gray-400 text-xs uppercase tracking-widest block mb-2">Learning Outcomes</label>
                  <div className="space-y-2">
                    {(form.outcomes || ['']).map((out, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={out} onChange={e => handleList('outcomes', i, e.target.value)} placeholder={`Outcome ${i + 1}`} className="input-field flex-1 text-sm" />
                        {(form.outcomes || []).length > 1 && (
                          <button type="button" onClick={() => removeListItem('outcomes', i)} className="text-red-400 hover:text-red-300 p-2">
                            <FaTimes size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => addListItem('outcomes')} className="flex items-center gap-2 text-gold text-xs hover:underline">
                      <FaPlus size={10} /> Add Outcome
                    </button>
                  </div>
                </div>

                {/* Featured */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="efeatured" name="featured" checked={form.featured || false} onChange={handleChange} className="w-4 h-4 accent-gold" />
                  <label htmlFor="efeatured" className="text-gray-300 text-sm cursor-pointer">Feature this course on the homepage</label>
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSave} disabled={saving} className="btn-gold py-2.5 px-6 disabled:opacity-50 disabled:cursor-not-allowed flex-1">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={closeEdit} className="btn-outline-gold py-2.5 px-5">
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
