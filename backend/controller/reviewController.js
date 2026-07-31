const Review = require("../models/Review");
const Snippet = require("../models/Snippet");
const asyncHandler = require("../utils/asyncHandler");
const notify = require("../utils/notify");

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

  await notify({
    recipientId: snippet.author,
    actorId: req.user._id,
    type: "review",
    message: `${req.user.username} reviewed your snippet "${snippet.title}"`,
    link: `/snippets/${snippetId}`,
  });

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

// Shared logic for both markHelpful and markUnhelpful.
// Each user may only have ONE active vote (helpful or unhelpful) on a review:
//   - No existing vote            -> add the new vote, bump that counter by 1
//   - Existing vote is the SAME   -> clicking again removes it (un-vote / toggle off)
//   - Existing vote is DIFFERENT  -> switch vote: decrement the old counter,
//                                    increment the new counter (this is the
//                                    "like -> dislike should minus the like" fix)
const applyVote = async (req, res, voteType, successMessage) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return res.status(404).json({ status: "error", data: null, message: "Review not found" });
  }

  const userId = req.user._id.toString();
  const existingIndex = review.voters.findIndex((v) => v.user.toString() === userId);
  const existingVote = existingIndex > -1 ? review.voters[existingIndex].vote : null;

  if (existingVote === voteType) {
    // Same button clicked again -> remove the vote entirely.
    review.voters.splice(existingIndex, 1);
    if (voteType === "helpful") {
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      review.unhelpfulVotes = Math.max(0, review.unhelpfulVotes - 1);
    }
  } else if (existingVote) {
    // Switching from one vote to the other.
    review.voters[existingIndex].vote = voteType;
    if (voteType === "helpful") {
      review.helpfulVotes += 1;
      review.unhelpfulVotes = Math.max(0, review.unhelpfulVotes - 1);
    } else {
      review.unhelpfulVotes += 1;
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    }
  } else {
    // First time this user is voting on this review.
    review.voters.push({ user: req.user._id, vote: voteType });
    if (voteType === "helpful") {
      review.helpfulVotes += 1;
    } else {
      review.unhelpfulVotes += 1;
    }
  }

  await review.save();
  res.status(200).json({ status: "success", data: review, message: successMessage });
};

// @route  POST /api/reviews/:id/helpful
const markHelpful = asyncHandler(async (req, res) => {
  await applyVote(req, res, "helpful", "Helpful vote recorded");
});

// @route  POST /api/reviews/:id/unhelpful
const markUnhelpful = asyncHandler(async (req, res) => {
  await applyVote(req, res, "unhelpful", "Dislike vote recorded");
});

module.exports = { getReviewsForSnippet, createReview, updateReview, deleteReview, markHelpful, markUnhelpful };
