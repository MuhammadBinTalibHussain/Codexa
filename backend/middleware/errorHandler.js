// Catches anything passed to next(err) (including async errors forwarded
// by asyncHandler) and returns a consistent JSON error shape.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  let message = err.message || "Internal server error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join("; ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for field: ${Object.keys(err.keyValue).join(", ")}`;
  }

  res.status(statusCode).json({ status: "error", data: null, message });
};

// Catches unmatched routes and forwards a 404 in the same response shape.
const notFound = (req, res, next) => {
  res.status(404).json({
    status: "error",
    data: null,
    message: `Route not found: ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };