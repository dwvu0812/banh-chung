import { generateDefinitionChoice, generateFillBlank, generateQuiz } from "../../lib/quizGenerator";
import { QuestionType } from "../../models/Quiz";

describe("Quiz Generator", () => {
  const mockCollocations = [
    {
      _id: "1",
      phrase: "make a decision",
      meaning: "đưa ra quyết định",
      components: [
        { word: "make", meaning: "làm", partOfSpeech: "verb" },
        { word: "decision", meaning: "quyết định", partOfSpeech: "noun" },
      ],
      examples: ["We need to make a decision."],
      tags: ["make"],
      difficulty: "beginner",
    },
    {
      _id: "2",
      phrase: "take a break",
      meaning: "nghỉ ngơi",
      components: [
        { word: "take", meaning: "lấy", partOfSpeech: "verb" },
        { word: "break", meaning: "nghỉ", partOfSpeech: "noun" },
      ],
      examples: ["Let's take a break."],
      tags: ["take"],
      difficulty: "beginner",
    },
    {
      _id: "3",
      phrase: "pay attention",
      meaning: "chú ý",
      components: [
        { word: "pay", meaning: "trả", partOfSpeech: "verb" },
        { word: "attention", meaning: "sự chú ý", partOfSpeech: "noun" },
      ],
      examples: ["Please pay attention."],
      tags: ["pay"],
      difficulty: "beginner",
    },
  ] as any;

  describe("generateDefinitionChoice", () => {
    it("should generate a multiple choice question", () => {
      const question = generateDefinitionChoice(mockCollocations[0], mockCollocations, 0);

      expect(question.questionType).toBe(QuestionType.DEFINITION_CHOICE);
      expect(question.question).toContain("make a decision");
      expect(question.options).toHaveLength(4);
      expect(question.options).toContain("đưa ra quyết định");
      expect(question.correctAnswer).toBe("đưa ra quyết định");
    });

    it("should include the correct answer in options", () => {
      const question = generateDefinitionChoice(mockCollocations[0], mockCollocations, 0);
      expect(question.options).toContain(question.correctAnswer);
    });
  });

  describe("generateFillBlank", () => {
    it("should generate a fill-in-the-blank question", () => {
      const question = generateFillBlank(mockCollocations[0], 0);

      expect(question.questionType).toBe(QuestionType.FILL_BLANK);
      expect(question.question).toContain("______");
      expect(question.correctAnswer).toBeDefined();
      expect(typeof question.correctAnswer).toBe("string");
    });

    it("should blank out a word from the phrase", () => {
      const question = generateFillBlank(mockCollocations[0], 0);
      const blankedPhrase = question.question.replace("Fill in the blank: ", "");
      
      expect(blankedPhrase).toContain("______");
      expect(blankedPhrase.split(" ").length).toBe(mockCollocations[0].phrase.split(" ").length);
    });
  });

  describe("generateQuiz", () => {
    it("should generate a quiz with specified number of questions", () => {
      const questions = generateQuiz(
        mockCollocations,
        [QuestionType.DEFINITION_CHOICE],
        3
      );

      expect(questions).toHaveLength(3);
    });

    it("should generate questions of specified types", () => {
      const questions = generateQuiz(
        mockCollocations,
        [QuestionType.DEFINITION_CHOICE, QuestionType.FILL_BLANK],
        5
      );

      const types = questions.map((q) => q.questionType);
      types.forEach((type) => {
        expect([QuestionType.DEFINITION_CHOICE, QuestionType.FILL_BLANK]).toContain(type);
      });
    });

    it("should throw error if no collocations provided", () => {
      expect(() => {
        generateQuiz([], [QuestionType.DEFINITION_CHOICE], 5);
      }).toThrow("No collocations available");
    });

    it("should assign correct question indices", () => {
      const questions = generateQuiz(mockCollocations, [QuestionType.DEFINITION_CHOICE], 3);

      questions.forEach((question, index) => {
        expect(question.questionIndex).toBe(index);
      });
    });
  });
});

