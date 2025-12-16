import { ICollocation } from "../models/Collocation";
import { QuestionType } from "../models/Quiz";

export interface QuizQuestion {
  questionIndex: number;
  questionType: QuestionType;
  collocationId: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  phrase?: string;
}

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generate a multiple choice question about the collocation's meaning
 */
export function generateDefinitionChoice(
  collocation: ICollocation,
  allCollocations: ICollocation[],
  questionIndex: number
): QuizQuestion {
  // Get random wrong answers from other collocations
  const otherCollocations = allCollocations.filter(
    (c) => c._id.toString() !== collocation._id.toString()
  );
  let wrongAnswers = getRandomItems(otherCollocations, 3).map((c) => c.meaning);

  // If we don't have enough wrong answers, add some generic ones
  const fallbackAnswers = [
    "làm việc chăm chỉ",
    "nói chuyện",
    "ăn cơm",
    "đi học",
    "chơi game",
    "xem phim",
    "nghe nhạc"
  ];

  while (wrongAnswers.length < 3) {
    const fallback = fallbackAnswers[wrongAnswers.length % fallbackAnswers.length];
    if (!wrongAnswers.includes(fallback) && fallback !== collocation.meaning) {
      wrongAnswers.push(fallback);
    }
  }

  // Ensure exactly 3 wrong answers
  wrongAnswers = wrongAnswers.slice(0, 3);

  // Combine correct and wrong answers, then shuffle
  const options = shuffleArray([collocation.meaning, ...wrongAnswers]);

  return {
    questionIndex,
    questionType: QuestionType.DEFINITION_CHOICE,
    collocationId: collocation._id.toString(),
    question: `What does "${collocation.phrase}" mean?`,
    options,
    correctAnswer: collocation.meaning,
    phrase: collocation.phrase,
  };
}

/**
 * Generate a fill-in-the-blank question
 */
export function generateFillBlank(
  collocation: ICollocation,
  questionIndex: number
): QuizQuestion {
  // Find the most important word to blank out (usually a verb or noun)
  const words = collocation.phrase.split(" ");
  
  // Prefer to blank out verbs or nouns from components
  let blankWordIndex = 0;
  const verbComponent = collocation.components.find(
    (c) => c.partOfSpeech?.toLowerCase().includes("verb")
  );
  
  if (verbComponent) {
    blankWordIndex = words.findIndex(
      (w) => w.toLowerCase() === verbComponent.word.toLowerCase()
    );
  }
  
  // If no verb found, blank out the first word
  if (blankWordIndex === -1) {
    blankWordIndex = 0;
  }

  const correctWord = words[blankWordIndex];
  const blankedPhrase = words
    .map((word, index) => (index === blankWordIndex ? "______" : word))
    .join(" ");

  return {
    questionIndex,
    questionType: QuestionType.FILL_BLANK,
    collocationId: collocation._id.toString(),
    question: `Fill in the blank: ${blankedPhrase}`,
    correctAnswer: correctWord.toLowerCase(),
    phrase: collocation.phrase,
  };
}

/**
 * Generate a matching pairs question
 */
export function generateMatchPairs(
  collocations: ICollocation[],
  questionIndex: number,
  pairCount: number = 4
): QuizQuestion {
  // Select random collocations for matching
  const selectedCollocations = getRandomItems(collocations, pairCount);

  const phrases = selectedCollocations.map((c) => c.phrase);
  const meanings = shuffleArray(selectedCollocations.map((c) => c.meaning));

  // Create the correct answer mapping
  const correctPairs = selectedCollocations.map((c, index) => ({
    phrase: c.phrase,
    meaning: c.meaning,
  }));

  return {
    questionIndex,
    questionType: QuestionType.MATCH_PAIRS,
    collocationId: selectedCollocations[0]._id.toString(),
    question: "Match each collocation with its correct meaning:",
    options: [...phrases, ...meanings],
    correctAnswer: JSON.stringify(correctPairs),
    phrase: "Multiple collocations",
  };
}

/**
 * Generate a complete quiz with mixed question types
 */
export function generateQuiz(
  collocations: ICollocation[],
  questionTypes: QuestionType[],
  questionCount: number
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  // Ensure we have enough collocations
  if (collocations.length === 0) {
    throw new Error("No collocations available for quiz generation");
  }

  // Select random collocations for the quiz
  const selectedCollocations = getRandomItems(collocations, questionCount);

  for (let i = 0; i < questionCount; i++) {
    // Randomly select a question type from available types
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const collocation = selectedCollocations[i % selectedCollocations.length];

    let question: QuizQuestion;

    switch (questionType) {
      case QuestionType.DEFINITION_CHOICE:
        question = generateDefinitionChoice(collocation, collocations, i);
        break;
      case QuestionType.FILL_BLANK:
        question = generateFillBlank(collocation, i);
        break;
      case QuestionType.MATCH_PAIRS:
        // For match pairs, use multiple collocations
        question = generateMatchPairs(
          selectedCollocations.slice(Math.max(0, i - 2), i + 2),
          i
        );
        break;
      default:
        question = generateDefinitionChoice(collocation, collocations, i);
    }

    questions.push(question);
  }

  return questions;
}

