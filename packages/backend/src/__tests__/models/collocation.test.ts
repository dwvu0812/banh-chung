import mongoose from "mongoose";
import Collocation, { CollocationDifficulty } from "../../models/Collocation";
import User, { UserRole } from "../../models/User";
import Deck from "../../models/Deck";

describe("Collocation Model", () => {
  let testUser: any;
  let testDeck: any;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      passwordHash: "hashedpassword",
      role: UserRole.SUPER_ADMIN,
    });

    // Create test deck
    testDeck = await Deck.create({
      name: "Test Deck",
      description: "Test Description",
      user: testUser._id,
    });
  });

  afterEach(async () => {
    await Collocation.deleteMany({});
    await Deck.deleteMany({});
    await User.deleteMany({});
  });

  it("should create a valid collocation", async () => {
    const collocation = await Collocation.create({
      phrase: "make a decision",
      meaning: "đưa ra quyết định",
      components: [
        { word: "make", meaning: "làm", partOfSpeech: "verb" },
        { word: "decision", meaning: "quyết định", partOfSpeech: "noun" },
      ],
      examples: ["We need to make a decision."],
      tags: ["make", "decision"],
      deck: testDeck._id,
      user: testUser._id,
      difficulty: CollocationDifficulty.BEGINNER,
    });

    expect(collocation.phrase).toBe("make a decision");
    expect(collocation.meaning).toBe("đưa ra quyết định");
    expect(collocation.components).toHaveLength(2);
    expect(collocation.difficulty).toBe(CollocationDifficulty.BEGINNER);
  });

  it("should require phrase and meaning", async () => {
    try {
      await Collocation.create({
        components: [{ word: "test", meaning: "test" }],
        deck: testDeck._id,
        user: testUser._id,
      });
      fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.name).toBe("ValidationError");
    }
  });

  it("should require at least one component", async () => {
    try {
      await Collocation.create({
        phrase: "test phrase",
        meaning: "test meaning",
        components: [],
        deck: testDeck._id,
        user: testUser._id,
      });
      fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.name).toBe("ValidationError");
    }
  });

  it("should have default SRS data", async () => {
    const collocation = await Collocation.create({
      phrase: "take a break",
      meaning: "nghỉ ngơi",
      components: [{ word: "take", meaning: "lấy" }],
      deck: testDeck._id,
      user: testUser._id,
    });

    expect(collocation.srsData.interval).toBe(1);
    expect(collocation.srsData.easeFactor).toBe(2.5);
    expect(collocation.srsData.repetitions).toBe(0);
    expect(collocation.srsData.nextReview).toBeDefined();
  });
});

