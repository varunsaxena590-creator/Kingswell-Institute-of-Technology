import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaLinkedin,
  FaGraduationCap,
  FaBriefcase,
  FaMapMarkerAlt,
  FaUsers,
  FaArrowRight,
  FaRegBuilding,
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../utils/axios';

export default function AlumniPortal() {
  const [alumni, setAlumni] = useState([]);
  const [search, setSearch] = useState('');
  const [batch, setBatch] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const res = await api.get('/alumni', { params: { search, batch, course } });
      setAlumni(res.data.alumni || res.data.data || []);
    } catch {
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const companies = new Set(alumni.map((a) => a.company).filter(Boolean)).size;
    const batches = new Set(alumni.map((a) => a.batch).filter(Boolean)).size;
    const locations = new Set(alumni.map((a) => a.location).filter(Boolean)).size;
    return {
      total: alumni.length,
      companies,
      batches,
      locations,
    };
  }, [alumni]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-dark min-h-screen">
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%)]" />
          <div className="relative max-w-7xl mx-auto section-padding py-16 md:py-20">
            <div className="max-w-3xl">
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/25 bg-gold/10 text-gold text-xs font-semibold uppercase tracking-[0.3em] mb-6"
              >
                <FaGraduationCap size={12} />
                Alumni Network
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="font-heading text-4xl md:text-6xl font-bold text-white leading-tight"
              >
                Where graduates become
                <span className="gold-text block">industry leaders</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 max-w-2xl mt-5 text-lg leading-relaxed"
              >
                Explore alumni profiles, track career destinations, and discover how Kingswell graduates are contributing across companies and communities.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
              {[
                { label: 'Alumni', value: stats.total, icon: FaUsers },
                { label: 'Companies', value: stats.companies, icon: FaRegBuilding },
                { label: 'Batches', value: stats.batches, icon: FaGraduationCap },
                { label: 'Locations', value: stats.locations, icon: FaMapMarkerAlt },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    className="card border border-white/5 bg-white/[0.03]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-widest">{item.label}</p>
                        <p className="text-white font-heading text-3xl font-bold mt-2">{item.value}</p>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                        <Icon size={18} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto section-padding py-14">
          <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end mb-8">
            <div className="lg:col-span-6 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Search alumni by name, role, company or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
            <input
              type="text"
              placeholder="Batch, e.g. 2024"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="input-field lg:col-span-2"
            />
            <input
              type="text"
              placeholder="Course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="input-field lg:col-span-2"
            />
            <button type="submit" className="btn-gold lg:col-span-2 py-3 flex items-center justify-center gap-2">
              <FaSearch size={13} />
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-heading font-bold text-white text-2xl">Featured Alumni</h2>
              <p className="text-gray-400 text-sm mt-1">Profiles updated from the alumni registry.</p>
            </div>
            <Link to="/placements" className="text-gold text-sm hover:underline inline-flex items-center gap-2">
              View placements
              <FaArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-6 w-24 bg-white/10 rounded mb-4" />
                  <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
                  <div className="h-4 w-full bg-white/10 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          ) : alumni.length === 0 ? (
            <div className="card text-center py-16">
              <FaUsers size={36} className="mx-auto text-gold/40 mb-3" />
              <h3 className="text-white font-semibold text-lg">No alumni found</h3>
              <p className="text-gray-400 text-sm mt-2">Try a different search, batch, or course filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {alumni.map((person, index) => (
                <motion.article
                  key={person._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  className="card group border border-white/5 hover:border-gold/25 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-16 h-16 rounded-2xl bg-gold/15 flex items-center justify-center text-gold text-lg font-bold shrink-0" style={person.photo ? { display: 'none' } : {}}>
                      {(person.name || '?').slice(0, 1)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-white font-semibold text-lg leading-tight">{person.name}</h3>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 uppercase tracking-widest">
                          Batch {person.batch}
                        </span>
                      </div>
                      <p className="text-gold text-sm mt-1">{person.course || 'Graduate'}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-start gap-3 text-sm text-gray-300">
                      <FaBriefcase className="text-gold mt-0.5 shrink-0" size={13} />
                      <div className="min-w-0">
                        <p className="font-medium text-white">{person.currentJob || 'Career update not listed'}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{person.company ? `at ${person.company}` : 'Company not shared'}</p>
                      </div>
                    </div>

                    {person.location && (
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <FaMapMarkerAlt className="text-gold shrink-0" size={13} />
                        <span>{person.location}</span>
                      </div>
                    )}

                    {person.bio && (
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{person.bio}</p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-500">
                      {person.email}
                    </span>
                    {person.linkedin ? (
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-gold hover:text-white transition-colors"
                      >
                        <FaLinkedin size={16} />
                        LinkedIn
                      </a>
                    ) : (
                      <span className="text-xs text-gray-600">No LinkedIn</span>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
