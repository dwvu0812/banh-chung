import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";

// Import middleware
import { securityHeaders, sanitizeData, apiLimiter } from "./middleware/security";
import { errorHandler, notFound } from "./middleware/errorHandler";
import logger from "./utils/logger";
import { responseTimeLogger } from "./utils/performance";
import swaggerSpec from "./utils/swagger";

// Import routes
import authRoutes from "./routes/auth";
import deckRoutes from "./routes/decks";
import cardRoutes from "./routes/cards";
import reviewRoutes from "./routes/reviews";
import statsRoutes from "./routes/stats";
import searchRoutes from "./routes/search";
import bulkRoutes from "./routes/bulk";

// Load environment variables (Railway provides them directly in production)
if (process.env.NODE_ENV !== "production") {
  const envFile = ".env.development";
  dotenv.config({ path: envFile });
  console.log(`Loaded environment from ${envFile}`);
} else {
  console.log("Using environment variables from Railway");
}

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error("ERROR: MONGO_URI is not defined in environment variables");
  console.error("Please set MONGO_URI in Railway dashboard");
  process.exit(1);
}

console.log("Environment check passed:", {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI ? "✓ Set" : "✗ Missing",
});

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Performance monitoring
app.use(responseTimeLogger);

// Security middleware
app.use(securityHeaders);
app.use(sanitizeData);

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL_DEV,
  process.env.FRONTEND_URL_PROD,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parser with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API rate limiting
app.use("/api", apiLimiter);

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bulk", bulkRoutes);

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    logger.info("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info("✓ MongoDB Connected successfully");

    // Listen on 0.0.0.0 to accept external connections (required for Railway)
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`✓ Server is running on port ${PORT}`);
      logger.info(`✓ Health check available at /api/auth/health`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    logger.error("✗ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
