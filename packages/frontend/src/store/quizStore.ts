import { create } from "zustand";

interface QuizQuestion {
  questionIndex: number;
  questionType: string;
  collocationId: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  phrase?: string;
}

interface QuizAnswer {
  questionIndex: number;
  questionType: string;
  collocationId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
}

interface QuizState {
  currentQuiz: {
    quizId: string;
    title: string;
    description: string;
    questionCount: number;
    timeLimit?: number;
    questions: QuizQuestion[];
  } | null;
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  startTime: number | null;
  timeElapsed: number;
  isSubmitted: boolean;

  // Actions
  setQuiz: (quiz: QuizState["currentQuiz"]) => void;
  startQuiz: () => void;
  answerQuestion: (answer: QuizAnswer) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  updateTimeElapsed: (time: number) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentQuiz: null,
  currentQuestionIndex: 0,
  answers: [],
  startTime: null,
  timeElapsed: 0,
  isSubmitted: false,

  setQuiz: (quiz) =>
    set({
      currentQuiz: quiz,
      currentQuestionIndex: 0,
      answers: [],
      startTime: null,
      timeElapsed: 0,
      isSubmitted: false,
    }),

  startQuiz: () =>
    set({
      startTime: Date.now(),
      timeElapsed: 0,
    }),

  answerQuestion: (answer) => {
    const { answers, currentQuestionIndex } = get();
    const existingAnswerIndex = answers.findIndex(
      (a) => a.questionIndex === currentQuestionIndex
    );

    let newAnswers;
    if (existingAnswerIndex >= 0) {
      // Update existing answer
      newAnswers = [...answers];
      newAnswers[existingAnswerIndex] = answer;
    } else {
      // Add new answer
      newAnswers = [...answers, answer];
    }

    set({ answers: newAnswers });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentQuiz } = get();
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  submitQuiz: () =>
    set({
      isSubmitted: true,
    }),

  resetQuiz: () =>
    set({
      currentQuiz: null,
      currentQuestionIndex: 0,
      answers: [],
      startTime: null,
      timeElapsed: 0,
      isSubmitted: false,
    }),

  updateTimeElapsed: (time) =>
    set({
      timeElapsed: time,
    }),
}));

