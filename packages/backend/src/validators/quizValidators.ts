import { z } from "zod";

// Create quiz validation schema
export const createQuizSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(100, "Title cannot exceed 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    deckId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid deck ID"),
    collocationIds: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid collocation ID"))
      .min(1, "At least one collocation is required"),
    questionCount: z
      .number()
      .int()
      .min(1, "Question count must be at least 1")
      .max(50, "Question count cannot exceed 50"),
    questionTypes: z
      .array(z.enum(["definition_choice", "fill_blank", "match_pairs"]))
      .min(1, "At least one question type is required"),
    difficulty: z.enum(["beginner", "intermediate", "advanced", "mixed"]).optional(),
    timeLimit: z
      .number()
      .int()
      .min(60, "Time limit must be at least 60 seconds")
      .max(3600, "Time limit cannot exceed 3600 seconds")
      .optional(),
  }),
});

// Update quiz validation schema
export const updateQuizSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters long")
      .max(100, "Title cannot exceed 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    questionCount: z
      .number()
      .int()
      .min(1, "Question count must be at least 1")
      .max(50, "Question count cannot exceed 50")
      .optional(),
    questionTypes: z
      .array(z.enum(["definition_choice", "fill_blank", "match_pairs"]))
      .min(1, "At least one question type is required")
      .optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced", "mixed"]).optional(),
    timeLimit: z
      .number()
      .int()
      .min(60, "Time limit must be at least 60 seconds")
      .max(3600, "Time limit cannot exceed 3600 seconds")
      .optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID"),
  }),
});

// Get quiz validation schema
export const getQuizSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID"),
  }),
});

// Submit quiz result validation schema
export const submitQuizResultSchema = z.object({
  body: z.object({
    answers: z.array(
      z.object({
        questionIndex: z.number().int().min(0),
        questionType: z.string(),
        collocationId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid collocation ID"),
        userAnswer: z.union([z.string(), z.array(z.string())]),
        correctAnswer: z.union([z.string(), z.array(z.string())]),
        isCorrect: z.boolean(),
      })
    ),
    timeSpent: z.number().int().min(0),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID"),
  }),
});

// Delete quiz validation schema
export const deleteQuizSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid quiz ID"),
  }),
});

