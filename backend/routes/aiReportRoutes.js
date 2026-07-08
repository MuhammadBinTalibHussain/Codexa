const express = require("express");
const protect = require("../middleware/auth");
const { validateObjectId } = require("../middleware/validators");
const { getReportForSnippet, generateReport, deleteReport } = require("../controller/aiReportController");

const router = express.Router();

router.get("/snippet/:id", protect, validateObjectId("id"), getReportForSnippet);
router.post("/generate/:id", protect, validateObjectId("id"), generateReport);
router.delete("/:id", protect, validateObjectId("id"), deleteReport);

module.exports = router;