const rateLimit = require("express-rate-limit");

// 300 requests per 15 minutes per IP, applied globally in server.js.
// Raised from 100 -> 300 because normal usage now includes background
// polling (notifications every 30-60s) plus regular navigation, which adds
// up quickly during active use — 100 was tripping for real, legitimate
// traffic, not just abuse.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    data: null,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Tighter limit for login/register specifically, to slow down credential
// stuffing / brute-force attempts against auth endpoints. Left unchanged —
// this one is actually protecting something, unlike the general limit.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    data: null,
    message: "Too many auth attempts from this IP, please try again after 15 minutes",
  },
});

module.exports = apiLimiter;
module.exports.apiLimiter = apiLimiter;
module.exports.authLimiter = authLimiter;
