// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Gallery.jsx (Public Page)                            ║
// ║  PATH: frontend/src/pages/Gallery.jsx                       ║
// ║                                                              ║
// ║  KYA HAI? → Photo gallery page.                              ║
// ║  → Category wise filter (campus, events, sports, etc.)     ║
// ║  → Image click pe lightbox modal khulta hai.                ║
// ║  → Route: /gallery                                          ║
// ╚══════════════════════════════════════════════════════════════╝
// src/pages/Gallery.jsx — Photo Gallery Page
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionHeader from '../components/SectionHeader';
import api from '../utils/axios';

const CATEGORIES = ['All', 'Campus', 'Events', 'Sports', 'Academics', 'Graduation', 'Other'];

// Placeholder gallery items (used when API is not connected)
const PLACEHOLDER = [
  { _id: '1', title: 'Graduation Ceremony 2024', category: 'Graduation', imageUrl: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&q=80' },
  { _id: '2', title: 'Science Lab', category: 'Academics', imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80' },
  { _id: '3', title: 'Sports Day', category: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1461896836934-bd45ba7296a7?w=800&q=80' },
  { _id: '4', title: 'Library', category: 'Campus', imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80' },
  { _id: '5', title: 'Campus Garden', category: 'Campus', imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80' },
  { _id: '6', title: 'Tech Expo', category: 'Events', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
  { _id: '7', title: 'Cultural Week', category: 'Events', imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80' },
  { _id: '8', title: 'Computer Lab', category: 'Academics', imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80' },
  { _id: '9', title: 'Football Finals', category: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80' },
  { _id: '10', title: 'Seminar Hall', category: 'Academics', imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80' },
  { _id: '11', title: 'Hostel Block A', category: 'Campus', imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80' },
  { _id: '12', title: 'Main Entrance', category: 'Campus', imageUrl: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=800&q=80' },
];

export default function Gallery() {
  const [images, setImages] = useState(PLACEHOLDER);
  const [filtered, setFiltered] = useState(PLACEHOLDER);
  const [category, setCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null); // index of open image

  useEffect(() => {
    api.get('/gallery')
      .then(({ data }) => { if (data.data?.length) { setImages(data.data); setFiltered(data.data); } })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setFiltered(category === 'All' ? images : images.filter(img => img.category === category));
  }, [category, images]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handler = (e) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox(prev => (prev + 1) % filtered.length);
      if (e.key === 'ArrowLeft') setLightbox(prev => (prev - 1 + filtered.length) % filtered.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, filtered.length]);

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 bg-dark-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.08),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto section-padding relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm font-semibold uppercase tracking-widest">Campus Life</span>
            <h1 className="section-title mt-2">
              Photo <span className="gold-text">Gallery</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mt-3">A glimpse into life at Kingswell Institute of Technology.</p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-dark border-b border-gray-800 sticky top-16 md:top-20 z-40 glass">
        <div className="max-w-7xl mx-auto section-padding flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === cat ? 'bg-gold text-dark' : 'bg-dark-300 text-gray-400 hover:text-gold border border-gray-700 hover:border-gold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Masonry-style Grid */}
      <section className="py-16 bg-dark">
        <div className="max-w-7xl mx-auto section-padding">
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            <AnimatePresence>
              {filtered.map((img, i) => (
                <motion.div
                  key={img._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl"
                  onClick={() => setLightbox(i)}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/60 transition-all duration-300 rounded-xl flex items-end">
                    <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-medium">{img.title}</p>
                      <span className="text-gold text-xs">{img.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 text-white hover:text-gold p-2"
              onClick={() => setLightbox(null)}
            >
              <FaTimes size={24} />
            </button>
            {/* Prev */}
            <button
              className="absolute left-4 text-white hover:text-gold p-2"
              onClick={(e) => { e.stopPropagation(); setLightbox(prev => (prev - 1 + filtered.length) % filtered.length); }}
            >
              <FaChevronLeft size={28} />
            </button>
            {/* Image */}
            <motion.img
              key={lightbox}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={filtered[lightbox]?.imageUrl}
              alt={filtered[lightbox]?.title}
              className="max-h-[85vh] max-w-[85vw] rounded-xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Next */}
            <button
              className="absolute right-4 text-white hover:text-gold p-2"
              onClick={(e) => { e.stopPropagation(); setLightbox(prev => (prev + 1) % filtered.length); }}
            >
              <FaChevronRight size={28} />
            </button>
            {/* Caption */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <p className="text-white font-semibold">{filtered[lightbox]?.title}</p>
              <p className="text-gold text-sm">{filtered[lightbox]?.category} · {lightbox + 1} / {filtered.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
