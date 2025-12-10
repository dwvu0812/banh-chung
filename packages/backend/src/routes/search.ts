import { Router } from "express";
import { searchCards, searchDecks, getAllTags } from "../controllers/searchController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.use(protect);

router.get("/cards", searchCards);
router.get("/decks", searchDecks);
router.get("/tags", getAllTags);

export default router;

