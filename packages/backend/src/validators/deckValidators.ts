import { z } from "zod";

// Create deck validation schema
export const createDeckSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Deck name is required")
      .max(100, "Deck name cannot exceed 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  }),
});

// Update deck validation schema
export const updateDeckSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Deck name is required")
      .max(100, "Deck name cannot exceed 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid deck ID"),
  }),
});

// Get deck validation schema
export const getDeckSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid deck ID"),
  }),
});

// Delete deck validation schema
export const deleteDeckSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid deck ID"),
  }),
});
