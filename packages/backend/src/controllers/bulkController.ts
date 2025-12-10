import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Flashcard from "../models/Flashcard";
import Deck from "../models/Deck";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import fs from "fs";

// @desc    Bulk import flashcards from JSON
// @route   POST /api/bulk/import
// @access  Private
export const bulkImportCards = async (req: AuthRequest, res: Response) => {
  const { deckId, cards } = req.body;
  const userId = req.user?.userId;

  try {
    // Verify deck ownership
    const deck = await Deck.findById(deckId);
    if (!deck || deck.user.toString() !== userId) {
      return res.status(404).json({ msg: "Deck not found or access denied" });
    }

    // Validate cards array
    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ msg: "Cards must be a non-empty array" });
    }

    if (cards.length > 500) {
      return res.status(400).json({ msg: "Cannot import more than 500 cards at once" });
    }

    // Prepare flashcards for bulk insert
    const flashcards = cards.map((card: any) => ({
      word: card.word,
      definition: card.definition,
      pronunciation: card.pronunciation || undefined,
      examples: card.examples || [],
      tags: card.tags || [],
      deck: deckId,
      user: userId,
    }));

    // Bulk insert
    const insertedCards = await Flashcard.insertMany(flashcards);

    res.status(201).json({
      msg: `Successfully imported ${insertedCards.length} flashcards`,
      count: insertedCards.length,
      cards: insertedCards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Bulk export flashcards to JSON
// @route   GET /api/bulk/export/:deckId
// @access  Private
export const bulkExportCards = async (req: AuthRequest, res: Response) => {
  const { deckId } = req.params;
  const userId = req.user?.userId;

  try {
    // Verify deck ownership
    const deck = await Deck.findById(deckId);
    if (!deck || deck.user.toString() !== userId) {
      return res.status(404).json({ msg: "Deck not found or access denied" });
    }

    // Get all cards in deck
    const cards = await Flashcard.find({ deck: deckId, user: userId }).select(
      "word definition pronunciation examples tags srsData createdAt"
    );

    res.json({
      deckName: deck.name,
      deckDescription: deck.description,
      exportDate: new Date().toISOString(),
      count: cards.length,
      cards: cards.map((card) => ({
        word: card.word,
        definition: card.definition,
        pronunciation: card.pronunciation,
        examples: card.examples,
        tags: card.tags,
        srsData: card.srsData,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Bulk export flashcards to CSV
// @route   GET /api/bulk/export/:deckId/csv
// @access  Private
export const bulkExportCardsCSV = async (req: AuthRequest, res: Response) => {
  const { deckId } = req.params;
  const userId = req.user?.userId;

  try {
    // Verify deck ownership
    const deck = await Deck.findById(deckId);
    if (!deck || deck.user.toString() !== userId) {
      return res.status(404).json({ msg: "Deck not found or access denied" });
    }

    // Get all cards in deck
    const cards = await Flashcard.find({ deck: deckId, user: userId }).select(
      "word definition pronunciation examples tags"
    );

    // Create CSV file
    const fileName = `${deck.name.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.csv`;
    const filePath = path.join(__dirname, "../../temp", fileName);

    // Ensure temp directory exists
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "word", title: "Word" },
        { id: "definition", title: "Definition" },
        { id: "pronunciation", title: "Pronunciation" },
        { id: "examples", title: "Examples" },
        { id: "tags", title: "Tags" },
      ],
    });

    const records = cards.map((card) => ({
      word: card.word,
      definition: card.definition,
      pronunciation: card.pronunciation || "",
      examples: card.examples.join("; "),
      tags: card.tags.join(", "),
    }));

    await csvWriter.writeRecords(records);

    // Send file
    res.download(filePath, fileName, (err) => {
      // Clean up file after sending
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      if (err) {
        console.error("Error sending file:", err);
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Bulk update tags for flashcards
// @route   PUT /api/bulk/tags
// @access  Private
export const bulkUpdateTags = async (req: AuthRequest, res: Response) => {
  const { cardIds, tagsToAdd, tagsToRemove } = req.body;
  const userId = req.user?.userId;

  try {
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ msg: "cardIds must be a non-empty array" });
    }

    const updateOperation: any = {};

    if (tagsToAdd && Array.isArray(tagsToAdd) && tagsToAdd.length > 0) {
      updateOperation.$addToSet = {
        tags: { $each: tagsToAdd.map((t: string) => t.trim().toLowerCase()) },
      };
    }

    if (tagsToRemove && Array.isArray(tagsToRemove) && tagsToRemove.length > 0) {
      updateOperation.$pull = {
        tags: { $in: tagsToRemove.map((t: string) => t.trim().toLowerCase()) },
      };
    }

    if (Object.keys(updateOperation).length === 0) {
      return res.status(400).json({ msg: "No tags to add or remove" });
    }

    const result = await Flashcard.updateMany(
      { _id: { $in: cardIds }, user: userId },
      updateOperation
    );

    res.json({
      msg: "Tags updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Bulk delete flashcards
// @route   DELETE /api/bulk/cards
// @access  Private
export const bulkDeleteCards = async (req: AuthRequest, res: Response) => {
  const { cardIds } = req.body;
  const userId = req.user?.userId;

  try {
    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ msg: "cardIds must be a non-empty array" });
    }

    const result = await Flashcard.deleteMany({
      _id: { $in: cardIds },
      user: userId,
    });

    res.json({
      msg: "Flashcards deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

