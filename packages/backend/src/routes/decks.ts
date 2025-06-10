import { Router } from "express";
import { createDeck, getDeck } from "../controllers/deckController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Áp dụng middleware `protect` cho tất cả các route trong file này
router.use(protect);

router.post("/", createDeck); // POST /api/decks

router.get("/:id", getDeck); // GET /api/decks/:id

export default router;
