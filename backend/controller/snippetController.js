const mongoose = require("mongoose");
const Snippet = require("../models/Snippet");
const asyncHandler = require("../utils/asyncHandler");
const { ALLOWED_LANGUAGES } = require("../middleware/validators");

// Shared aggregation stages that enrich each snippet with reviewCount,
// hasReport, and aiScore in a single query — this is what eliminates the
// old N+1 pattern where the frontend fired 2 extra requests PER snippet.
const enrichmentStages = [
  { $lookup: { from: "reviews", localField: "_id", foreignField: "snippet", as: "reviews" } },
  { $lookup: { from: "aireports", localField: "_id", foreignField: "snippet", as: "report" } },
  { $lookup: { from: "users", localField: "author", foreignField: "_id", as: "author" } },
  { $unwind: "$author" },
  {
    $project: {
      title: 1,
      code: 1,
      language: 1,
      createdAt: 1,
      updatedAt: 1,
      author: { _id: "$author._id", username: "$author.username", email: "$author.email", role: "$author.role" },
      reviewCount: { $size: "$reviews" },
      hasReport: { $gt: [{ $size: "$report" }, 0] },
      aiScore: { $arrayElemAt: ["$report.overall", 0] },
    },
  },
];

// @route  GET /api/snippets?page=1&limit=12
// Paginated + enriched (reviewCount/hasReport/aiScore precomputed) so the
// frontend never needs to loop per-snippet requests, and never has to load
// every snippet in the database at once.
const getSnippets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const [snippets, totalCount] = await Promise.all([
    Snippet.aggregate([
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      ...enrichmentStages,
    ]),
    Snippet.countDocuments(),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      snippets,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      totalCount,
    },
    message: "Snippets fetched successfully",
  });
});

// @route  GET /api/snippets/:id
const getSnippetById = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.id).populate("author", "username email role");
  if (!snippet) {
    return res.status(404).json({ status: "error", data: null, message: "Snippet not found" });
  }
  res.status(200).json({ status: "success", data: snippet, message: "Snippet fetched successfully" });
});

// @route  GET /api/snippets/user/:userId
// Not paginated (a single user's own submissions is a naturally small,
// bounded list), but still enriched the same way to avoid N+1 lookups.
const getSnippetsByUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ status: "error", data: null, message: "Invalid userId" });
  }

  const snippets = await Snippet.aggregate([
    { $match: { author: new mongoose.Types.ObjectId(req.params.userId) } },
    { $sort: { createdAt: -1 } },
    ...enrichmentStages,
  ]);

  res.status(200).json({ status: "success", data: snippets, message: "User snippets fetched successfully" });
});

// @route  POST /api/snippets
const createSnippet = asyncHandler(async (req, res) => {
  const { title, code, language } = req.body;
  const snippet = await Snippet.create({
    title, code, language: language.toLowerCase(), author: req.user._id,
  });
  res.status(201).json({ status: "success", data: snippet, message: "Snippet created successfully" });
});

// @route  PUT /api/snippets/:id (author only)
const updateSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);
  if (!snippet) {
    return res.status(404).json({ status: "error", data: null, message: "Snippet not found" });
  }
  if (snippet.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({ status: "error", data: null, message: "Only the author can update this snippet" });
  }
  const { title, code, language } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ status: "error", data: null, message: "Title must be a non-empty string" });
    }
    snippet.title = title;
  }

  if (code !== undefined) {
    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ status: "error", data: null, message: "Code must be a non-empty string" });
    }
    snippet.code = code;
  }

  if (language !== undefined) {
    if (typeof language !== "string" || !ALLOWED_LANGUAGES.includes(language.toLowerCase())) {
      return res.status(400).json({
        status: "error",
        data: null,
        message: `Language must be one of: ${ALLOWED_LANGUAGES.join(", ")}`,
      });
    }
    snippet.language = language.toLowerCase();
  }

  const updated = await snippet.save();
  res.status(200).json({ status: "success", data: updated, message: "Snippet updated successfully" });
});

// @route  DELETE /api/snippets/:id (author or admin)
const deleteSnippet = asyncHandler(async (req, res) => {
  const snippet = await Snippet.findById(req.params.id);
  if (!snippet) {
    return res.status(404).json({ status: "error", data: null, message: "Snippet not found" });
  }
  const isAuthor = snippet.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ status: "error", data: null, message: "Only the author or an admin can delete this snippet" });
  }
  await snippet.deleteOne();
  res.status(200).json({ status: "success", data: { id: req.params.id }, message: "Snippet deleted successfully" });
});

module.exports = { getSnippets, getSnippetById, getSnippetsByUser, createSnippet, updateSnippet, deleteSnippet };
