import { Response } from "express";
import Collocation from "../models/Collocation";
import Deck from "../models/Deck";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateTTSUrl } from "../lib/tts";
import { getPaginationParams } from "../utils/pagination";

// @desc    Create a new collocation (super_admin only)
// @route   POST /api/collocations
// @access  Private (super_admin)
export const createCollocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { phrase, meaning, components, examples, pronunciation, tags, deckId, difficulty } = req.body;
  const userId = req.user?.userId;

  try {
    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ msg: "Deck not found" });
      return;
    }

    // Generate TTS URL if not provided
    const audioUrl = pronunciation || generateTTSUrl(phrase, "en-US");

    const collocation = new Collocation({
      phrase,
      meaning,
      components,
      examples: examples || [],
      pronunciation: audioUrl,
      tags: tags || [],
      deck: deckId,
      user: userId,
      difficulty: difficulty || "intermediate",
    });

    await collocation.save();
    res.status(201).json(collocation);
  } catch (error) {
    console.error("Create collocation error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get all collocations (paginated)
// @route   GET /api/collocations
// @access  Private
export const getCollocations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { difficulty, tags, search } = req.query;

    const query: Record<string, unknown> = {};

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const collocations = await Collocation.find(query)
      .populate("deck", "name description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Collocation.countDocuments(query);

    res.json({
      collocations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get collocations error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get collocations by deck
// @route   GET /api/decks/:deckId/collocations
// @access  Private
export const getCollocationsByDeck = async (req: AuthRequest, res: Response): Promise<void> => {
  const { deckId } = req.params;

  try {
    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ msg: "Deck not found" });
      return;
    }

    const collocations = await Collocation.find({ deck: deckId }).sort({ createdAt: -1 });
    res.json(collocations);
  } catch (error) {
    console.error("Get collocations by deck error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get single collocation
// @route   GET /api/collocations/:id
// @access  Private
export const getCollocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const collocation = await Collocation.findById(id)
      .populate("deck", "name description")
      .populate("user", "username email");

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    res.json(collocation);
  } catch (error) {
    console.error("Get collocation error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Update collocation (super_admin only)
// @route   PUT /api/collocations/:id
// @access  Private (super_admin)
export const updateCollocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { phrase, meaning, components, examples, pronunciation, tags, difficulty } = req.body;

  try {
    const collocation = await Collocation.findById(id);

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    if (phrase) collocation.phrase = phrase;
    if (meaning) collocation.meaning = meaning;
    if (components) collocation.components = components;
    if (examples) collocation.examples = examples;
    if (pronunciation) collocation.pronunciation = pronunciation;
    if (tags) collocation.tags = tags;
    if (difficulty) collocation.difficulty = difficulty;

    const updatedCollocation = await collocation.save();
    res.json(updatedCollocation);
  } catch (error) {
    console.error("Update collocation error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Delete collocation (super_admin only)
// @route   DELETE /api/collocations/:id
// @access  Private (super_admin)
export const deleteCollocation = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const collocation = await Collocation.findById(id);

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    await collocation.deleteOne();
    res.json({ msg: "Collocation removed" });
  } catch (error) {
    console.error("Delete collocation error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Generate audio pronunciation for a collocation
// @route   POST /api/collocations/:id/audio
// @access  Private (super_admin)
export const generateAudio = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { lang } = req.body;

  try {
    const collocation = await Collocation.findById(id);

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    const audioUrl = generateTTSUrl(collocation.phrase, lang || "en-US");
    collocation.pronunciation = audioUrl;

    const updatedCollocation = await collocation.save();
    res.json({ audioUrl, collocation: updatedCollocation });
  } catch (error) {
    console.error("Generate audio error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

