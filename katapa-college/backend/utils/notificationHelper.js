// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: notificationHelper.js (Utility)                      ║
// ║  PATH: backend/utils/notificationHelper.js                  ║
// ║                                                              ║
// ║  KYA HAI? → Notification create karne ke helper functions.   ║
// ║  → Single user ke liye: createNotification()                ║
// ║  → All accepted students ke liye: notifyAllStudents()       ║
// ║  → Controllers se fire-and-forget style mein use hota hai.  ║
// ╚══════════════════════════════════════════════════════════════╝
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const User = require('../models/User');

/**
 * Create a notification for a single user
 */
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    await Notification.create({ user: userId, type, title, message, data });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

/**
 * Create notifications for ALL accepted students
 * Finds all accepted students → gets their linked User accounts → bulk inserts notifications
 */
const notifyAllStudents = async (type, title, message, data = {}) => {
  try {
    const students = await Student.find({ status: 'accepted' }).select('user email');
    // Collect user IDs — from the student.user ref or by matching email
    const userIds = [];
    const emailsWithoutUser = [];

    for (const s of students) {
      if (s.user) {
        userIds.push(s.user);
      } else if (s.email) {
        emailsWithoutUser.push(s.email);
      }
    }

    // Find User docs for students matched by email only
    if (emailsWithoutUser.length > 0) {
      const users = await User.find({ email: { $in: emailsWithoutUser } }).select('_id');
      users.forEach((u) => userIds.push(u._id));
    }

    if (userIds.length === 0) return;

    const docs = userIds.map((uid) => ({ user: uid, type, title, message, data }));
    await Notification.insertMany(docs, { ordered: false });
  } catch (err) {
    console.error('Bulk notification error:', err.message);
  }
};

/**
 * Notify a specific student by their Student doc _id
 */
const notifyStudent = async (studentDoc, type, title, message, data = {}) => {
  try {
    let userId = studentDoc.user;
    if (!userId && studentDoc.email) {
      const user = await User.findOne({ email: studentDoc.email }).select('_id');
      if (user) userId = user._id;
    }
    if (userId) {
      await Notification.create({ user: userId, type, title, message, data });
    }
  } catch (err) {
    console.error('Student notification error:', err.message);
  }
};

module.exports = { createNotification, notifyAllStudents, notifyStudent };
