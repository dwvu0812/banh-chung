import { Schema, model } from "mongoose";

const deckSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    isPublic: { type: Boolean, default: false, index: true },
    shareToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Text index for search
deckSchema.index({ name: "text", description: "text" });

// Compound indexes
deckSchema.index({ user: 1, createdAt: -1 });
deckSchema.index({ isPublic: 1, createdAt: -1 });

const Deck = model("Deck", deckSchema);
export default Deck;
