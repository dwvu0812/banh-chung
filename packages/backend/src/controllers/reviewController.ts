import { Response } from "express";
import Flashcard from "../models/Flashcard";
import { AuthRequest } from "../middleware/authMiddleware";
import { calculateSM2 } from "../lib/srs";

// @desc    Lấy danh sách các card cần ôn tập hôm nay
// @route   GET /api/reviews
// @access  Private
export const getReviewCards = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Lấy đến cuối ngày hôm nay

    const reviewCards = await Flashcard.find({
      user: req.user?.userId,
      "srsData.nextReview": { $lte: today },
    }).limit(20); // Giới hạn số lượng thẻ mỗi lần lấy

    res.json(reviewCards);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Gửi kết quả ôn tập cho một card
// @route   POST /api/reviews/:cardId
// @access  Private
export const submitReview = async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params;
  const { quality } = req.body; // quality từ 0-5

  if (quality === undefined || quality < 0 || quality > 5) {
    return res.status(400).json({ msg: "Invalid quality value (must be 0-5)" });
  }

  try {
    const card = await Flashcard.findById(cardId);
    if (!card || card.user.toString() !== req.user?.userId) {
      return res.status(404).json({ msg: "Card not found or access denied" });
    }

    const { repetitions, interval, easeFactor } = card.srsData;
    const newSrsData = calculateSM2(quality, repetitions, interval, easeFactor);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newSrsData.interval);

    card.srsData = {
      interval: newSrsData.interval,
      easeFactor: newSrsData.easeFactor,
      repetitions: newSrsData.repetitions,
      nextReview: nextReviewDate,
    };

    await card.save();
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
