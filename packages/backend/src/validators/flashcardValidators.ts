import { z } from "zod";

// Create flashcard validation schema
export const createFlashcardSchema = z.object({
  body: z.object({
    word: z
      .string()
      .min(1, "Word is required")
      .max(200, "Word cannot exceed 200 characters")
      .trim(),
    definition: z
      .string()
      .min(1, "Definition is required")
      .max(1000, "Definition cannot exceed 1000 characters")
      .trim(),
    pronunciation: z.string().url("Invalid pronunciation URL").optional(),
    examples: z
      .array(z.string().max(500, "Example cannot exceed 500 characters"))
      .max(10, "Cannot have more than 10 examples")
      .optional(),
  }),
  params: z.object({
    deckId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid deck ID"),
  }),
});

// Update flashcard validation schema
export const updateFlashcardSchema = z.object({
  body: z.object({
    word: z
      .string()
      .min(1, "Word is required")
      .max(200, "Word cannot exceed 200 characters")
      .trim()
      .optional(),
    definition: z
      .string()
      .min(1, "Definition is required")
      .max(1000, "Definition cannot exceed 1000 characters")
      .trim()
      .optional(),
    pronunciation: z.string().url("Invalid pronunciation URL").optional(),
    examples: z
      .array(z.string().max(500, "Example cannot exceed 500 characters"))
      .max(10, "Cannot have more than 10 examples")
      .optional(),
  }),
  params: z.object({
    cardId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid card ID"),
  }),
});

// Get flashcard validation schema
export const getFlashcardSchema = z.object({
  params: z.object({
    cardId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid card ID"),
  }),
});

// Delete flashcard validation schema
export const deleteFlashcardSchema = z.object({
  params: z.object({
    cardId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid card ID"),
  }),
});

// Generate audio validation schema
export const generateAudioSchema = z.object({
  body: z.object({
    lang: z
      .string()
      .regex(/^[a-z]{2}-[A-Z]{2}$/, "Invalid language format (expected: en-US)")
      .optional(),
  }),
  params: z.object({
    cardId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid card ID"),
  }),
});

