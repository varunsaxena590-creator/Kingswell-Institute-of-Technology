// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: errorMiddleware.js                                   ║
// ║  PATH: backend/middleware/errorMiddleware.js                 ║
// ║                                                              ║
// ║  KYA HAI YE FILE?                                            ║
// ║  → Global error handling middleware hai.                     ║
// ║  → notFound() → 404 error jab route na mile.                ║
// ║  → errorHandler() → saare errors ko clean JSON mein         ║
// ║    convert karta hai (Mongoose errors bhi).                  ║
// ║  → Development mein stack trace dikhata hai.                ║
// ║                                                              ║
// ║  EXPORTS: notFound, errorHandler                             ║
// ╚══════════════════════════════════════════════════════════════╝

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Route not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Determine status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let finalStatus = statusCode;

  // Handle specific Mongoose errors
  let message = err.message;
  if (err.name === 'CastError') {
    message = `Resource not found with id: ${err.value}`;
    finalStatus = 404;
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    finalStatus = 400;
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    finalStatus = 400;
  }

  res.status(finalStatus).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { notFound, errorHandler };
