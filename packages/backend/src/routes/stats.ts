import { Router } from "express";
import {
  getDashboardStats,
  getDeckStats,
  getLearningStreaks,
  getProgressStats,
  recordStudySession,
  getStudySessions,
} from "../controllers/statsController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);

router.route("/dashboard").get(getDashboardStats);
router.route("/deck/:deckId").get(getDeckStats);
router.route("/streaks").get(getLearningStreaks);
router.route("/progress/:timeframe").get(getProgressStats);
router.route("/sessions").get(getStudySessions).post(recordStudySession);

export default router;

