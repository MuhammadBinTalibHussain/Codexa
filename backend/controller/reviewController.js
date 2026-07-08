const Review = require("../models/Review");
const Snippet = require("../models/Snippet");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/reviews/snippet/:id
const getReviewsForSnippet = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ snippet: req.params.id })
    .populate("reviewer", "username email")
    .sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: reviews, message: "Reviews fetched successfully" });
});

// @route  POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { snippetId, comment, rating } = req.body;
  const snippet = await Snippet.findById(snippetId);
  if (!snippet) {
    return res.status(404).json({ status: "error", data: null, message: "Snippet not found" });
  }
  const review = await Review.create({ snippet: snippetId, reviewer: req.user._id, comment, rating });
  const populated = await review.populate("reviewer", "username email");
  res.status(201).json({ status: "success", data: populated, message: "Review created successfully" });
});

// @route  PUT /api/reviews/:id (reviewer only)
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ status: "error", data: null, message: "Review not found" });
  }
  if (review.reviewer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ status: "error", data: null, message: "Only the reviewer can update this review" });
  }
  const { comment, rating } = req.body;
  if (comment !== undefined) {
    if (typeof comment !== "string" || comment.trim().length < 10) {
      return res.status(400).json({ status: "error", data: null, message: "Comment must be at least 10 characters long" });
    }
    review.comment = comment;
  }
  if (rating !== undefined) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ status: "error", data: null, message: "Rating must be a whole number between 1 and 5" });
    }
    review.rating = rating;
  }
  const updated = await review.save();
  res.status(200).json({ status: "success", data: updated, message: "Review updated successfully" });
});

// @route  DELETE /api/reviews/:id (reviewer or admin)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ status: "error", data: null, message: "Review not found" });
  }
  const isReviewer = review.reviewer.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isReviewer && !isAdmin) {
    return res.status(403).json({ status: "error", data: null, message: "Only the reviewer or an admin can delete this review" });
  }
  await review.deleteOne();
  res.status(200).json({ status: "success", data: { id: req.params.id }, message: "Review deleted successfully" });
});

// @route  POST /api/reviews/:id/helpful
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { $inc: { helpfulVotes: 1 } }, { new: true });
  if (!review) {
    return res.status(404).json({ status: "error", data: null, message: "Review not found" });
  }
  res.status(200).json({ status: "success", data: review, message: "Helpful vote recorded" });
});

module.exports = { getReviewsForSnippet, createReview, updateReview, deleteReview, markHelpful };
