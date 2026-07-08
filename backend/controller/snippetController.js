const mongoose = require("mongoose");
const Snippet = require("../models/Snippet");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/snippets
const getSnippets = asyncHandler(async (req, res) => {
  const snippets = await Snippet.find()
    .populate("author", "username email role")
    .sort({ createdAt: -1 });
  res.status(200).json({ status: "success", data: snippets, message: "Snippets fetched successfully" });
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
const getSnippetsByUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ status: "error", data: null, message: "Invalid userId" });
  }
  const snippets = await Snippet.find({ author: req.params.userId })
    .populate("author", "username email role")
    .sort({ createdAt: -1 });
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
  if (title !== undefined) snippet.title = title;
  if (code !== undefined) snippet.code = code;
  if (language !== undefined) snippet.language = language.toLowerCase();
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