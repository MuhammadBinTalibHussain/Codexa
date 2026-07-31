const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: notifications, message: "Notifications fetched successfully" });
});

// @route  PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) {
    return res.status(404).json({ status: "error", data: null, message: "Notification not found" });
  }
  notification.read = true;
  await notification.save();
  res.status(200).json({ status: "success", data: notification, message: "Notification marked as read" });
});

// @route  PATCH /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
  res.status(200).json({ status: "success", data: null, message: "All notifications marked as read" });
});

// @route  DELETE /api/notifications/:id
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user._id });
  if (!notification) {
    return res.status(404).json({ status: "error", data: null, message: "Notification not found" });
  }
  await notification.deleteOne();
  res.status(200).json({ status: "success", data: { id: req.params.id }, message: "Notification deleted successfully" });
});

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
