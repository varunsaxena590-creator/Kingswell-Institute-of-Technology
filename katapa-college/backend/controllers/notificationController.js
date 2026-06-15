// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: notificationController.js                            ║
// ║  PATH: backend/controllers/notificationController.js        ║
// ║                                                              ║
// ║  KYA HAI? → Student apni notifications yaha se dekhta hai.   ║
// ║  → Unread count milta hai (bell badge ke liye).             ║
// ║  → Mark as read, mark all read, delete notification.        ║
// ║                                                              ║
// ║  FUNCTIONS: getMyNotifications, getUnreadCount,             ║
// ║    markAsRead, markAllAsRead, deleteNotification            ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc   Get my notifications (paginated)
// @route  GET /api/notifications
// @access Protected
const getMyNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    data: notifications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc   Get unread notification count
// @route  GET /api/notifications/unread-count
// @access Protected
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, read: false });
  res.json({ success: true, count });
});

// @desc   Mark single notification as read
// @route  PUT /api/notifications/:id/read
// @access Protected
const markAsRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notif) { res.status(404); throw new Error('Notification not found'); }
  res.json({ success: true, data: notif });
});

// @desc   Mark all notifications as read
// @route  PUT /api/notifications/read-all
// @access Protected
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc   Delete a notification
// @route  DELETE /api/notifications/:id
// @access Protected
const deleteNotification = asyncHandler(async (req, res) => {
  const notif = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!notif) { res.status(404); throw new Error('Notification not found'); }
  res.json({ success: true, message: 'Notification deleted' });
});

module.exports = { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
