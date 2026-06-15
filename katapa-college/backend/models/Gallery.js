// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Gallery.js (Model)                                   ║
// ║  PATH: backend/models/Gallery.js                             ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for gallery images.              ║
// ║  → Title, description, imageUrl, category store karta hai.  ║
// ║  → Categories: campus, events, sports, lab, library, etc.   ║
// ║                                                              ║
// ║  DB COLLECTION: galleries                                    ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    imageUrl: { type: String, required: [true, 'Image URL is required'] },
    publicId: { type: String, default: '' }, // Cloudinary public_id for deletion
    category: {
      type: String,
      enum: ['Campus', 'Events', 'Sports', 'Academics', 'Graduation', 'Other'],
      default: 'Other',
    },
    featured: { type: Boolean, default: false },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
