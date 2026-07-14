const express = require("express");
const protect = require("../middleware/auth");
const { validateObjectId, validateReview } = require("../middleware/validators");
const {
  getReviewsForSnippet, createReview, updateReview, deleteReview, markHelpful, markUnhelpful,
} = require("../controller/reviewController");

const router = express.Router();

router.get("/snippet/:id", validateObjectId("id"), getReviewsForSnippet);
router.post("/", protect, validateReview, createReview);
router.put("/:id", protect, validateObjectId("id"), updateReview);
router.delete("/:id", protect, validateObjectId("id"), deleteReview);
router.post("/:id/helpful", protect, validateObjectId("id"), markHelpful);
router.post("/:id/unhelpful", protect, validateObjectId("id"), markUnhelpful);

module.exports = router;
