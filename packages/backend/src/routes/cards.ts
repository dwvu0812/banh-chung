import { Router } from "express";
import { deleteFlashcard } from "../controllers/flashcardController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);

router.route("/:cardId").delete(deleteFlashcard);

export default router;
