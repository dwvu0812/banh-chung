import request from "supertest";
import express from "express";
import { protect } from "../../middleware/authMiddleware";
import { getReviewCards, submitReview } from "../../controllers/reviewController";
import Flashcard from "../../models/Flashcard";

jest.mock("../../models/Flashcard");
jest.mock("../../middleware/authMiddleware");

const app = express();
app.use(express.json());

// Mock protect middleware
(protect as jest.Mock).mockImplementation((req, res, next) => {
  req.user = { userId: "testUserId" };
  next();
});

// Setup routes
app.get("/api/reviews", protect, getReviewCards);
app.post("/api/reviews/:cardId", protect, submitReview);

describe("Review Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/reviews - getReviewCards", () => {
    it("should return cards due for review", async () => {
      const mockCards = [
        {
          _id: "card1",
          word: "hello",
          srsData: { nextReview: new Date("2024-01-01") },
        },
        {
          _id: "card2",
          word: "world",
          srsData: { nextReview: new Date("2024-01-02") },
        },
      ];

      (Flashcard.find as jest.Mock).mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockCards),
      });

      const response = await request(app).get("/api/reviews");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe("POST /api/reviews/:cardId - submitReview", () => {
    it("should submit review and update SRS data", async () => {
      const mockCard = {
        _id: "cardId",
        word: "hello",
        user: "testUserId",
        srsData: {
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          nextReview: new Date(),
        },
        save: jest.fn().mockResolvedValue(this),
      };

      (Flashcard.findById as jest.Mock).mockResolvedValue(mockCard);

      const response = await request(app)
        .post("/api/reviews/cardId")
        .send({ quality: 4 });

      expect(response.status).toBe(200);
      expect(mockCard.save).toHaveBeenCalled();
    });

    it("should return 400 for invalid quality value", async () => {
      const response = await request(app)
        .post("/api/reviews/cardId")
        .send({ quality: 6 }); // Invalid: > 5

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe("Invalid quality value (must be 0-5)");
    });

    it("should return 404 if card not found", async () => {
      (Flashcard.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/reviews/cardId")
        .send({ quality: 4 });

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe("Card not found or access denied");
    });
  });
});

