"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deckController_1 = require("../controllers/deckController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/public", authMiddleware_1.optionalAuth, deckController_1.getPublicDecks);
router.get("/:id", authMiddleware_1.optionalAuth, deckController_1.getDeckById);
router.get("/", authMiddleware_1.authenticate, deckController_1.getUserDecks);
router.post("/", authMiddleware_1.authenticate, deckController_1.createDeck);
router.put("/:id", authMiddleware_1.authenticate, deckController_1.updateDeck);
router.delete("/:id", authMiddleware_1.authenticate, deckController_1.deleteDeck);
router.post("/:id/flashcards", authMiddleware_1.authenticate, deckController_1.addFlashcard);
router.put("/flashcards/:cardId", authMiddleware_1.authenticate, deckController_1.updateFlashcard);
router.delete("/flashcards/:cardId", authMiddleware_1.authenticate, deckController_1.deleteFlashcard);
router.post("/flashcards/:cardId/review", authMiddleware_1.optionalAuth, deckController_1.reviewFlashcard);
exports.default = router;
//# sourceMappingURL=decks.js.map