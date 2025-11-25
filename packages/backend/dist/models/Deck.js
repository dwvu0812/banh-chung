"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const deckSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
    },
    name: {
        type: String,
        required: [true, "Deck name is required"],
        trim: true,
        maxlength: [100, "Deck name cannot exceed 100 characters"],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        trim: true,
        enum: {
            values: [
                "English Vocabulary",
                "Grammar",
                "Pronunciation",
                "Business English",
                "Academic English",
                "Conversation",
                "TOEIC",
                "IELTS",
                "TOEFL",
                "Other",
            ],
            message: "Invalid category",
        },
        default: "English Vocabulary",
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    cardCount: {
        type: Number,
        default: 0,
        min: [0, "Card count cannot be negative"],
    },
}, {
    timestamps: true,
});
deckSchema.index({ userId: 1 });
deckSchema.index({ category: 1 });
deckSchema.index({ isPublic: 1 });
deckSchema.index({ name: "text", description: "text" });
deckSchema.virtual("flashcards", {
    ref: "Flashcard",
    localField: "_id",
    foreignField: "deckId",
});
deckSchema.set("toJSON", { virtuals: true });
exports.default = mongoose_1.default.model("Deck", deckSchema);
//# sourceMappingURL=Deck.js.map