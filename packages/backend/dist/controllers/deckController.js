"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewFlashcard = exports.deleteFlashcard = exports.updateFlashcard = exports.addFlashcard = exports.deleteDeck = exports.updateDeck = exports.createDeck = exports.getDeckById = exports.getPublicDecks = exports.getUserDecks = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Deck_1 = __importDefault(require("../models/Deck"));
const Flashcard_1 = __importDefault(require("../models/Flashcard"));
const getUserDecks = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { category, search } = req.query;
        const userId = req.user._id;
        const query = { userId };
        if (category && category !== "all") {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const decks = await Deck_1.default.find(query)
            .sort({ updatedAt: -1 })
            .populate("flashcards");
        res.json({
            decks,
            count: decks.length,
        });
    }
    catch (error) {
        console.error("Get user decks error:", error);
        res.status(500).json({ message: "Server error while fetching decks" });
    }
};
exports.getUserDecks = getUserDecks;
const getPublicDecks = async (req, res) => {
    try {
        const { category, search, limit = 20, page = 1 } = req.query;
        const query = { isPublic: true };
        if (category && category !== "all") {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const [decks, total] = await Promise.all([
            Deck_1.default.find(query)
                .sort({ cardCount: -1, updatedAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .populate("userId", "username"),
            Deck_1.default.countDocuments(query),
        ]);
        res.json({
            decks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error("Get public decks error:", error);
        res
            .status(500)
            .json({ message: "Server error while fetching public decks" });
    }
};
exports.getPublicDecks = getPublicDecks;
const getDeckById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid deck ID" });
        }
        const deck = await Deck_1.default.findById(id)
            .populate("userId", "username")
            .populate("flashcards");
        if (!deck) {
            return res.status(404).json({ message: "Deck not found" });
        }
        const isOwner = req.user && deck.userId._id.equals(req.user._id);
        if (!deck.isPublic && !isOwner) {
            return res.status(403).json({ message: "Access denied" });
        }
        res.json({ deck });
    }
    catch (error) {
        console.error("Get deck error:", error);
        res.status(500).json({ message: "Server error while fetching deck" });
    }
};
exports.getDeckById = getDeckById;
const createDeck = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { name, description, category, isPublic = false } = req.body;
        if (!name || !category) {
            return res.status(400).json({
                message: "Name and category are required",
            });
        }
        const deck = new Deck_1.default({
            userId: req.user._id,
            name,
            description,
            category,
            isPublic,
        });
        await deck.save();
        res.status(201).json({
            message: "Deck created successfully",
            deck,
        });
    }
    catch (error) {
        console.error("Create deck error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors: messages,
            });
        }
        res.status(500).json({ message: "Server error while creating deck" });
    }
};
exports.createDeck = createDeck;
const updateDeck = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { id } = req.params;
        const { name, description, category, isPublic } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid deck ID" });
        }
        const deck = await Deck_1.default.findById(id);
        if (!deck) {
            return res.status(404).json({ message: "Deck not found" });
        }
        if (!deck.userId.equals(req.user._id)) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (name !== undefined)
            deck.name = name;
        if (description !== undefined)
            deck.description = description;
        if (category !== undefined)
            deck.category = category;
        if (isPublic !== undefined)
            deck.isPublic = isPublic;
        await deck.save();
        res.json({
            message: "Deck updated successfully",
            deck,
        });
    }
    catch (error) {
        console.error("Update deck error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors: messages,
            });
        }
        res.status(500).json({ message: "Server error while updating deck" });
    }
};
exports.updateDeck = updateDeck;
const deleteDeck = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid deck ID" });
        }
        const deck = await Deck_1.default.findById(id);
        if (!deck) {
            return res.status(404).json({ message: "Deck not found" });
        }
        if (!deck.userId.equals(req.user._id)) {
            return res.status(403).json({ message: "Access denied" });
        }
        await Flashcard_1.default.deleteMany({ deckId: id });
        await Deck_1.default.findByIdAndDelete(id);
        res.json({ message: "Deck deleted successfully" });
    }
    catch (error) {
        console.error("Delete deck error:", error);
        res.status(500).json({ message: "Server error while deleting deck" });
    }
};
exports.deleteDeck = deleteDeck;
const addFlashcard = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { id } = req.params;
        const { front, back, difficulty = "medium" } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid deck ID" });
        }
        if (!front || !back) {
            return res.status(400).json({
                message: "Front and back content are required",
            });
        }
        const deck = await Deck_1.default.findById(id);
        if (!deck) {
            return res.status(404).json({ message: "Deck not found" });
        }
        if (!deck.userId.equals(req.user._id)) {
            return res.status(403).json({ message: "Access denied" });
        }
        const flashcard = new Flashcard_1.default({
            deckId: id,
            front,
            back,
            difficulty,
        });
        await flashcard.save();
        deck.cardCount += 1;
        await deck.save();
        res.status(201).json({
            message: "Flashcard added successfully",
            flashcard,
        });
    }
    catch (error) {
        console.error("Add flashcard error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors: messages,
            });
        }
        res.status(500).json({ message: "Server error while adding flashcard" });
    }
};
exports.addFlashcard = addFlashcard;
const updateFlashcard = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { cardId } = req.params;
        const { front, back, difficulty } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(cardId)) {
            return res.status(400).json({ message: "Invalid flashcard ID" });
        }
        const flashcard = await Flashcard_1.default.findById(cardId).populate("deckId");
        if (!flashcard) {
            return res.status(404).json({ message: "Flashcard not found" });
        }
        const deck = flashcard.deckId;
        if (!deck.userId.equals(req.user._id)) {
            return res.status(403).json({ message: "Access denied" });
        }
        if (front !== undefined)
            flashcard.front = front;
        if (back !== undefined)
            flashcard.back = back;
        if (difficulty !== undefined)
            flashcard.difficulty = difficulty;
        await flashcard.save();
        res.json({
            message: "Flashcard updated successfully",
            flashcard,
        });
    }
    catch (error) {
        console.error("Update flashcard error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors: messages,
            });
        }
        res.status(500).json({ message: "Server error while updating flashcard" });
    }
};
exports.updateFlashcard = updateFlashcard;
const deleteFlashcard = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { cardId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(cardId)) {
            return res.status(400).json({ message: "Invalid flashcard ID" });
        }
        const flashcard = await Flashcard_1.default.findById(cardId).populate("deckId");
        if (!flashcard) {
            return res.status(404).json({ message: "Flashcard not found" });
        }
        const deck = flashcard.deckId;
        if (!deck.userId.equals(req.user._id)) {
            return res.status(403).json({ message: "Access denied" });
        }
        await Flashcard_1.default.findByIdAndDelete(cardId);
        await Deck_1.default.findByIdAndUpdate(deck._id, { $inc: { cardCount: -1 } });
        res.json({ message: "Flashcard deleted successfully" });
    }
    catch (error) {
        console.error("Delete flashcard error:", error);
        res.status(500).json({ message: "Server error while deleting flashcard" });
    }
};
exports.deleteFlashcard = deleteFlashcard;
const reviewFlashcard = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const { cardId } = req.params;
        const { correct } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(cardId)) {
            return res.status(400).json({ message: "Invalid flashcard ID" });
        }
        if (typeof correct !== "boolean") {
            return res.status(400).json({
                message: "Correct field must be a boolean",
            });
        }
        const flashcard = await Flashcard_1.default.findById(cardId).populate("deckId");
        if (!flashcard) {
            return res.status(404).json({ message: "Flashcard not found" });
        }
        const deck = flashcard.deckId;
        const isOwner = deck.userId.equals(req.user._id);
        if (!deck.isPublic && !isOwner) {
            return res.status(403).json({ message: "Access denied" });
        }
        flashcard.reviewCount += 1;
        if (correct) {
            flashcard.correctCount += 1;
        }
        flashcard.lastReviewed = new Date();
        await flashcard.save();
        res.json({
            message: "Review recorded successfully",
            flashcard: {
                id: flashcard._id,
                reviewCount: flashcard.reviewCount,
                correctCount: flashcard.correctCount,
                successRate: flashcard.get("successRate"),
                lastReviewed: flashcard.lastReviewed,
            },
        });
    }
    catch (error) {
        console.error("Review flashcard error:", error);
        res.status(500).json({ message: "Server error while recording review" });
    }
};
exports.reviewFlashcard = reviewFlashcard;
//# sourceMappingURL=deckController.js.map