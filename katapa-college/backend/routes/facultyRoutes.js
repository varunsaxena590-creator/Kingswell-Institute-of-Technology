// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: facultyRoutes.js                                     ║
// ║  PATH: backend/routes/facultyRoutes.js                       ║
// ║                                                              ║
// ║  KYA HAI? → Faculty CRUD ke 4 routes (photo upload sahit):   ║
// ║  → GET    /       → List faculty (public)                   ║
// ║  → POST   /       → Add faculty (admin + photo)             ║
// ║  → PUT    /:id    → Update faculty (admin + photo)          ║
// ║  → DELETE /:id    → Remove faculty (admin)                  ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getFaculty, createFaculty, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const facultyDir = path.join(__dirname, '..', 'uploads', 'faculty');
if (!fs.existsSync(facultyDir)) fs.mkdirSync(facultyDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, facultyDir),
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
const upload = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });

router.get('/',        getFaculty);
router.post('/',       protect, adminOnly, upload.single('photo'), createFaculty);
router.put('/:id',     protect, adminOnly, upload.single('photo'), updateFaculty);
router.delete('/:id',  protect, adminOnly, deleteFaculty);

module.exports = router;
