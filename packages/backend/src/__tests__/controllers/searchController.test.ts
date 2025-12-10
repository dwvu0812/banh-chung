import { Response } from "express";
import { searchCards, searchDecks, getAllTags } from "../../controllers/searchController";
import { AuthRequest } from "../../middleware/authMiddleware";
import Flashcard from "../../models/Flashcard";
import Deck from "../../models/Deck";

// Mock models
jest.mock("../../models/Flashcard");
jest.mock("../../models/Deck");

describe("Search Controller", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      user: { userId: "test-user-id" },
      query: {},
      params: {},
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("searchCards", () => {
    it("should search cards with text query", async () => {
      const mockCards = [
        {
          _id: "card1",
          word: "hello",
          definition: "greeting",
          deck: { name: "English" },
        },
      ];

      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(mockCards),
            }),
          }),
        }),
      });

      (Flashcard.find as jest.Mock) = mockFind;
      (Flashcard.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(1);

      mockReq.query = {
        q: "hello",
        page: "1",
        limit: "20",
      };

      await searchCards(mockReq as AuthRequest, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          cards: mockCards,
          pagination: expect.any(Object),
        })
      );
    });

    it("should filter by deck", async () => {
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      (Flashcard.find as jest.Mock) = mockFind;
      (Flashcard.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(0);

      mockReq.query = {
        deckId: "deck-123",
      };

      await searchCards(mockReq as AuthRequest, mockRes as Response);

      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({
          deck: "deck-123",
        })
      );
    });

    it("should filter by tags", async () => {
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });

      (Flashcard.find as jest.Mock) = mockFind;
      (Flashcard.countDocuments as jest.Mock) = jest.fn().mockResolvedValue(0);

      mockReq.query = {
        tags: "grammar,vocabulary",
      };

      await searchCards(mockReq as AuthRequest, mockRes as Response);

      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: { $in: ["grammar", "vocabulary"] },
        })
      );
    });
  });

  describe("getAllTags", () => {
    it("should return all unique tags for user", async () => {
      const mockTags = ["grammar", "vocabulary", "verbs"];
      (Flashcard.distinct as jest.Mock) = jest.fn().mockResolvedValue(mockTags);

      await getAllTags(mockReq as AuthRequest, mockRes as Response);

      expect(Flashcard.distinct).toHaveBeenCalledWith("tags", {
        user: "test-user-id",
      });
      expect(mockRes.json).toHaveBeenCalledWith({ tags: mockTags });
    });
  });
});

