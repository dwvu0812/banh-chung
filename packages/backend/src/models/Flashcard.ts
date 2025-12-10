import { Schema, model } from "mongoose";

const flashcardSchema = new Schema(
  {
    word: { type: String, required: true, index: true },
    definition: { type: String, required: true },
    pronunciation: String,
    examples: [String],
    tags: [{ type: String, trim: true, lowercase: true }],
    deck: { type: Schema.Types.ObjectId, ref: "Deck", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    srsData: {
      interval: { type: Number, default: 1 },
      easeFactor: { type: Number, default: 2.5 },
      repetitions: { type: Number, default: 0 },
      nextReview: { type: Date, default: () => new Date(), index: true },
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
flashcardSchema.index({ word: "text", definition: "text", examples: "text" });

// Compound indexes for common queries
flashcardSchema.index({ user: 1, deck: 1 });
flashcardSchema.index({ user: 1, "srsData.nextReview": 1 });
flashcardSchema.index({ tags: 1 });

const Flashcard = model("Flashcard", flashcardSchema);
export default Flashcard;
