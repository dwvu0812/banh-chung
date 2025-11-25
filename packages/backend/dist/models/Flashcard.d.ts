import mongoose, { Document } from "mongoose";
export interface IFlashcard extends Document {
    deckId: mongoose.Types.ObjectId;
    front: string;
    back: string;
    difficulty: "easy" | "medium" | "hard";
    lastReviewed?: Date;
    reviewCount: number;
    correctCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IFlashcard, {}, {}, {}, mongoose.Document<unknown, {}, IFlashcard, {}> & IFlashcard & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Flashcard.d.ts.map