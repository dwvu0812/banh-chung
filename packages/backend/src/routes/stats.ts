import { Router } from "express";
import {
  getDashboardStats,
  getDeckStats,
  getLearningStreaks,
  getProgressStats,
  recordStudySession,
  getStudySessions,
  getSRSAnalytics,
  getSRSPerformance,
  getLearningStreak,
} from "../controllers/statsController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);

router.route("/dashboard").get(getDashboardStats);
router.route("/deck/:deckId").get(getDeckStats);
router.route("/streaks").get(getLearningStreaks);
router.route("/progress/:timeframe").get(getProgressStats);
router.route("/sessions").get(getStudySessions).post(recordStudySession);

// Enhanced SRS Analytics routes
router.route("/srs-analytics").get(getSRSAnalytics);
router.route("/srs-performance").get(getSRSPerformance);
router.route("/learning-streak").get(getLearningStreak);

export default router;

