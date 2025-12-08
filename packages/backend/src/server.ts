import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import routes
import authRoutes from "./routes/auth";
import deckRoutes from "./routes/decks";
import cardRoutes from "./routes/cards";
import reviewRoutes from "./routes/reviews";
import statsRoutes from "./routes/stats";

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
  mongoUri: process.env.MONGO_URI ? "✓ Set" : "✗ Missing"
});

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

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
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/stats", statsRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✓ MongoDB Connected successfully");
    
    // Listen on 0.0.0.0 to accept external connections (required for Railway)
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Health check available at /api/auth/health`);
    });
  } catch (err) {
    console.error("✗ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});

startServer();
