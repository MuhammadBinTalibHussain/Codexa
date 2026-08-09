const express = require("express");
const {
  register, login, logout, getMe, changePassword, forgotPassword, resetPassword,
} = require("../controller/authController");
const protect = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", authLimiter, forgotPassword);
router.put("/reset-password/:token", authLimiter, resetPassword);

module.exports = router;
