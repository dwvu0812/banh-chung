import { Router } from "express";
import { getDashboardStats, getDeckStats } from "../controllers/statsController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);

router.route("/dashboard").get(getDashboardStats);
router.route("/deck/:deckId").get(getDeckStats);

export default router;

