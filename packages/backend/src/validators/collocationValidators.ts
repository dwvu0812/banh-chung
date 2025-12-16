import { z } from "zod";

// Component schema
const componentSchema = z.object({
  word: z.string().min(1, "Component word is required").trim(),
  meaning: z.string().min(1, "Component meaning is required").trim(),
  partOfSpeech: z.string().optional(),
});

// Create collocation validation schema
export const createCollocationSchema = z.object({
  body: z.object({
    phrase: z
      .string()
      .min(3, "Phrase must be at least 3 characters long")
      .max(100, "Phrase cannot exceed 100 characters")
      .trim(),
    meaning: z.string().min(1, "Meaning is required").trim(),
    components: z
      .array(componentSchema)
      .min(1, "At least one component is required"),
    examples: z.array(z.string().trim()).optional(),
    pronunciation: z
      .string()
      .url("Pronunciation must be a valid URL")
      .optional(),
    tags: z.array(z.string().trim()).optional(),
    deckId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid deck ID"),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  }),
});

// Update collocation validation schema
export const updateCollocationSchema = z.object({
  body: z.object({
    phrase: z
      .string()
      .min(3, "Phrase must be at least 3 characters long")
      .max(100, "Phrase cannot exceed 100 characters")
      .trim()
      .optional(),
    meaning: z.string().min(1, "Meaning is required").trim().optional(),
    components: z
      .array(componentSchema)
      .min(1, "At least one component is required")
      .optional(),
    examples: z.array(z.string().trim()).optional(),
    pronunciation: z
      .string()
      .url("Pronunciation must be a valid URL")
      .optional(),
    tags: z.array(z.string().trim()).optional(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid collocation ID"),
  }),
});

// Get collocation validation schema
export const getCollocationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid collocation ID"),
  }),
});

// Delete collocation validation schema
export const deleteCollocationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid collocation ID"),
  }),
});
