// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: libraryController.js                                 ║
// ║  PATH: backend/controllers/libraryController.js              ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Books CRUD (admin): add, edit, delete, list.             ║
// ║  → Issue book to student, return book, mark overdue.        ║
// ║  → Student apni issued books dekh sakta hai.                ║
// ║  → Fine auto-calculate hota hai late return pe.             ║
// ║                                                              ║
// ║  FUNCTIONS: getAllBooks, addBook, updateBook, deleteBook,    ║
// ║    issueBook, returnBook, getAllIssues, getMyBooks           ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const BookIssue = require('../models/BookIssue');
const Student = require('../models/Student');

const FINE_PER_DAY = 10; // fine per overdue day

// ══════════════════════════════════════════════════════════════
//  BOOK CRUD (Admin)
// ══════════════════════════════════════════════════════════════

// ── GET all books ───────────────────────────────────────────────
const getAllBooks = asyncHandler(async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json({ success: true, data: books });
});

// ── ADD book ────────────────────────────────────────────────────
const addBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, category, publisher, publishYear, description, totalCopies, shelfLocation } = req.body;
  if (!title || !author) {
    res.status(400);
    throw new Error('Title and author are required');
  }
  const copies = Number(totalCopies) || 1;
  const book = await Book.create({
    title, author, isbn, category, publisher, publishYear, description,
    totalCopies: copies,
    availableCopies: copies,
    shelfLocation,
  });
  res.status(201).json({ success: true, data: book });
});

// ── UPDATE book ─────────────────────────────────────────────────
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const fields = ['title', 'author', 'isbn', 'category', 'publisher', 'publishYear', 'description', 'shelfLocation'];
  fields.forEach(f => { if (req.body[f] !== undefined) book[f] = req.body[f]; });

  // If totalCopies changed, adjust availableCopies proportionally
  if (req.body.totalCopies !== undefined) {
    const diff = Number(req.body.totalCopies) - book.totalCopies;
    book.totalCopies = Number(req.body.totalCopies);
    book.availableCopies = Math.max(0, book.availableCopies + diff);
  }

  await book.save();
  res.json({ success: true, data: book });
});

// ── DELETE book ─────────────────────────────────────────────────
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  // Check if any copies are currently issued
  const activeIssues = await BookIssue.countDocuments({ book: book._id, status: 'issued' });
  if (activeIssues > 0) {
    res.status(400);
    throw new Error(`Cannot delete — ${activeIssues} copies are currently issued`);
  }

  await book.deleteOne();
  res.json({ success: true, message: 'Book deleted' });
});

// ══════════════════════════════════════════════════════════════
//  BOOK ISSUE / RETURN (Admin)
// ══════════════════════════════════════════════════════════════

// ── GET all issues ──────────────────────────────────────────────
const getAllIssues = asyncHandler(async (req, res) => {
  // Auto-mark overdue
  await BookIssue.updateMany(
    { status: 'issued', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );

  const issues = await BookIssue.find()
    .populate('book', 'title author isbn category')
    .populate('student', 'firstName lastName email admissionNumber')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: issues });
});

// ── ISSUE book to student ───────────────────────────────────────
const issueBook = asyncHandler(async (req, res) => {
  const { book: bookId, student: studentId, dueDate } = req.body;
  if (!bookId || !studentId || !dueDate) {
    res.status(400);
    throw new Error('Book, student and due date are required');
  }

  const book = await Book.findById(bookId);
  if (!book) { res.status(404); throw new Error('Book not found'); }
  if (book.availableCopies <= 0) {
    res.status(400);
    throw new Error('No copies available for this book');
  }

  // Check if student already has this book issued
  const existing = await BookIssue.findOne({ book: bookId, student: studentId, status: { $in: ['issued', 'overdue'] } });
  if (existing) {
    res.status(400);
    throw new Error('Student already has this book issued');
  }

  const issue = await BookIssue.create({ book: bookId, student: studentId, dueDate });

  // Decrease available copies
  book.availableCopies = Math.max(0, book.availableCopies - 1);
  await book.save();

  const populated = await BookIssue.findById(issue._id)
    .populate('book', 'title author isbn')
    .populate('student', 'firstName lastName admissionNumber');

  res.status(201).json({ success: true, data: populated });
});

// ── RETURN book ─────────────────────────────────────────────────
const returnBook = asyncHandler(async (req, res) => {
  const issue = await BookIssue.findById(req.params.id);
  if (!issue) { res.status(404); throw new Error('Issue record not found'); }
  if (issue.status === 'returned') {
    res.status(400);
    throw new Error('Book already returned');
  }

  issue.returnDate = new Date();
  issue.status = 'returned';

  // Calculate fine if overdue
  if (issue.returnDate > issue.dueDate) {
    const overdueDays = Math.ceil((issue.returnDate - issue.dueDate) / (1000 * 60 * 60 * 24));
    issue.fine = overdueDays * FINE_PER_DAY;
  }

  issue.remarks = req.body.remarks || '';
  await issue.save();

  // Increase available copies
  const book = await Book.findById(issue.book);
  if (book) {
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    await book.save();
  }

  const populated = await BookIssue.findById(issue._id)
    .populate('book', 'title author isbn')
    .populate('student', 'firstName lastName admissionNumber');

  res.json({ success: true, data: populated });
});

// ══════════════════════════════════════════════════════════════
//  STUDENT — My Books
// ══════════════════════════════════════════════════════════════

// ── GET my issued/returned books ────────────────────────────────
const getMyBooks = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) { res.status(404); throw new Error('Student profile not found'); }

  // Auto-mark overdue for this student
  await BookIssue.updateMany(
    { student: student._id, status: 'issued', dueDate: { $lt: new Date() } },
    { $set: { status: 'overdue' } }
  );

  const issues = await BookIssue.find({ student: student._id })
    .populate('book', 'title author isbn category shelfLocation')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: issues });
});

module.exports = {
  getAllBooks,
  addBook,
  updateBook,
  deleteBook,
  getAllIssues,
  issueBook,
  returnBook,
  getMyBooks,
};
