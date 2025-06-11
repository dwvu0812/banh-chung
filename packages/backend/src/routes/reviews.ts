import { Router } from "express";
import { getReviewCards, submitReview } from "../controllers/reviewController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);

router.route("/").get(getReviewCards);
router.route("/:cardId").post(submitReview);

export default router;
