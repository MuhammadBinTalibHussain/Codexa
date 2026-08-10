const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../config/db");

const authRoutes = require("../routes/authRoutes");
const snippetRoutes = require("../routes/snippetRoutes");
const reviewRoutes = require("../routes/reviewRoutes");
const aiReportRoutes = require("../routes/aiReportRoutes");
const notificationRoutes = require("../routes/notificationRoutes");
const analyticsRoutes = require("../routes/analyticsRoutes");

const apiLimiter = require("../middleware/rateLimiter");
const { errorHandler, notFound } = require("../middleware/errorHandler");
const initSocket = require("../socket");

dotenv.config();

const app = express();

// Vercel sits in front of the function as a proxy, so Express needs to
// trust its X-Forwarded-* headers — otherwise express-rate-limit throws
// a validation error on every request trying to read the client IP.
app.set("trust proxy", 1);

// CLIENT_URL supports one or more comma-separated origins, e.g.
// "https://your-frontend.vercel.app,http://localhost:5173"
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.send("Codexa Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", aiReportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

// Connect once per warm function instance. Mongoose buffers queries until
// the connection is ready, so we don't need to block on this. Catch here
// so a failed connection doesn't become an unhandled rejection.
connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err.message);
});

// IMPORTANT: on Vercel we do NOT call .listen(). We export the raw
// http.Server so Vercel's native WebSocket support can accept both normal
// HTTP requests and the WebSocket upgrade (Socket.IO) on this same
// function instance.
const httpServer = http.createServer(app);
initSocket(httpServer, allowedOrigins);

module.exports = httpServer;