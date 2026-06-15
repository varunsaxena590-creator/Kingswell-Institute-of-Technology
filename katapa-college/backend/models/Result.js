// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: Result.js (Model)                                    ║
// ║  PATH: backend/models/Result.js                              ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for student exam results.        ║
// ║  → Marks, percentage aur auto-calculated grade (A+ to F).   ║
// ║  → Publish flag — student tab hi dekh sakta jab published.  ║
// ║                                                              ║
// ║  DB COLLECTION: results                                      ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');

// Auto-calculate grade from percentage
function getGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

const subjectSchema = new mongoose.Schema({
  subject:    { type: String, required: true, trim: true },
  marksObtained: { type: Number, required: true, min: 0 },
  totalMarks:    { type: Number, required: true, min: 1 },
  percentage:    { type: Number },
  grade:         { type: String },
}, { _id: false });

const resultSchema = new mongoose.Schema(
  {
    student:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    semester: { type: String, required: true, trim: true },
    examType: { type: String, enum: ['midterm', 'final', 'assignment', 'practical'], default: 'final' },
    subjects: [subjectSchema],
    // Computed overall
    overallPercentage: { type: Number },
    overallGrade:      { type: String },
    remarks:           { type: String, default: '' },
    publishedAt:       { type: Date, default: null }, // null = not published yet
  },
  { timestamps: true }
);

// Auto-calculate percentage and grade before save
resultSchema.pre('save', function (next) {
  this.subjects = this.subjects.map(s => {
    const pct = Math.round((s.marksObtained / s.totalMarks) * 100);
    return { ...s.toObject(), percentage: pct, grade: getGrade(pct) };
  });
  if (this.subjects.length) {
    const avg = this.subjects.reduce((sum, s) => sum + s.percentage, 0) / this.subjects.length;
    this.overallPercentage = Math.round(avg);
    this.overallGrade = getGrade(avg);
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
