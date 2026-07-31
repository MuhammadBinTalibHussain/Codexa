const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const snippetRoutes = require("./routes/snippetRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const aiReportRoutes = require("./routes/aiReportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const apiLimiter = require("./middleware/rateLimiter");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const initSocket = require("./socket");

dotenv.config();

const app = express();

app.use(cors());
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

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initSocket(httpServer);

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (HTTP + Socket.IO)`);
  });
};

startServer();
