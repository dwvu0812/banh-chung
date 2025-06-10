import { Schema, model } from "mongoose";

const flashcardSchema = new Schema({
  word: { type: String, required: true },
  definition: { type: String, required: true },
  pronunciation: String, // URL to audio file
  examples: [String],
  deck: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  srsData: {
    interval: { type: Number, default: 1 },
    easeFactor: { type: Number, default: 2.5 },
    repetitions: { type: Number, default: 0 },
    nextReview: { type: Date, default: () => new Date() },
  },
});

const Flashcard = model("Flashcard", flashcardSchema);
export default Flashcard;
