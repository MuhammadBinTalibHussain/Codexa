const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    snippet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Snippet",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5",
      },
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    unhelpfulVotes: {
      type: Number,
      default: 0,
    },
    // Tracks exactly one active vote per user (helpful or unhelpful) so that
    // a single user can't like/dislike the same review multiple times, and
    // switching from like -> dislike (or vice versa) correctly removes the
    // old vote instead of just adding to both counters.
    voters: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        vote: {
          type: String,
          enum: ["helpful", "unhelpful"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

reviewSchema.index({ snippet: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ "voters.user": 1 });
module.exports = mongoose.model("Review", reviewSchema);
