const express = require("express");
const protect = require("../middleware/auth");
const { validateObjectId } = require("../middleware/validators");
const {
  getNotifications, markAsRead, markAllAsRead, deleteNotification,
} = require("../controller/notificationController");

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, validateObjectId("id"), markAsRead);
router.delete("/:id", protect, validateObjectId("id"), deleteNotification);

module.exports = router;
