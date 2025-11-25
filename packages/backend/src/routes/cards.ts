import { Router } from "express";
import {
  deleteFlashcard,
  getFlashcard,
  updateFlashcard,
  generateAudio,
} from "../controllers/flashcardController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);

router
  .route("/:cardId")
  .get(getFlashcard)
  .put(updateFlashcard)
  .delete(deleteFlashcard);

router.route("/:cardId/audio").post(generateAudio);

export default router;
