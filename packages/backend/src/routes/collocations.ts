import { Router } from "express";
import {
  createCollocation,
  getCollocations,
  getCollocationsCursor,
  getCollocation,
  updateCollocation,
  deleteCollocation,
  generateAudio,
} from "../controllers/collocationController";
import {
  getCollocationsForReview,
  submitCollocationReview,
  getCollocationStats,
  getCollocationsByCategory,
} from "../controllers/collocationReviewController";
import { protect } from "../middleware/authMiddleware";
import { requireSuperAdmin } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validate";
import {
  createCollocationSchema,
  updateCollocationSchema,
  getCollocationSchema,
  deleteCollocationSchema,
} from "../validators/collocationValidators";

const router = Router();

// Public routes (with authentication)
router.get("/", protect, getCollocations);
router.get("/cursor", protect, getCollocationsCursor); // Optimized cursor pagination
router.get("/review", protect, getCollocationsForReview);
router.get("/stats", protect, getCollocationStats);
router.get("/category/:category", protect, getCollocationsByCategory);
router.get("/:id", protect, validate(getCollocationSchema), getCollocation);
router.post("/:id/review", protect, validate(getCollocationSchema), submitCollocationReview);

// Super admin only routes
router.post(
  "/",
  protect,
  requireSuperAdmin,
  validate(createCollocationSchema),
  createCollocation
);

router.put(
  "/:id",
  protect,
  requireSuperAdmin,
  validate(updateCollocationSchema),
  updateCollocation
);

router.delete(
  "/:id",
  protect,
  requireSuperAdmin,
  validate(deleteCollocationSchema),
  deleteCollocation
);

router.post(
  "/:id/audio",
  protect,
  requireSuperAdmin,
  validate(getCollocationSchema),
  generateAudio
);

export default router;

