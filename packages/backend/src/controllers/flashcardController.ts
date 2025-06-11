import { Response } from "express";
import Flashcard from "../models/Flashcard";
import Deck from "../models/Deck";
import { AuthRequest } from "../middleware/authMiddleware";

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
