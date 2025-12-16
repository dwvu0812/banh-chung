import { Response } from "express";
import Quiz, { QuestionType } from "../models/Quiz";
import QuizResult from "../models/QuizResult";
import Collocation from "../models/Collocation";
import Deck from "../models/Deck";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateQuiz } from "../lib/quizGenerator";
import { getPaginationParams } from "../utils/pagination";

// @desc    Create a new quiz (super_admin only)
// @route   POST /api/quizzes
// @access  Private (super_admin)
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    title,
    description,
    deckId,
    collocationIds,
    questionCount,
    questionTypes,
    difficulty,
    timeLimit,
  } = req.body;
  const userId = req.user?.userId;

  try {
    const deck = await Deck.findById(deckId);
    if (!deck) {
      res.status(404).json({ msg: "Deck not found" });
      return;
    }

    // Verify all collocations exist
    const collocations = await Collocation.find({ _id: { $in: collocationIds } });
    if (collocations.length !== collocationIds.length) {
      res.status(400).json({ msg: "Some collocations not found" });
      return;
    }

    const quiz = new Quiz({
      title,
      description,
      deck: deckId,
      collocationIds,
      questionCount,
      questionTypes,
      difficulty: difficulty || "mixed",
      timeLimit,
      createdBy: userId,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get all quizzes (paginated)
// @route   GET /api/quizzes
// @access  Private
export const getQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationParams(req);
    const { difficulty, deckId } = req.query;

    const query: Record<string, unknown> = { isActive: true };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (deckId) {
      query.deck = deckId;
    }

    const quizzes = await Quiz.find(query)
      .populate("deck", "name description")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const quiz = await Quiz.findById(id)
      .populate("deck", "name description")
      .populate("createdBy", "username");

    if (!quiz) {
      res.status(404).json({ msg: "Quiz not found" });
      return;
    }

    res.json(quiz);
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Generate quiz questions dynamically
// @route   GET /api/quizzes/:id/questions
// @access  Private
export const generateQuizQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      res.status(404).json({ msg: "Quiz not found" });
      return;
    }

    // Fetch collocations for this quiz
    const collocations = await Collocation.find({ _id: { $in: quiz.collocationIds } });

    if (collocations.length === 0) {
      res.status(400).json({ msg: "No collocations available for this quiz" });
      return;
    }

    // Generate questions
    const questions = generateQuiz(
      collocations,
      quiz.questionTypes as QuestionType[],
      quiz.questionCount
    );

    res.json({
      quizId: quiz._id,
      title: quiz.title,
      description: quiz.description,
      questionCount: quiz.questionCount,
      timeLimit: quiz.timeLimit,
      questions,
    });
  } catch (error) {
    console.error("Generate quiz questions error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Submit quiz result
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuizResult = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { answers, timeSpent } = req.body;
  const userId = req.user?.userId;

  try {
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      res.status(404).json({ msg: "Quiz not found" });
      return;
    }

    // Calculate score
    let correctCount = 0;
    const processedAnswers = answers.map((answer: any) => {
      const isCorrect = answer.isCorrect || false;
      if (isCorrect) correctCount++;
      return answer;
    });

    const score = Math.round((correctCount / answers.length) * 100);

    const quizResult = new QuizResult({
      quiz: id,
      user: userId,
      answers: processedAnswers,
      score,
      totalQuestions: answers.length,
      timeSpent: timeSpent || 0,
    });

    await quizResult.save();

    res.status(201).json({
      msg: "Quiz submitted successfully",
      result: quizResult,
      score,
      correctCount,
      totalQuestions: answers.length,
    });
  } catch (error) {
    console.error("Submit quiz result error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get user's quiz results
// @route   GET /api/quizzes/results
// @access  Private
export const getUserQuizResults = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  try {
    const { page, limit, skip } = getPaginationParams(req);

    const results = await QuizResult.find({ user: userId })
      .populate({
        path: "quiz",
        select: "title description difficulty",
        populate: { path: "deck", select: "name" },
      })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await QuizResult.countDocuments({ user: userId });

    res.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user quiz results error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Get single quiz result
// @route   GET /api/quizzes/results/:id
// @access  Private
export const getQuizResult = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const result = await QuizResult.findOne({ _id: id, user: userId })
      .populate({
        path: "quiz",
        select: "title description difficulty",
        populate: { path: "deck", select: "name" },
      })
      .populate({
        path: "answers.collocationId",
        select: "phrase meaning examples",
      });

    if (!result) {
      res.status(404).json({ msg: "Quiz result not found" });
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get quiz result error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Update quiz (super_admin only)
// @route   PUT /api/quizzes/:id
// @access  Private (super_admin)
export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, questionCount, questionTypes, difficulty, timeLimit, isActive } =
    req.body;

  try {
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      res.status(404).json({ msg: "Quiz not found" });
      return;
    }

    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (questionCount) quiz.questionCount = questionCount;
    if (questionTypes) quiz.questionTypes = questionTypes;
    if (difficulty) quiz.difficulty = difficulty;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (isActive !== undefined) quiz.isActive = isActive;

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// @desc    Delete quiz (super_admin only)
// @route   DELETE /api/quizzes/:id
// @access  Private (super_admin)
export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      res.status(404).json({ msg: "Quiz not found" });
      return;
    }

    await quiz.deleteOne();
    res.json({ msg: "Quiz removed" });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

