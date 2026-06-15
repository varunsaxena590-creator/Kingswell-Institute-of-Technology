// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Hero3D.jsx (Component)                               ║
// ║  PATH: frontend/src/components/Hero3D.jsx                   ║
// ║                                                              ║
// ║  KYA HAI? → Homepage ka 3D animated hero section.            ║
// ║  → Three.js + @react-three/fiber se 3D scene render.        ║
// ║  → Rotating geometry + particles animation hai.             ║
// ║  → Sirf Home page mein use hota hai.                        ║
// ╚══════════════════════════════════════════════════════════════╝
// src/components/Hero3D.jsx — Three.js 3D Hero Section
import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// ── Animated floating sphere ──────────────────────────────────
function AnimatedSphere() {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.15;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#d4af37"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.9}
          emissive="#6b5300"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </Float>
  );
}

// ── Orbiting rings ────────────────────────────────────────────
// speed > 0 = counterclockwise (left), speed < 0 = clockwise (right)
function OrbitRing({ radius, speed, color }) {
  const dotRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (dotRef.current) {
      dotRef.current.position.x = Math.cos(t) * radius;
      dotRef.current.position.y = Math.sin(t) * radius;
      dotRef.current.position.z = 0;
    }
  });
  return (
    <>
      <mesh>
        <torusGeometry args={[radius, 0.025, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} metalness={1} />
      </mesh>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={4} toneMapped={false} />
      </mesh>
    </>
  );
}

// ── Particle field ────────────────────────────────────────────
function Particles() {
  return (
    <Stars
      radius={60}
      depth={50}
      count={3000}
      factor={3}
      saturation={0}
      fade
      speed={0.5}
    />
  );
}

// ── Scene ─────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#d4af37" />
      <pointLight position={[0, 0, 3]} intensity={1} color="#d4af37" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#fff8e1" />
      <Particles />
      <OrbitRing radius={1.6} speed={-0.8}  color="#f0c040" />
      <OrbitRing radius={2.8} speed={0.5}   color="#d4af37" />
      <OrbitRing radius={3.8} speed={-0.3}  color="#c9a227" />
      <OrbitRing radius={4.6} speed={0.2}   color="#a0821a" />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </>
  );
}

// ── Main Hero Component ───────────────────────────────────────
export default function Hero3D() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-dark">
      {/* 3D Canvas — right half only so rings are clearly visible */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 7], fov: 55 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient — only covers LEFT side for text readability, right side fully clear */}
      <div className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.98) 35%, rgba(10,10,10,0.55) 55%, transparent 75%)' }}
      />



      {/* Hero Content */}
      <div className="relative z-20 section-padding max-w-7xl mx-auto w-full pt-24">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            Admissions Open 2026 / 2027
          </motion.div>

          {/* Heading */}
          <h1 className="font-heading font-bold leading-tight text-5xl md:text-6xl xl:text-7xl text-white mb-6">
            Shape Your{' '}
            <span className="gold-text text-shadow-gold">Future</span>
            <br />
            at Kingswell Institute of Technology
          </h1>

          {/* Sub-heading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl"
          >
            A premier institution offering world-class education in a diverse and innovative environment. Join thousands of successful alumni.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex flex-wrap gap-8 mb-10"
          >
            {[
              { value: '40+', label: 'Years of Excellence' },
              { value: '15,000+', label: 'Alumni Worldwide' },
              { value: '60+', label: 'Degree Programs' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-heading font-bold text-3xl gold-text">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/admission" className="btn-gold text-base px-8 py-3.5">
              Apply Now
            </Link>
            <Link to="/courses" className="btn-outline-gold text-base px-8 py-3.5">
              Explore Courses
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <p className="text-gray-500 text-xs uppercase tracking-widest">Scroll</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-0.5 h-8 bg-gold-gradient rounded-full"
        />
      </motion.div>
    </section>
  );
}
