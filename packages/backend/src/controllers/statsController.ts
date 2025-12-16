import { Response } from "express";
import Flashcard from "../models/Flashcard";
import Deck from "../models/Deck";
import StudySession from "../models/StudySession";
import Collocation from "../models/Collocation";
import QuizResult from "../models/QuizResult";
import { AuthRequest } from "../middleware/authMiddleware";
import { calculateSRSAnalytics } from "../lib/srs";

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

    // Collocation statistics
    const totalCollocations = await Collocation.countDocuments();
    const collocationsDueToday = await Collocation.countDocuments({
      "srsData.nextReview": { $lte: today },
    });

    // Quiz statistics
    const totalQuizzesTaken = await QuizResult.countDocuments({ user: userId });
    const recentQuizResults = await QuizResult.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(5)
      .select("score");
    
    const averageScore = recentQuizResults.length > 0
      ? Math.round(recentQuizResults.reduce((sum, r) => sum + r.score, 0) / recentQuizResults.length)
      : 0;

    res.json({
      cardsDueToday,
      totalCards,
      newCardsToday,
      totalDecks,
      collocation: {
        total: totalCollocations,
        dueToday: collocationsDueToday,
      },
      quiz: {
        totalTaken: totalQuizzesTaken,
        averageScore,
      },
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

// @desc    Get SRS analytics for user
// @route   GET /api/stats/srs-analytics
// @access  Private
export const getSRSAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { type = 'all', timeframe = '30' } = req.query;

  try {
    const days = parseInt(timeframe as string, 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get review history from study sessions
    const studySessions = await StudySession.find({
      user: userId,
      createdAt: { $gte: startDate },
    }).select('cardsReviewed cardsCorrect cardsIncorrect averageQuality duration createdAt');

    // Transform study session data for SRS analytics using available aggregate data
    const reviewHistory = studySessions.flatMap(session => {
      const reviews = [];
      for (let i = 0; i < session.cardsReviewed; i++) {
        reviews.push({
          quality: session.averageQuality || 3,
          interval: 1, // Default interval since we don't have individual card data
          reviewTime: session.duration ? session.duration / session.cardsReviewed : 0,
          createdAt: session.createdAt,
        });
      }
      return reviews;
    });

    const analytics = calculateSRSAnalytics(reviewHistory);

    // Get additional metrics
    const totalCards = type === 'flashcards' 
      ? await Flashcard.countDocuments({ user: userId })
      : type === 'collocations'
      ? await Collocation.countDocuments({ user: userId })
      : await Flashcard.countDocuments({ user: userId }) + await Collocation.countDocuments({ user: userId });

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const cardsDueToday = type === 'flashcards'
      ? await Flashcard.countDocuments({ user: userId, "srsData.nextReview": { $lte: today } })
      : type === 'collocations'
      ? await Collocation.countDocuments({ user: userId, "srsData.nextReview": { $lte: today } })
      : await Flashcard.countDocuments({ user: userId, "srsData.nextReview": { $lte: today } }) +
        await Collocation.countDocuments({ user: userId, "srsData.nextReview": { $lte: today } });

    // Calculate mastery levels
    const masteredCards = type === 'flashcards'
      ? await Flashcard.countDocuments({ user: userId, "srsData.repetitions": { $gte: 5 } })
      : type === 'collocations'
      ? await Collocation.countDocuments({ user: userId, "srsData.repetitions": { $gte: 5 } })
      : await Flashcard.countDocuments({ user: userId, "srsData.repetitions": { $gte: 5 } }) +
        await Collocation.countDocuments({ user: userId, "srsData.repetitions": { $gte: 5 } });

    const masteryPercentage = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;

    res.json({
      analytics: {
        ...analytics,
        totalCards,
        cardsDueToday,
        masteredCards,
        masteryPercentage: Number(masteryPercentage.toFixed(1)),
      },
      timeframe: days,
      type,
    });
  } catch (error) {
    console.error("SRS Analytics error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get detailed SRS performance metrics
// @route   GET /api/stats/srs-performance
// @access  Private
export const getSRSPerformance = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { cardType = 'all' } = req.query;

  try {
    // Get performance data for different ease factor ranges
    const easeFactorRanges = [
      { min: 1.3, max: 1.7, label: 'Very Hard' },
      { min: 1.7, max: 2.1, label: 'Hard' },
      { min: 2.1, max: 2.5, label: 'Normal' },
      { min: 2.5, max: 3.0, label: 'Easy' },
      { min: 3.0, max: 5.0, label: 'Very Easy' },
    ];

    const performanceData = await Promise.all(
      easeFactorRanges.map(async (range) => {
        const flashcardCount = cardType !== 'collocations' 
          ? await Flashcard.countDocuments({
              user: userId,
              "srsData.easeFactor": { $gte: range.min, $lt: range.max },
            })
          : 0;

        const collocationCount = cardType !== 'flashcards'
          ? await Collocation.countDocuments({
              user: userId,
              "srsData.easeFactor": { $gte: range.min, $lt: range.max },
            })
          : 0;

        return {
          label: range.label,
          count: flashcardCount + collocationCount,
          percentage: 0, // Will be calculated after getting totals
        };
      })
    );

    const totalCards = performanceData.reduce((sum, item) => sum + item.count, 0);
    
    // Calculate percentages
    performanceData.forEach(item => {
      item.percentage = totalCards > 0 ? Number(((item.count / totalCards) * 100).toFixed(1)) : 0;
    });

    // Get interval distribution
    const intervalRanges = [
      { min: 1, max: 3, label: '1-3 days' },
      { min: 3, max: 7, label: '3-7 days' },
      { min: 7, max: 30, label: '1-4 weeks' },
      { min: 30, max: 90, label: '1-3 months' },
      { min: 90, max: 365, label: '3-12 months' },
    ];

    const intervalDistribution = await Promise.all(
      intervalRanges.map(async (range) => {
        const flashcardCount = cardType !== 'collocations'
          ? await Flashcard.countDocuments({
              user: userId,
              "srsData.interval": { $gte: range.min, $lt: range.max },
            })
          : 0;

        const collocationCount = cardType !== 'flashcards'
          ? await Collocation.countDocuments({
              user: userId,
              "srsData.interval": { $gte: range.min, $lt: range.max },
            })
          : 0;

        return {
          label: range.label,
          count: flashcardCount + collocationCount,
        };
      })
    );

    res.json({
      performanceData,
      intervalDistribution,
      totalCards,
      cardType,
    });
  } catch (error) {
    console.error("SRS Performance error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get learning streak and consistency metrics
// @route   GET /api/stats/learning-streak
// @access  Private
export const getLearningStreak = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    // Get study sessions for the last 90 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const studySessions = await StudySession.find({
      user: userId,
      createdAt: { $gte: startDate },
    }).select('createdAt cardsReviewed').sort({ createdAt: 1 });

    // Calculate daily activity
    const dailyActivity = new Map<string, number>();
    studySessions.forEach(session => {
      const dateKey = session.createdAt.toISOString().split('T')[0];
      dailyActivity.set(dateKey, (dailyActivity.get(dateKey) || 0) + (session.cardsReviewed || 0));
    });

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toISOString().split('T')[0];
      
      if (dailyActivity.has(dateKey)) {
        if (i === 0 || tempStreak > 0) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Calculate weekly consistency (last 4 weeks)
    const weeklyData = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - (week * 7) - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - (week * 7));
      weekEnd.setHours(23, 59, 59, 999);

      const weekSessions = studySessions.filter(session => 
        session.createdAt >= weekStart && session.createdAt <= weekEnd
      );

      const daysActive = new Set(weekSessions.map(session => 
        session.createdAt.toISOString().split('T')[0]
      )).size;

      const totalReviews = weekSessions.reduce((sum, session) => sum + (session.cardsReviewed || 0), 0);

      weeklyData.push({
        week: `Week ${week + 1}`,
        daysActive,
        totalReviews,
        consistency: Number(((daysActive / 7) * 100).toFixed(1)),
      });
    }

    res.json({
      currentStreak,
      longestStreak,
      weeklyData: weeklyData.reverse(), // Most recent week first
      totalActiveDays: dailyActivity.size,
      averageReviewsPerDay: dailyActivity.size > 0 
        ? Number((Array.from(dailyActivity.values()).reduce((sum, count) => sum + count, 0) / dailyActivity.size).toFixed(1))
        : 0,
    });
  } catch (error) {
    console.error("Learning Streak error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

