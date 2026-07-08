const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const snippetRoutes = require("./routes/snippetRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const aiReportRoutes = require("./routes/aiReportRoutes");

const apiLimiter = require("./middleware/rateLimiter");
const { errorHandler, notFound } = require("./middleware/errorHandler");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.send("CodePulse Backend Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/snippets", snippetRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", aiReportRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();