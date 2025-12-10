import { Schema, model } from "mongoose";

const studySessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deck: { type: Schema.Types.ObjectId, ref: "Deck", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    cardsReviewed: { type: Number, default: 0 },
    cardsCorrect: { type: Number, default: 0 },
    cardsIncorrect: { type: Number, default: 0 },
    averageQuality: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // Duration in seconds
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
studySessionSchema.index({ user: 1, createdAt: -1 });
studySessionSchema.index({ user: 1, deck: 1 });

const StudySession = model("StudySession", studySessionSchema);
export default StudySession;

