// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: User.js (Model)                                      ║
// ║  PATH: backend/models/User.js                                ║
// ║                                                              ║
// ║  KYA HAI? → Mongoose Schema for auth users.                  ║
// ║  → Name, email, password (bcrypt hashed), role (admin/user). ║
// ║  → isActive flag se user ko disable bhi kar sakte hain.     ║
// ║  → Password save hone se pehle auto-hash hota hai.          ║
// ║                                                              ║
// ║  DB COLLECTION: users                                        ║
// ╚══════════════════════════════════════════════════════════════╝
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
