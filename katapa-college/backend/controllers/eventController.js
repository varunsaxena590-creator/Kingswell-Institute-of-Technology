// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: eventController.js                                   ║
// ║  PATH: backend/controllers/eventController.js                ║
// ║                                                              ║
// ║  KYA KARTA HAI?                                              ║
// ║  → Events CRUD — create/update/delete events.               ║
// ║  → Public endpoint for upcoming events (students).          ║
// ║  → Auto-status update: past events → completed.             ║
// ║                                                              ║
// ║  FUNCTIONS: getUpcomingEvents, getAllEvents, createEvent,    ║
// ║    updateEvent, deleteEvent                                   ║
// ╚══════════════════════════════════════════════════════════════╝
const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const { notifyAllStudents } = require('../utils/notificationHelper');

// ── Auto-update: mark past events as completed ─────────────────
const autoUpdateStatus = async () => {
  const now = new Date();
  await Event.updateMany(
    { status: { $in: ['upcoming', 'ongoing'] }, startDate: { $lt: now }, $or: [{ endDate: null }, { endDate: { $lt: now } }] },
    { $set: { status: 'completed' } }
  );
  // Mark events that have started but not ended as ongoing
  await Event.updateMany(
    { status: 'upcoming', startDate: { $lte: now }, endDate: { $gt: now } },
    { $set: { status: 'ongoing' } }
  );
};

// @desc   Get upcoming & ongoing events (public/student)
// @route  GET /api/events
// @access Public
const getUpcomingEvents = asyncHandler(async (req, res) => {
  await autoUpdateStatus();
  const events = await Event.find({ status: { $in: ['upcoming', 'ongoing'] } })
    .sort({ featured: -1, startDate: 1 });
  res.json({ success: true, data: events });
});

// @desc   Get all events including past (admin)
// @route  GET /api/events/all
// @access Admin
const getAllEvents = asyncHandler(async (req, res) => {
  await autoUpdateStatus();
  const events = await Event.find().sort({ startDate: -1 });
  res.json({ success: true, data: events });
});

// @desc   Create event
// @route  POST /api/events
// @access Admin
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, category, startDate, endDate, startTime, endTime, venue, organizer, featured, status } = req.body;
  if (!title || !startDate) {
    res.status(400);
    throw new Error('Title and start date are required');
  }
  const event = await Event.create({
    title,
    description: description || '',
    category: category || 'academic',
    startDate,
    endDate: endDate || null,
    startTime: startTime || '',
    endTime: endTime || '',
    venue: venue || '',
    organizer: organizer || '',
    featured: featured || false,
    status: status || 'upcoming',
    createdBy: req.user._id,
  });
  // Fire-and-forget: notify all students about new event
  notifyAllStudents('event', `New Event: ${title}`, description || `${title} on ${new Date(startDate).toLocaleDateString()}${venue ? ' at ' + venue : ''}`, { eventId: event._id }).catch(() => {});

  res.status(201).json({ success: true, data: event });
});

// @desc   Update event
// @route  PUT /api/events/:id
// @access Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) { res.status(404); throw new Error('Event not found'); }
  res.json({ success: true, data: event });
});

// @desc   Delete event
// @route  DELETE /api/events/:id
// @access Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) { res.status(404); throw new Error('Event not found'); }
  res.json({ success: true, message: 'Event deleted' });
});

module.exports = { getUpcomingEvents, getAllEvents, createEvent, updateEvent, deleteEvent };
