import { Router } from "express";
import {
  deleteFlashcard,
  getFlashcard,
  updateFlashcard,
  generateAudio,
} from "../controllers/flashcardController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  getFlashcardSchema,
  updateFlashcardSchema,
  deleteFlashcardSchema,
  generateAudioSchema,
} from "../validators/flashcardValidators";

const router = Router();
router.use(protect);

router
  .route("/:cardId")
  .get(validate(getFlashcardSchema), getFlashcard)
  .put(validate(updateFlashcardSchema), updateFlashcard)
  .delete(validate(deleteFlashcardSchema), deleteFlashcard);

router.route("/:cardId/audio").post(validate(generateAudioSchema), generateAudio);

export default router;
