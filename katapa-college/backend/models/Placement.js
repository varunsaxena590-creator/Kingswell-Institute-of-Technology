// Placement.js
// Model for Placement Cell (jobs, company visits, stats)

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  salary: { type: String },
  eligibility: { type: String },
  applyLink: { type: String },
  postedAt: { type: Date, default: Date.now },
  deadline: { type: Date },
});

const companyVisitSchema = new mongoose.Schema({
  company: { type: String, required: true },
  visitDate: { type: Date, required: true },
  description: { type: String },
  contactPerson: { type: String },
});

const placementStatsSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  totalStudents: { type: Number, required: true },
  placed: { type: Number, required: true },
  highestPackage: { type: String },
  averagePackage: { type: String },
  companiesVisited: { type: Number },
});

module.exports = {
  Job: mongoose.model('Job', jobSchema),
  CompanyVisit: mongoose.model('CompanyVisit', companyVisitSchema),
  PlacementStats: mongoose.model('PlacementStats', placementStatsSchema),
};
