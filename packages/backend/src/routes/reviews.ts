import { Router } from "express";
import { getReviewCards, submitReview } from "../controllers/reviewController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { submitReviewSchema } from "../validators/reviewValidators";

const router = Router();
router.use(protect);

router.route("/").get(getReviewCards);
router.route("/:cardId").post(validate(submitReviewSchema), submitReview);

export default router;
