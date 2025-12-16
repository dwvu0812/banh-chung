import mongoose from "mongoose";
import Quiz, { QuestionType, QuizDifficulty } from "../../models/Quiz";
import User, { UserRole } from "../../models/User";
import Deck from "../../models/Deck";
import Collocation from "../../models/Collocation";

describe("Quiz Model", () => {
  let testUser: any;
  let testDeck: any;
  let testCollocations: any[];

  beforeEach(async () => {
    testUser = await User.create({
      username: "testuser",
      email: "test@example.com",
      passwordHash: "hashedpassword",
      role: UserRole.SUPER_ADMIN,
    });

    testDeck = await Deck.create({
      name: "Test Deck",
      description: "Test Description",
      user: testUser._id,
    });

    testCollocations = await Collocation.create([
      {
        phrase: "make a decision",
        meaning: "đưa ra quyết định",
        components: [{ word: "make", meaning: "làm" }],
        deck: testDeck._id,
        user: testUser._id,
      },
      {
        phrase: "take a break",
        meaning: "nghỉ ngơi",
        components: [{ word: "take", meaning: "lấy" }],
        deck: testDeck._id,
        user: testUser._id,
      },
    ]);
  });

  afterEach(async () => {
    await Quiz.deleteMany({});
    await Collocation.deleteMany({});
    await Deck.deleteMany({});
    await User.deleteMany({});
  });

  it("should create a valid quiz", async () => {
    const quiz = await Quiz.create({
      title: "Test Quiz",
      description: "Test Description",
      deck: testDeck._id,
      collocationIds: testCollocations.map((c) => c._id),
      questionCount: 5,
      questionTypes: [QuestionType.DEFINITION_CHOICE, QuestionType.FILL_BLANK],
      difficulty: QuizDifficulty.INTERMEDIATE,
      createdBy: testUser._id,
    });

    expect(quiz.title).toBe("Test Quiz");
    expect(quiz.questionCount).toBe(5);
    expect(quiz.questionTypes).toHaveLength(2);
    expect(quiz.isActive).toBe(true);
  });

  it("should require title and deck", async () => {
    try {
      await Quiz.create({
        collocationIds: testCollocations.map((c) => c._id),
        questionCount: 5,
        questionTypes: [QuestionType.DEFINITION_CHOICE],
        createdBy: testUser._id,
      });
      fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.name).toBe("ValidationError");
    }
  });

  it("should require at least one collocation", async () => {
    try {
      await Quiz.create({
        title: "Test Quiz",
        deck: testDeck._id,
        collocationIds: [],
        questionCount: 5,
        questionTypes: [QuestionType.DEFINITION_CHOICE],
        createdBy: testUser._id,
      });
      fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.name).toBe("ValidationError");
    }
  });

  it("should have default difficulty as mixed", async () => {
    const quiz = await Quiz.create({
      title: "Test Quiz",
      deck: testDeck._id,
      collocationIds: testCollocations.map((c) => c._id),
      questionCount: 5,
      questionTypes: [QuestionType.DEFINITION_CHOICE],
      createdBy: testUser._id,
    });

    expect(quiz.difficulty).toBe(QuizDifficulty.MIXED);
  });

  it("should validate question count range", async () => {
    try {
      await Quiz.create({
        title: "Test Quiz",
        deck: testDeck._id,
        collocationIds: testCollocations.map((c) => c._id),
        questionCount: 100, // Exceeds max of 50
        questionTypes: [QuestionType.DEFINITION_CHOICE],
        createdBy: testUser._id,
      });
      fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.name).toBe("ValidationError");
    }
  });
});

