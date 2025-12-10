import { z } from "zod";

// Submit review validation schema
export const submitReviewSchema = z.object({
  body: z.object({
    quality: z
      .number()
      .int("Quality must be an integer")
      .min(0, "Quality must be between 0 and 5")
      .max(5, "Quality must be between 0 and 5"),
  }),
  params: z.object({
    cardId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid card ID"),
  }),
});

