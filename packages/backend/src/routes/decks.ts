import { Router } from "express";
import {
  createDeck,
  getDeck,
  updateDeck,
  deleteDeck,
  getDecks,
} from "../controllers/deckController";
import {
  createFlashcard,
  getCardsByDeck,
} from "../controllers/flashcardController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { createDeckSchema, updateDeckSchema, getDeckSchema, deleteDeckSchema } from "../validators/deckValidators";
import { createFlashcardSchema } from "../validators/flashcardValidators";
import { createLimiter } from "../middleware/security";

const router = Router();
router.use(protect);

router
  .route("/")
  .get(getDecks)
  .post(createLimiter, validate(createDeckSchema), createDeck);

router
  .route("/:id")
  .get(validate(getDeckSchema), getDeck)
  .put(validate(updateDeckSchema), updateDeck)
  .delete(validate(deleteDeckSchema), deleteDeck);

// Routes for managing cards within a deck
router
  .route("/:deckId/cards")
  .get(getCardsByDeck)
  .post(createLimiter, validate(createFlashcardSchema), createFlashcard);

export default router;
