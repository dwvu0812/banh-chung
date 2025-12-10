import { Response } from "express";
import Flashcard from "../models/Flashcard";
import Deck from "../models/Deck";
import { AuthRequest } from "../middleware/authMiddleware";

// @desc    Search flashcards with advanced filtering
// @route   GET /api/search/cards
// @access  Private
export const searchCards = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    q,
    deckId,
    tags,
    srsStatus,
    sortBy = "createdAt",
    order = "desc",
    page = "1",
    limit = "20",
  } = req.query;

  try {
    const query: any = { user: userId };

    // Text search
    if (q && typeof q === "string") {
      query.$text = { $search: q };
    }

    // Filter by deck
    if (deckId && typeof deckId === "string") {
      query.deck = deckId;
    }

    // Filter by tags
    if (tags && typeof tags === "string") {
      const tagArray = tags.split(",").map((t) => t.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    // Filter by SRS status
    if (srsStatus && typeof srsStatus === "string") {
      const now = new Date();
      switch (srsStatus) {
        case "new":
          query["srsData.repetitions"] = 0;
          break;
        case "learning":
          query["srsData.repetitions"] = { $gt: 0, $lt: 3 };
          break;
        case "review":
          query["srsData.repetitions"] = { $gte: 3 };
          break;
        case "due":
          query["srsData.nextReview"] = { $lte: now };
          break;
      }
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    if (sortBy === "word") {
      sortOptions.word = order === "asc" ? 1 : -1;
    } else if (sortBy === "nextReview") {
      sortOptions["srsData.nextReview"] = order === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = order === "asc" ? 1 : -1;
    }

    // Execute query
    const cards = await Flashcard.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate("deck", "name");

    const total = await Flashcard.countDocuments(query);

    res.json({
      cards,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: cards.length,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Search decks
// @route   GET /api/search/decks
// @access  Private
export const searchDecks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const {
    q,
    isPublic,
    sortBy = "createdAt",
    order = "desc",
    page = "1",
    limit = "20",
  } = req.query;

  try {
    const query: any = {};

    // If searching public decks, don't filter by user
    if (isPublic === "true") {
      query.isPublic = true;
    } else {
      query.user = userId;
    }

    // Text search
    if (q && typeof q === "string") {
      query.$text = { $search: q };
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions: any = {};
    if (sortBy === "name") {
      sortOptions.name = order === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = order === "asc" ? 1 : -1;
    }

    // Execute query
    const decks = await Deck.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate("user", "username");

    const total = await Deck.countDocuments(query);

    res.json({
      decks,
      pagination: {
        current: pageNum,
        total: Math.ceil(total / limitNum),
        count: decks.length,
        totalItems: total,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Get all unique tags for user's flashcards
// @route   GET /api/search/tags
// @access  Private
export const getAllTags = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    const tags = await Flashcard.distinct("tags", { user: userId });
    res.json({ tags: tags.filter((tag) => tag && tag.length > 0) });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

