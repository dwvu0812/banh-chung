import { Response } from "express";
import Deck from "../models/Deck";
import Flashcard from "../models/Flashcard";
import { AuthRequest } from "@/middleware/authMiddleware";

// @desc    Tạo một deck mới
// @route   POST /api/decks
// @access  Private
export const createDeck = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ msg: "User not authenticated" });
  }

  try {
    const deck = new Deck({
      name,
      description,
      user: userId,
    });

    const createdDeck = await deck.save();
    res.status(201).json(createdDeck);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Lấy thông tin một deck
// @route   GET /api/decks/:id
// @access  Private
export const getDeck = async (req: AuthRequest, res: Response) => {
  try {
    const deck = await Deck.findById(req.params.id);

    if (!deck) {
      return res.status(404).json({ msg: "Deck not found" });
    }

    // Đảm bảo deck thuộc về người dùng đang đăng nhập
    if (deck.user.toString() !== req.user?.userId) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    res.json(deck);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Deck not found" });
    }
    res.status(500).send("Server Error");
  }
};

// ... hàm createDeck và getDeck đã có

// @desc    Lấy tất cả decks của người dùng
// @route   GET /api/decks
// @access  Private
export const getDecks = async (req: AuthRequest, res: Response) => {
  try {
    const decks = await Deck.find({ user: req.user?.userId });
    res.json(decks);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Cập nhật thông tin deck
// @route   PUT /api/decks/:id
// @access  Private
export const updateDeck = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  try {
    let deck = await Deck.findById(req.params.id);
    if (!deck || deck.user.toString() !== req.user?.userId) {
      return res.status(404).json({ msg: "Deck not found or access denied" });
    }

    deck.name = name || deck.name;
    deck.description = description || deck.description;

    const updatedDeck = await deck.save();
    res.json(updatedDeck);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

// @desc    Xóa một deck
// @route   DELETE /api/decks/:id
// @access  Private
export const deleteDeck = async (req: AuthRequest, res: Response) => {
  try {
    const deck = await Deck.findById(req.params.id);
    if (!deck || deck.user.toString() !== req.user?.userId) {
      return res.status(404).json({ msg: "Deck not found or access denied" });
    }

    // Cũng cần xóa tất cả các card thuộc về deck này
    await Flashcard.deleteMany({ deck: req.params.id });
    await deck.deleteOne();

    res.json({ msg: "Deck and associated cards removed" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
