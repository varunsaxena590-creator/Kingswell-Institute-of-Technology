// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: email.js                                             ║
// ║  PATH: backend/config/email.js                              ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → Nodemailer transporter setup hai email bhejne ke liye.   ║
// ║  → Gmail SMTP use karta hai (.env se credentials leta hai). ║
// ║  → emailService.js isko use karta hai emails bhejne ke liye.║
// ║                                                              ║
// ║  .ENV VARIABLES NEEDED: EMAIL_HOST, EMAIL_PORT,             ║
// ║                         EMAIL_USER, EMAIL_PASS              ║
// ╚══════════════════════════════════════════════════════════════╝
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
