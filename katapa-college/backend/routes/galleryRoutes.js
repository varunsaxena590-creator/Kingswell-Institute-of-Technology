// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: galleryRoutes.js                                     ║
// ║  PATH: backend/routes/galleryRoutes.js                       ║
// ║                                                              ║
// ║  KYA HAI? → Gallery ke 3 routes:                             ║
// ║  → GET    /       → List gallery images (public)            ║
// ║  → POST   /       → Upload image (admin)                    ║
// ║  → DELETE /:id    → Delete image (admin)                    ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getGallery, uploadImage, deleteImage } = require('../controllers/galleryController');
const { uploadGallery } = require('../config/cloudinary');

router.get('/', getGallery);                                                       // Public
router.post('/', protect, adminOnly, uploadGallery.single('image'), uploadImage);  // Admin
router.delete('/:id', protect, adminOnly, deleteImage);                            // Admin

module.exports = router;
