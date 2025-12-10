import { Router } from "express";
import {
  createQuiz,
  getQuizzes,
  getQuiz,
  generateQuizQuestions,
  submitQuizResult,
  getUserQuizResults,
  getQuizResult,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController";
import { protect } from "../middleware/authMiddleware";
import { requireSuperAdmin } from "../middleware/adminMiddleware";
import { validate } from "../middleware/validate";
import {
  createQuizSchema,
  updateQuizSchema,
  getQuizSchema,
  submitQuizResultSchema,
  deleteQuizSchema,
} from "../validators/quizValidators";

const router = Router();

// Public routes (with authentication)
router.get("/", protect, getQuizzes);
router.get("/results", protect, getUserQuizResults);
router.get("/results/:id", protect, validate(getQuizSchema), getQuizResult);
router.get("/:id", protect, validate(getQuizSchema), getQuiz);
router.get("/:id/questions", protect, validate(getQuizSchema), generateQuizQuestions);
router.post("/:id/submit", protect, validate(submitQuizResultSchema), submitQuizResult);

// Super admin only routes
router.post("/", protect, requireSuperAdmin, validate(createQuizSchema), createQuiz);
router.put("/:id", protect, requireSuperAdmin, validate(updateQuizSchema), updateQuiz);
router.delete("/:id", protect, requireSuperAdmin, validate(deleteQuizSchema), deleteQuiz);

export default router;

