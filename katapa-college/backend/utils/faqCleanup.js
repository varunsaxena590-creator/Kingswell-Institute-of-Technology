// Cron job for auto-deleting old FAQs (older than 48 hours)
const Faq = require('../models/Faq');

async function deleteOldFaqs() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
  await Faq.deleteMany({ createdAt: { $lt: cutoff } });
}

module.exports = { deleteOldFaqs };
