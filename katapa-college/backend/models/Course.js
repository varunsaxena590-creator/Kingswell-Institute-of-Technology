// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Course.js (Model)                                    ║
// ║  PATH: backend/models/Course.js                              ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for courses.                     ║
// ║  → Title, slug, department, duration, tuitionFee, etc.      ║
// ║  → Featured courses homepage pe dikhte hain.                ║
// ║                                                              ║
// ║  DB COLLECTION: courses                                      ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course title is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, maxlength: 200 },
    department: { type: String, required: [true, 'Department is required'] },
    duration: { type: String, required: [true, 'Duration is required'] }, // e.g. "3 Years"
    credits: { type: Number, default: 0 },
    tuitionFee: { type: Number, required: [true, 'Tuition fee is required'] },
    image: { type: String, default: '' },
    level: {
      type: String,
      enum: ['Certificate', 'Diploma', 'Undergraduate', 'Postgraduate'],
      required: true,
    },
    mode: { type: String, enum: ['Full-time', 'Part-time', 'Online', 'Evening'], default: 'Full-time' },
    requirements: [{ type: String }],
    outcomes: [{ type: String }],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    enrollmentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from title
courseSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
