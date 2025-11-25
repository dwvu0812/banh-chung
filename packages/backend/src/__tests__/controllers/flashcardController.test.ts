import request from "supertest";
import express from "express";
import { protect } from "../../middleware/authMiddleware";
import {
  createFlashcard,
  getCardsByDeck,
  getFlashcard,
  updateFlashcard,
  deleteFlashcard,
  generateAudio,
} from "../../controllers/flashcardController";
import Flashcard from "../../models/Flashcard";
import Deck from "../../models/Deck";

jest.mock("../../models/Flashcard");
jest.mock("../../models/Deck");
jest.mock("../../middleware/authMiddleware");

const app = express();
app.use(express.json());

// Mock protect middleware
(protect as jest.Mock).mockImplementation((req, res, next) => {
  req.user = { userId: "testUserId" };
  next();
});

// Setup routes
app.post("/api/decks/:deckId/cards", protect, createFlashcard);
app.get("/api/decks/:deckId/cards", protect, getCardsByDeck);
app.get("/api/cards/:cardId", protect, getFlashcard);
app.put("/api/cards/:cardId", protect, updateFlashcard);
app.delete("/api/cards/:cardId", protect, deleteFlashcard);
app.post("/api/cards/:cardId/audio", protect, generateAudio);

describe("Flashcard Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/decks/:deckId/cards - createFlashcard", () => {
    it("should create a new flashcard", async () => {
      const mockDeck = {
        _id: "deckId",
        user: "testUserId",
      };

      const mockFlashcard = {
        _id: "cardId",
        word: "hello",
        definition: "a greeting",
        pronunciation: "",
        examples: ["Hello world"],
        deck: "deckId",
        user: "testUserId",
        save: jest.fn().mockResolvedValue(this),
      };

      (Deck.findById as jest.Mock).mockResolvedValue(mockDeck);
      (Flashcard as any).mockImplementation(() => mockFlashcard);

      const response = await request(app)
        .post("/api/decks/deckId/cards")
        .send({
          word: "hello",
          definition: "a greeting",
          examples: ["Hello world"],
        });

      expect(response.status).toBe(201);
      expect(mockFlashcard.save).toHaveBeenCalled();
    });

    it("should return 404 if deck not found", async () => {
      (Deck.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/decks/deckId/cards")
        .send({
          word: "hello",
          definition: "a greeting",
        });

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Deck not found or access denied");
    });
  });

  describe("GET /api/decks/:deckId/cards - getCardsByDeck", () => {
    it("should return all cards in a deck", async () => {
      const mockDeck = {
        _id: "deckId",
        user: "testUserId",
      };

      const mockCards = [
        { _id: "card1", word: "hello" },
        { _id: "card2", word: "world" },
      ];

      (Deck.findById as jest.Mock).mockResolvedValue(mockDeck);
      (Flashcard.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockCards),
      });

      const response = await request(app).get("/api/decks/deckId/cards");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe("GET /api/cards/:cardId - getFlashcard", () => {
    it("should return a single flashcard", async () => {
      const mockCard = {
        _id: "cardId",
        word: "hello",
        user: "testUserId",
      };

      (Flashcard.findById as jest.Mock).mockResolvedValue(mockCard);

      const response = await request(app).get("/api/cards/cardId");

      expect(response.status).toBe(200);
      expect(response.body.word).toBe("hello");
    });

    it("should return 404 if card not found", async () => {
      (Flashcard.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/api/cards/cardId");

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/cards/:cardId - updateFlashcard", () => {
    it("should update a flashcard", async () => {
      const mockCard = {
        _id: "cardId",
        word: "hello",
        definition: "old definition",
        user: "testUserId",
        save: jest.fn().mockResolvedValue({
          _id: "cardId",
          word: "hello",
          definition: "new definition",
        }),
      };

      (Flashcard.findById as jest.Mock).mockResolvedValue(mockCard);

      const response = await request(app)
        .put("/api/cards/cardId")
        .send({ definition: "new definition" });

      expect(response.status).toBe(200);
      expect(mockCard.save).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/cards/:cardId - deleteFlashcard", () => {
    it("should delete a flashcard", async () => {
      const mockCard = {
        _id: "cardId",
        user: "testUserId",
        deleteOne: jest.fn().mockResolvedValue(true),
      };

      (Flashcard.findById as jest.Mock).mockResolvedValue(mockCard);

      const response = await request(app).delete("/api/cards/cardId");

      expect(response.status).toBe(200);
      expect(mockCard.deleteOne).toHaveBeenCalled();
    });
  });

  describe("POST /api/cards/:cardId/audio - generateAudio", () => {
    it("should generate audio URL for a card", async () => {
      const mockCard = {
        _id: "cardId",
        word: "hello",
        user: "testUserId",
        pronunciation: "",
        save: jest.fn().mockResolvedValue({
          _id: "cardId",
          word: "hello",
          pronunciation: expect.any(String),
        }),
      };

      (Flashcard.findById as jest.Mock).mockResolvedValue(mockCard);

      const response = await request(app)
        .post("/api/cards/cardId/audio")
        .send({ lang: "en-US" });

      expect(response.status).toBe(200);
      expect(response.body.audioUrl).toContain("translate.google.com");
      expect(mockCard.save).toHaveBeenCalled();
    });
  });
});

