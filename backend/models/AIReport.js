const mongoose = require("mongoose");

const aiReportSchema = new mongoose.Schema(
  {
    snippet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Snippet",
      required: true,
      unique: true, // one report per snippet
    },
    readability: { type: Number, required: true, min: 0, max: 100 },
    maintainability: { type: Number, required: true, min: 0, max: 100 },
    performance: { type: Number, required: true, min: 0, max: 100 },
    overall: { type: Number, required: true, min: 0, max: 100 },
    suggestions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("AIReport", aiReportSchema);