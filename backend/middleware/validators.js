const mongoose = require("mongoose");

const ALLOWED_LANGUAGES = [
  "javascript", "typescript", "python", "java", "c", "cpp",
  "csharp", "go", "rust", "php", "ruby", "html", "css", "sql", "other",
];

// Validates that a route param is a well-formed Mongo ObjectId before it
// reaches a database query, avoiding CastError crashes.
const validateObjectId = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({
      status: "error",
      data: null,
      message: `Invalid ${paramName}: '${value}' is not a valid ID`,
    });
  }
  next();
};

const validateSnippet = (req, res, next) => {
  const { title, code, language } = req.body;
  const errors = [];

  if (!title || typeof title !== "string" || !title.trim()) {
    errors.push("Title is required");
  } else if (title.length > 120) {
    errors.push("Title must be at most 120 characters");
  }

  if (!code || typeof code !== "string" || !code.trim()) {
    errors.push("Code is required");
  }

  if (!language || typeof language !== "string") {
    errors.push("Language is required");
  } else if (!ALLOWED_LANGUAGES.includes(language.toLowerCase())) {
    errors.push(`Language must be one of: ${ALLOWED_LANGUAGES.join(", ")}`);
  }

  if (errors.length) {
    return res.status(400).json({ status: "error", data: null, message: errors.join("; ") });
  }
  next();
};

const validateReview = (req, res, next) => {
  const { snippetId, comment, rating } = req.body;
  const errors = [];

  if (!snippetId || !mongoose.Types.ObjectId.isValid(snippetId)) {
    errors.push("A valid snippetId is required");
  }

  if (!comment || typeof comment !== "string" || comment.trim().length < 10) {
    errors.push("Comment must be at least 10 characters long");
  }

  if (rating === undefined || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.push("Rating must be a whole number between 1 and 5");
  }

  if (errors.length) {
    return res.status(400).json({ status: "error", data: null, message: errors.join("; ") });
  }
  next();
};

module.exports = { validateObjectId, validateSnippet, validateReview, ALLOWED_LANGUAGES };