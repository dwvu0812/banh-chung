import { Response } from "express";
import Deck from "../models/Deck";
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
