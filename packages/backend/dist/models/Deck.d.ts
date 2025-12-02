import mongoose, { Document } from "mongoose";
export interface IDeck extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    category: string;
    isPublic: boolean;
    cardCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDeck, {}, {}, {}, mongoose.Document<unknown, {}, IDeck, {}> & IDeck & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Deck.d.ts.map