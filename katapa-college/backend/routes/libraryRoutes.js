// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: libraryRoutes.js                                     ║
// ║  PATH: backend/routes/libraryRoutes.js                       ║
// ║                                                              ║
// ║  KYA HAI? → Library System ke 8 routes:                      ║
// ║  → GET  /my              → Student ki issued books          ║
// ║  → GET  /books           → All books (admin)                ║
// ║  → POST /books           → Add book (admin)                 ║
// ║  → PUT  /books/:id       → Update book (admin)              ║
// ║  → DELETE /books/:id     → Delete book (admin)              ║
// ║  → GET  /issues          → All issue records (admin)        ║
// ║  → POST /issues          → Issue book to student (admin)    ║
// ║  → PUT  /issues/:id/return → Return book (admin)            ║
// ╚══════════════════════════════════════════════════════════════╝
const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  getAllIssues,
  issueBook,
  returnBook,
  getMyBooks,
} = require('../controllers/libraryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student
router.get('/my',                  protect, getMyBooks);

// Books CRUD (admin)
router.get('/books',               protect, adminOnly, getAllBooks);
router.post('/books',              protect, adminOnly, addBook);
router.put('/books/:id',           protect, adminOnly, updateBook);
router.delete('/books/:id',        protect, adminOnly, deleteBook);

// Issue / Return (admin)
router.get('/issues',              protect, adminOnly, getAllIssues);
router.post('/issues',             protect, adminOnly, issueBook);
router.put('/issues/:id/return',   protect, adminOnly, returnBook);

module.exports = router;
