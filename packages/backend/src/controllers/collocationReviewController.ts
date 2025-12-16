import { Response } from "express";
import Collocation from "../models/Collocation";
import { AuthRequest } from "../middleware/authMiddleware";
import { updateSRSData } from "../lib/srs";

// @desc    Get collocations due for review
// @route   GET /api/collocations/review
// @access  Private
export const getCollocationsForReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const collocations = await Collocation.find({
      "srsData.nextReview": { $lte: today },
    })
      .populate("deck", "name description")
      .sort({ "srsData.nextReview": 1 })
      .limit(20);

    res.json({
      collocations,
      count: collocations.length,
    });
  } catch (error) {
    console.error("Get collocations for review error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Submit collocation review
// @route   POST /api/collocations/:id/review
// @access  Private
export const submitCollocationReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { rating } = req.body; // 0 = again, 3 = hard, 4 = good, 5 = easy
  const userId = req.user?.userId;

  try {
    const collocation = await Collocation.findById(id);

    if (!collocation) {
      res.status(404).json({ msg: "Collocation not found" });
      return;
    }

    // Update SRS data based on rating
    const updatedSRSData = updateSRSData(collocation.srsData, rating);
    collocation.srsData = updatedSRSData;

    await collocation.save();

    res.json({
      msg: "Review submitted successfully",
      nextReview: updatedSRSData.nextReview,
      interval: updatedSRSData.interval,
    });
  } catch (error) {
    console.error("Submit collocation review error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get collocation review statistics
// @route   GET /api/collocations/stats
// @access  Private
export const getCollocationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Total collocations available
    const totalCollocations = await Collocation.countDocuments();

    // Collocations due today
    const dueToday = await Collocation.countDocuments({
      "srsData.nextReview": { $lte: today },
    });

    // Collocations by difficulty
    const beginnerCount = await Collocation.countDocuments({ difficulty: "beginner" });
    const intermediateCount = await Collocation.countDocuments({ difficulty: "intermediate" });
    const advancedCount = await Collocation.countDocuments({ difficulty: "advanced" });

    // Collocations by category (based on deck names)
    const categoryStats = await Collocation.aggregate([
      {
        $lookup: {
          from: "decks",
          localField: "deck",
          foreignField: "_id",
          as: "deckInfo",
        },
      },
      {
        $unwind: "$deckInfo",
      },
      {
        $group: {
          _id: "$deckInfo.name",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      total: totalCollocations,
      dueToday,
      byDifficulty: {
        beginner: beginnerCount,
        intermediate: intermediateCount,
        advanced: advancedCount,
      },
      byCategory: categoryStats,
    });
  } catch (error) {
    console.error("Get collocation stats error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get collocations by category
// @route   GET /api/collocations/category/:category
// @access  Private
export const getCollocationsByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { category } = req.params;

  try {
    // Find deck with matching category name
    const collocations = await Collocation.find()
      .populate({
        path: "deck",
        match: { name: { $regex: category, $options: "i" } },
        select: "name description",
      })
      .sort({ createdAt: -1 });

    // Filter out collocations where deck didn't match
    const filteredCollocations = collocations.filter((c) => c.deck);

    res.json({
      collocations: filteredCollocations,
      category,
      count: filteredCollocations.length,
    });
  } catch (error) {
    console.error("Get collocations by category error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};
