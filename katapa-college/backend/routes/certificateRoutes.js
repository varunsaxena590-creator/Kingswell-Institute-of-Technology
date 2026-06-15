// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: certificateRoutes.js                                 ║
// ║  PATH: backend/routes/certificateRoutes.js                   ║
// ║                                                              ║
// ║  KYA HAI?                                                    ║
// ║  → Certificate generator ke routes define hain.             ║
// ║  → Admin: generate, getAll, revoke, delete                  ║
// ║  → Student: getMy                                           ║
// ║  → Public: verify by cert number                            ║
// ║                                                              ║
// ║  BASE: /api/certificates                                     ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  generateCertificate,
  getAllCertificates,
  getMyCertificates,
  verifyCertificate,
  revokeCertificate,
  deleteCertificate,
} = require('../controllers/certificateController');

// Public
router.get('/verify/:certNo', verifyCertificate);

// Student (protected)
router.get('/my', protect, getMyCertificates);

// Admin
router.post('/',              protect, adminOnly, generateCertificate);
router.get('/',               protect, adminOnly, getAllCertificates);
router.put('/:id/revoke',    protect, adminOnly, revokeCertificate);
router.delete('/:id',        protect, adminOnly, deleteCertificate);

module.exports = router;
