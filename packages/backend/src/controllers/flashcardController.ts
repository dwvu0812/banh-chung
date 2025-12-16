import { Response } from "express";
import Flashcard from "../models/Flashcard";
import Deck from "../models/Deck";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateTTSUrl } from "../lib/tts";

// @desc    Tạo một flashcard mới trong một deck
// @route   POST /api/decks/:deckId/cards
// @access  Private
export const createFlashcard = async (req: AuthRequest, res: Response) => {
  const { word, definition, pronunciation, examples } = req.body;
  const { deckId } = req.params;
  const userId = req.user?.userId;

  try {
    const deck = await Deck.findById(deckId);
    if (!deck || deck.user.toString() !== userId) {
      return res.status(404).json({ msg: "Deck not found or access denied" });
    }

    const flashcard = new Flashcard({
      word,
      definition,
      pronunciation, // URL âm thanh từ Google TTS
      examples,
      deck: deckId,
      user: userId,
    });

    await flashcard.save();
    res.status(201).json(flashcard);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Lấy tất cả flashcards trong một deck
// @route   GET /api/decks/:deckId/cards
// @access  Private
export const getCardsByDeck = async (req: AuthRequest, res: Response) => {
  const { deckId } = req.params;
  const userId = req.user?.userId;

  try {
    const deck = await Deck.findById(deckId);
    if (!deck || deck.user.toString() !== userId) {
      return res.status(404).json({ msg: "Deck not found or access denied" });
    }

    const cards = await Flashcard.find({ deck: deckId }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Lấy một flashcard
// @route   GET /api/cards/:cardId
// @access  Private
export const getFlashcard = async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const userId = req.user?.userId;

  try {
    const card = await Flashcard.findById(cardId);

    if (!card) {
      return res.status(404).json({ msg: "Flashcard not found" });
    }

    if (card.user.toString() !== userId) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Cập nhật một flashcard
// @route   PUT /api/cards/:cardId
// @access  Private
export const updateFlashcard = async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const { word, definition, pronunciation, examples } = req.body;
  const userId = req.user?.userId;

  try {
    const card = await Flashcard.findById(cardId);

    if (!card) {
      return res.status(404).json({ msg: "Flashcard not found" });
    }

    if (card.user.toString() !== userId) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    card.word = word || card.word;
    card.definition = definition || card.definition;
    card.pronunciation = pronunciation || card.pronunciation;
    card.examples = examples || card.examples;

    const updatedCard = await card.save();
    res.json(updatedCard);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Xóa một flashcard
// @route   DELETE /api/cards/:cardId
// @access  Private
export const deleteFlashcard = async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const userId = req.user?.userId;

  try {
    const card = await Flashcard.findById(cardId);

    if (!card) {
      return res.status(404).json({ msg: "Flashcard not found" });
    }

    if (card.user.toString() !== userId) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await card.deleteOne();
    res.json({ msg: "Flashcard removed" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Generate audio pronunciation cho một flashcard
// @route   POST /api/cards/:cardId/audio
// @access  Private
export const generateAudio = async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const { lang } = req.body; // Optional: ngôn ngữ, mặc định en-US
  const userId = req.user?.userId;

  try {
    const card = await Flashcard.findById(cardId);

    if (!card) {
      return res.status(404).json({ msg: "Flashcard not found" });
    }

    if (card.user.toString() !== userId) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Note: Now using Web Speech API on frontend, no need for external TTS URLs
    const audioUrl = generateTTSUrl(card.word, lang || "en-US");
    card.pronunciation = audioUrl; // Will be null, indicating to use Web Speech API

    const updatedCard = await card.save();
    res.json({ audioUrl, card: updatedCard });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
