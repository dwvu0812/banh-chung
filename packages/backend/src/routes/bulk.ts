import { Router } from "express";
import {
  bulkImportCards,
  bulkExportCards,
  bulkExportCardsCSV,
  bulkUpdateTags,
  bulkDeleteCards,
} from "../controllers/bulkController";
import { protect } from "../middleware/authMiddleware";
import { createLimiter } from "../middleware/security";

const router = Router();
router.use(protect);

router.post("/import", createLimiter, bulkImportCards);
router.get("/export/:deckId", bulkExportCards);
router.get("/export/:deckId/csv", bulkExportCardsCSV);
router.put("/tags", bulkUpdateTags);
router.delete("/cards", bulkDeleteCards);

export default router;

