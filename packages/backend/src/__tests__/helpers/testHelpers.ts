import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../../models/User";
import Deck from "../../models/Deck";
import Flashcard from "../../models/Flashcard";

// Test user factory
export const createTestUser = async (overrides: any = {}) => {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("testpass123", salt);

  const userData = {
    username: `testuser_${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    passwordHash,
    learningSettings: {
      dailyTarget: 20,
      voiceSpeed: 1.0,
    },
    ...overrides,
  };

  return await User.create(userData);
};

// Test deck factory
export const createTestDeck = async (
  userId: Types.ObjectId,
  overrides: any = {}
) => {
  const deckData = {
    name: `Test Deck ${Date.now()}`,
    description: "Test deck description",
    user: userId,
    ...overrides,
  };

  return await Deck.create(deckData);
};

// Test flashcard factory
export const createTestFlashcard = async (
  userId: Types.ObjectId,
  deckId: Types.ObjectId,
  overrides: any = {}
) => {
  const cardData = {
    word: `testword_${Date.now()}`,
    definition: "Test definition",
    pronunciation: "https://example.com/audio.mp3",
    examples: ["Test example 1", "Test example 2"],
    deck: deckId,
    user: userId,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
    ...overrides,
  };

  return await Flashcard.create(cardData);
};

// Generate JWT token for testing
export const generateTestToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "test-secret", {
    expiresIn: "1h",
  });
};

// Create authorization header
export const getAuthHeader = (userId: string) => {
  const token = generateTestToken(userId);
  return `Bearer ${token}`;
};
