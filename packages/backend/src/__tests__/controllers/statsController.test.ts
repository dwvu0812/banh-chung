import request from "supertest";
import express from "express";
import { protect } from "../../middleware/authMiddleware";
import { getDashboardStats, getDeckStats } from "../../controllers/statsController";
import Flashcard from "../../models/Flashcard";
import Deck from "../../models/Deck";

jest.mock("../../models/Flashcard");
jest.mock("../../models/Deck");
jest.mock("../../middleware/authMiddleware");

const app = express();
app.use(express.json());

// Mock protect middleware
(protect as jest.Mock).mockImplementation((req, res, next) => {
  req.user = { userId: "507f1f77bcf86cd799439011" }; // Valid MongoDB ObjectId format
  next();
});

// Setup routes
app.get("/api/stats/dashboard", protect, getDashboardStats);
app.get("/api/stats/deck/:deckId", protect, getDeckStats);

describe("Stats Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/stats/dashboard - getDashboardStats", () => {
    it("should return dashboard statistics", async () => {
      (Flashcard.countDocuments as jest.Mock)
        .mockResolvedValueOnce(10) // cardsDueToday
        .mockResolvedValueOnce(50) // totalCards
        .mockResolvedValueOnce(5); // newCardsToday

      (Deck.countDocuments as jest.Mock).mockResolvedValue(3); // totalDecks

      const response = await request(app).get("/api/stats/dashboard");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        cardsDueToday: 10,
        totalCards: 50,
        newCardsToday: 5,
        totalDecks: 3,
        collocation: {
          dueToday: 0,
          total: 0,
        },
        quiz: {
          averageScore: 0,
          totalTaken: 0,
        },
      });
    });
  });

  describe("GET /api/stats/deck/:deckId - getDeckStats", () => {
    it("should return deck statistics", async () => {
      const mockDeck = {
        _id: "507f1f77bcf86cd799439012", // Valid ObjectId format
        name: "Test Deck",
        user: "507f1f77bcf86cd799439011", // Same as the user ID in mock
      };

      (Deck.findById as jest.Mock).mockResolvedValue(mockDeck);
      (Flashcard.countDocuments as jest.Mock)
        .mockResolvedValueOnce(20) // totalCards
        .mockResolvedValueOnce(5) // cardsDue
        .mockResolvedValueOnce(15) // masteredCards
        .mockResolvedValueOnce(5); // newCards

      const response = await request(app).get("/api/stats/deck/507f1f77bcf86cd799439012");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        deckId: "507f1f77bcf86cd799439012",
        deckName: "Test Deck",
        totalCards: 20,
        cardsDue: 5,
        masteredCards: 15,
        newCards: 5,
        masteryPercentage: 75,
      });
    });

    it("should return 404 if deck not found", async () => {
      (Deck.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/api/stats/deck/507f1f77bcf86cd799439013");

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Deck not found or access denied");
    });
  });
});

