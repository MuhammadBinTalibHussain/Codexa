// Requires `protect` to have already run (so req.user is populated).
// Blocks any non-admin user from proceeding.
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", data: null, message: "Admin access required" });
  }
  next();
};

module.exports = adminOnly;
