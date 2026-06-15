// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: galleryController.js                                 ║
// ║  PATH: backend/controllers/galleryController.js              ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Photo gallery manage karta hai.                          ║
// ║  → Images list karta hai (category filter ke saath).        ║
// ║  → Admin image upload aur delete kar sakta hai.             ║
// ║                                                              ║
// ║  FUNCTIONS: getGallery, uploadImage, deleteImage             ║
// ╚══════════════════════════════════════════════════════════════╝
// ========================================
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');

// @desc   Get all gallery images
// @route  GET /api/gallery
// @access Public
const getGallery = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const images = await Gallery.find(filter)
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: images.length, data: images });
});

// @desc   Upload image to gallery
// @route  POST /api/gallery
// @access Admin
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file provided');
  }

  const image = await Gallery.create({
    title: req.body.title || req.file.originalname,
    description: req.body.description || '',
    category: req.body.category || 'Other',
    imageUrl: `/uploads/gallery/${req.file.filename}`,
    publicId: req.file.filename,
    featured: req.body.featured === 'true',
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, message: 'Image uploaded successfully', data: image });
});

// @desc   Delete gallery image
// @route  DELETE /api/gallery/:id
// @access Admin
const deleteImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  // Remove local file
  const filePath = path.join(__dirname, '..', 'uploads', 'gallery', image.publicId);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  await Gallery.findByIdAndDelete(req.params.id);

  res.json({ success: true, message: 'Image deleted successfully' });
});

module.exports = { getGallery, uploadImage, deleteImage };
