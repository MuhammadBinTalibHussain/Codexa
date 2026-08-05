const express = require("express");
const protect = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { getAdminAnalytics } = require("../controller/analyticsController");

const router = express.Router();

router.get("/admin", protect, adminOnly, getAdminAnalytics);

module.exports = router;
