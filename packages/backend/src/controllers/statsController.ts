import { Response } from "express";
import Flashcard from "../models/Flashcard";
import Deck from "../models/Deck";
import { AuthRequest } from "../middleware/authMiddleware";

// @desc    Lấy thống kê tổng quan cho dashboard
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Số thẻ cần ôn tập hôm nay
    const cardsDueToday = await Flashcard.countDocuments({
      user: userId,
      "srsData.nextReview": { $lte: today },
    });

    // Tổng số thẻ đã học
    const totalCards = await Flashcard.countDocuments({ user: userId });

    // Số thẻ mới được tạo hôm nay
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const newCardsToday = await Flashcard.countDocuments({
      user: userId,
      createdAt: { $gte: startOfDay },
    });

    // Tổng số decks
    const totalDecks = await Deck.countDocuments({ user: userId });

    res.json({
      cardsDueToday,
      totalCards,
      newCardsToday,
      totalDecks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Lấy thống kê chi tiết cho một deck
// @route   GET /api/stats/deck/:deckId
// @access  Private
export const getDeckStats = async (req: AuthRequest, res: Response) => {
  const { deckId } = req.params;
  const userId = req.user?.userId;

  try {
    const deck = await Deck.findById(deckId);
    if (!deck || deck.user.toString() !== userId) {
      return res.status(404).json({ msg: "Deck not found or access denied" });
    }

    // Tổng số thẻ trong deck
    const totalCards = await Flashcard.countDocuments({ deck: deckId });

    // Số thẻ cần ôn tập
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const cardsDue = await Flashcard.countDocuments({
      deck: deckId,
      "srsData.nextReview": { $lte: today },
    });

    // Thẻ đã thuộc (repetitions > 0)
    const masteredCards = await Flashcard.countDocuments({
      deck: deckId,
      "srsData.repetitions": { $gt: 0 },
    });

    // Thẻ mới (repetitions = 0)
    const newCards = await Flashcard.countDocuments({
      deck: deckId,
      "srsData.repetitions": 0,
    });

    res.json({
      deckId,
      deckName: deck.name,
      totalCards,
      cardsDue,
      masteredCards,
      newCards,
      masteryPercentage: totalCards > 0 ? (masteredCards / totalCards) * 100 : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

