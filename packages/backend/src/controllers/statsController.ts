import { Response } from "express";
import Flashcard from "../models/Flashcard";
import Deck from "../models/Deck";
import StudySession from "../models/StudySession";
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

// @desc    Get learning streak data
// @route   GET /api/stats/streaks
// @access  Private
export const getLearningStreaks = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  try {
    // Get user's study sessions grouped by date
    const sessions = await StudySession.aggregate([
      {
        $match: { user: userId },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          totalCards: { $sum: "$cardsReviewed" },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $limit: 365,
      },
    ]);

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert sessions to Set for quick lookup
    const studyDates = new Set(sessions.map((s) => s._id));

    // Calculate current streak (consecutive days from today)
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      if (studyDates.has(dateStr)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    const sortedDates = sessions.map((s) => new Date(s._id)).sort((a, b) => a.getTime() - b.getTime());

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = Math.floor(
          (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    res.json({
      currentStreak,
      longestStreak,
      totalStudyDays: sessions.length,
      recentActivity: sessions.slice(0, 30),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Get progress over time
// @route   GET /api/stats/progress/:timeframe
// @access  Private
export const getProgressStats = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { timeframe } = req.params; // week, month, year

  try {
    let daysBack = 7;
    if (timeframe === "month") daysBack = 30;
    if (timeframe === "year") daysBack = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Get study sessions in timeframe
    const sessions = await StudySession.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          sessions: { $sum: 1 },
          cardsReviewed: { $sum: "$cardsReviewed" },
          cardsCorrect: { $sum: "$cardsCorrect" },
          totalDuration: { $sum: "$duration" },
          avgQuality: { $avg: "$averageQuality" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Calculate totals
    const totals = {
      totalSessions: sessions.reduce((sum, s) => sum + s.sessions, 0),
      totalCardsReviewed: sessions.reduce((sum, s) => sum + s.cardsReviewed, 0),
      totalCardsCorrect: sessions.reduce((sum, s) => sum + s.cardsCorrect, 0),
      totalDuration: sessions.reduce((sum, s) => sum + s.totalDuration, 0),
      accuracy:
        sessions.length > 0
          ? (sessions.reduce((sum, s) => sum + s.cardsCorrect, 0) /
              sessions.reduce((sum, s) => sum + s.cardsReviewed, 0)) *
            100
          : 0,
    };

    res.json({
      timeframe,
      startDate,
      endDate: new Date(),
      daily: sessions,
      totals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Record a study session
// @route   POST /api/stats/sessions
// @access  Private
export const recordStudySession = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { deckId, cardsReviewed, cardsCorrect, duration, averageQuality } = req.body;

  try {
    const session = new StudySession({
      user: userId,
      deck: deckId,
      startTime: new Date(Date.now() - duration * 1000),
      endTime: new Date(),
      cardsReviewed,
      cardsCorrect,
      cardsIncorrect: cardsReviewed - cardsCorrect,
      averageQuality,
      duration,
    });

    await session.save();

    res.status(201).json({
      msg: "Study session recorded",
      session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Get recent study sessions
// @route   GET /api/stats/sessions
// @access  Private
export const getStudySessions = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { limit = "10" } = req.query;

  try {
    const sessions = await StudySession.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10))
      .populate("deck", "name");

    res.json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

