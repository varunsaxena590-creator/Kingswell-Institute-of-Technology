// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: UploadGallery.jsx (Admin Page)                       ║
// ║  PATH: frontend/src/admin/UploadGallery.jsx                 ║
// ║                                                              ║
// ║  KYA HAI? → Admin gallery image upload page.                 ║
// ║  → Image select karke title, description, category dena.    ║
// ║  → POST /api/gallery pe upload karta hai.                   ║
// ║  → Existing images delete bhi kar sakte hain.               ║
// ╚══════════════════════════════════════════════════════════════╝
// src/admin/UploadGallery.jsx — Gallery Image Upload
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaTrash, FaCheckCircle, FaImage } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../utils/axios';

const CATEGORIES = ['Campus', 'Events', 'Sports', 'Academics', 'Graduation', 'Other'];

export default function UploadGallery() {
  const [files, setFiles] = useState([]);       // preview list
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Campus', featured: false });
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileRef = useRef();

  const handleFiles = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      id: Math.random().toString(36).slice(2),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const item = prev.find(f => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    const newFiles = dropped.map((file) => ({
      file, preview: URL.createObjectURL(file), name: file.name, id: Math.random().toString(36).slice(2),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) { toast.error('Please select at least one image'); return; }
    if (!form.title) { toast.error('Please add a title'); return; }

    setUploading(true);
    const results = [];
    for (const item of files) {
      const fd = new FormData();
      fd.append('image', item.file);
      fd.append('title', form.title || item.name);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('featured', form.featured);
      try {
        const { data } = await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        results.push(data.data);
      } catch (err) {
        toast.error(`Failed to upload ${item.name}: ${err.response?.data?.message || 'Unknown error'}`);
      }
    }
    if (results.length > 0) {
      setUploadedImages((prev) => [...results, ...prev]);
      toast.success(`${results.length} image${results.length > 1 ? 's' : ''} uploaded successfully!`);
      setFiles([]);
      setForm({ title: '', description: '', category: 'Campus', featured: false });
    }
    setUploading(false);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="font-heading font-bold text-white text-2xl">Upload Gallery</h2>
        <p className="text-gray-400 text-sm mt-1">Add images to the college gallery. Powered by Cloudinary.</p>
      </div>

      {/* Upload Form */}
      <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5 space-y-5 mb-6">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/3 transition-all duration-200 group"
        >
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          <FaCloudUploadAlt className="mx-auto text-gray-500 group-hover:text-gold transition-colors mb-3" size={40} />
          <p className="text-gray-300 font-medium">Drag & drop images here</p>
          <p className="text-gray-500 text-sm mt-1">or click to browse files (JPG, PNG, WebP)</p>
        </div>

        {/* Preview grid */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {files.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-dark-400"
                >
                  <img src={item.preview} alt={item.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash size={9} className="text-white" />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-dark/60 py-1 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{item.name}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Graduation Ceremony 2025"
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
              className="input-field text-sm"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs uppercase tracking-widest block mb-1.5">Description (optional)</label>
          <input
            value={form.description}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of the image/event..."
            className="input-field text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="feat" checked={form.featured} onChange={(e) => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-gold" />
          <label htmlFor="feat" className="text-gray-300 text-sm cursor-pointer">Mark as featured</label>
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className="btn-gold py-3 px-7 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FaCloudUploadAlt size={16} />
          {uploading ? 'Uploading...' : `Upload ${files.length > 0 ? files.length : ''} Image${files.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Recently uploaded */}
      {uploadedImages.length > 0 && (
        <div className="bg-dark-200 border border-gray-800 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-400" size={15} /> Recently Uploaded
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedImages.map((img) => (
              <div key={img._id} className="relative aspect-square rounded-xl overflow-hidden bg-dark-400 group">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs text-center px-2">{img.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note about Cloudinary */}
      <div className="mt-5 flex items-start gap-3 bg-gold/5 border border-gold/20 rounded-xl p-4 text-xs text-gray-400">
        <FaImage className="text-gold mt-0.5 shrink-0" size={14} />
        <div>
          <p className="font-semibold text-gray-300 mb-0.5">Cloudinary Integration</p>
          <p>Images are uploaded to your Cloudinary account configured in the backend <code className="text-gold">.env</code> file. Ensure <code className="text-gold">CLOUDINARY_CLOUD_NAME</code>, <code className="text-gold">CLOUDINARY_API_KEY</code>, and <code className="text-gold">CLOUDINARY_API_SECRET</code> are set.</p>
        </div>
      </div>
    </div>
  );
}
