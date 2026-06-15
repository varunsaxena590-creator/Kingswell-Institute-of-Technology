// scheduler.js
// Run scheduled jobs (e.g., FAQ auto-delete)

const { deleteOldFaqs } = require('./utils/faqCleanup');

// Run every hour
setInterval(() => {
  deleteOldFaqs().then(() => {
    console.log('Old FAQs (48hr+) auto-deleted');
  });
}, 60 * 60 * 1000); // 1 hour

// Optionally, run once on startup
// deleteOldFaqs();

module.exports = {};
