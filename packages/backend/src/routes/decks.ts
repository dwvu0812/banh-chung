import { Router } from "express";
import {
  createDeck,
  getDeck,
  updateDeck,
  deleteDeck,
  getDecks,
} from "../controllers/deckController";
import { createFlashcard } from "../controllers/flashcardController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect); // Áp dụng bảo vệ cho tất cả

router
  .route("/")
  .get(getDecks) // Lấy tất cả decks của user
  .post(createDeck);

router
  .route("/:id")
  .get(getDeck)
  .put(updateDeck) // Cập nhật deck
  .delete(deleteDeck); // Xóa deck

// Route để tạo card trong một deck cụ thể
router.route("/:deckId/cards").post(createFlashcard);

export default router;
