const User = require("../models/User");
const Snippet = require("../models/Snippet");
const Review = require("../models/Review");
const AIReport = require("../models/AIReport");
const asyncHandler = require("../utils/asyncHandler");

// Simple in-memory cache so repeated dashboard loads within the same
// 5-minute window don't re-run the aggregation pipelines. Note: this cache
// lives in process memory, so if you ever run multiple backend instances
// behind a load balancer, each instance will have its own cache (fine for
// a single-instance deployment, which is the common case for a project
// like this).
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
};

const setCached = (key, data) => {
  cache.set(key, { data, cachedAt: Date.now() });
};

const WEEKS_OF_HISTORY = 12;
const sinceWeeksAgo = (weeks) => new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

// @route  GET /api/analytics/admin  (admin role required)
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const cached = getCached("admin-analytics");
  if (cached) {
    return res.status(200).json({ status: "success", data: cached, message: "Analytics fetched successfully (cached)" });
  }

  const since = sinceWeeksAgo(WEEKS_OF_HISTORY);

  const [
    totalUsers,
    totalSnippets,
    totalReviews,
    totalReports,
    registrationsByWeek,
    mostActiveUsers,
    aiScoreTrend,
  ] = await Promise.all([
    User.countDocuments(),
    Snippet.countDocuments(),
    Review.countDocuments(),
    AIReport.countDocuments(),

    // New user registrations grouped by week, over the last 12 weeks.
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateTrunc: { date: "$createdAt", unit: "week" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, week: "$_id", count: 1 } },
    ]),

    // Top 5 users by number of snippets submitted.
    Snippet.aggregate([
      { $group: { _id: "$author", snippetCount: { $sum: 1 } } },
      { $sort: { snippetCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $project: { _id: 0, userId: "$user._id", username: "$user.username", snippetCount: 1 } },
    ]),

    // Platform-wide average AI overall score, grouped by week.
    AIReport.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateTrunc: { date: "$createdAt", unit: "week" } },
          averageScore: { $avg: "$overall" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, week: "$_id", averageScore: { $round: ["$averageScore", 1] } } },
    ]),
  ]);

  const analytics = {
    totals: { users: totalUsers, snippets: totalSnippets, reviews: totalReviews, aiReports: totalReports },
    registrationsByWeek,
    mostActiveUsers,
    aiScoreTrend,
  };

  setCached("admin-analytics", analytics);
  res.status(200).json({ status: "success", data: analytics, message: "Analytics fetched successfully" });
});

module.exports = { getAdminAnalytics };
