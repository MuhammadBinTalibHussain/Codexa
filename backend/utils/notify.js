const Notification = require("../models/Notification");

// Creates a notification for `recipientId`, unless the recipient is the same
// person who triggered the event (no one needs to be notified about their
// own review/comment/report). Failures here are logged but never thrown,
// since a notification issue should never break the primary action
// (posting a review/comment or generating a report).
const notify = async ({ recipientId, actorId, type, message, link }) => {
  try {
    if (!recipientId) return null;
    if (actorId && recipientId.toString() === actorId.toString()) return null;

    return await Notification.create({
      recipient: recipientId,
      type,
      message,
      link: link || "",
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
    return null;
  }
};

module.exports = notify;
