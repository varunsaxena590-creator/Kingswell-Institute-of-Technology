// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: cloudinary.js                                        ║
// ║  PATH: backend/config/cloudinary.js                         ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → Image upload ka system hai (Multer disk storage).         ║
// ║  → Gallery, Profile aur Course images ke liye alag-alag     ║
// ║    upload folders manage karta hai.                          ║
// ║  → File size limits: Gallery=5MB, Profile=2MB, Course=5MB.  ║
// ║  → Allowed formats: jpeg, jpg, png, webp.                   ║
// ║  → uploads/ folder mein files save hoti hain.               ║
// ║                                                              ║
// ║  EXPORTS: uploadGallery, uploadProfile, uploadCourse         ║
// ╚══════════════════════════════════════════════════════════════╝
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const galleryDir = path.join(__dirname, '..', 'uploads', 'gallery');
const profileDir = path.join(__dirname, '..', 'uploads', 'profiles');
const courseDir  = path.join(__dirname, '..', 'uploads', 'courses');
if (!fs.existsSync(galleryDir)) fs.mkdirSync(galleryDir, { recursive: true });
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
if (!fs.existsSync(courseDir))  fs.mkdirSync(courseDir,  { recursive: true });

const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, galleryDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const allowedTypes = /jpeg|jpg|png|webp/;
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  cb(null, allowedTypes.test(ext));
};

const uploadGallery = multer({ storage: galleryStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadProfile = multer({ storage: profileStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

const courseStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, courseDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const uploadCourse = multer({ storage: courseStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Stub for cloudinary (used in delete)
const cloudinary = { uploader: { destroy: async () => ({}) } };

module.exports = { cloudinary, uploadGallery, uploadProfile, uploadCourse };
