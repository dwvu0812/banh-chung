import { Schema, model } from "mongoose";

const deckSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Deck = model("Deck", deckSchema);
export default Deck;
