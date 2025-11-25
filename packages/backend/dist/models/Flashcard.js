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
const flashcardSchema = new mongoose_1.Schema({
    deckId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Deck",
        required: [true, "Deck ID is required"],
    },
    front: {
        type: String,
        required: [true, "Front content is required"],
        trim: true,
        maxlength: [500, "Front content cannot exceed 500 characters"],
    },
    back: {
        type: String,
        required: [true, "Back content is required"],
        trim: true,
        maxlength: [1000, "Back content cannot exceed 1000 characters"],
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
    },
    lastReviewed: {
        type: Date,
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: [0, "Review count cannot be negative"],
    },
    correctCount: {
        type: Number,
        default: 0,
        min: [0, "Correct count cannot be negative"],
    },
}, {
    timestamps: true,
});
flashcardSchema.index({ deckId: 1 });
flashcardSchema.index({ lastReviewed: 1 });
flashcardSchema.index({ difficulty: 1 });
flashcardSchema.virtual("successRate").get(function () {
    if (this.reviewCount === 0)
        return 0;
    return Math.round((this.correctCount / this.reviewCount) * 100);
});
flashcardSchema.set("toJSON", { virtuals: true });
exports.default = mongoose_1.default.model("Flashcard", flashcardSchema);
//# sourceMappingURL=Flashcard.js.map