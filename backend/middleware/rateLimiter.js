const rateLimit = require("express-rate-limit");

// 100 requests per 15 minutes per IP, applied globally in server.js
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    data: null,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Tighter limit for login/register specifically, to slow down credential
// stuffing / brute-force attempts against auth endpoints.
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
