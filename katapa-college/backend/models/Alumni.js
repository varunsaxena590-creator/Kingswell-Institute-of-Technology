// Alumni.js
// Model for Alumni Portal

const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  batch: { type: String, required: true },
  course: { type: String },
  currentJob: { type: String },
  company: { type: String },
  location: { type: String },
  bio: { type: String },
  linkedin: { type: String },
  photo: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Alumni', alumniSchema);
