import { Schema, model, Document } from "mongoose";

export interface IAnswer {
  questionIndex: number;
  questionType: string;
  collocationId: Schema.Types.ObjectId;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
}

export interface IQuizResult extends Document {
  quiz: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionIndex: {
      type: Number,
      required: true,
    },
    questionType: {
      type: String,
      required: true,
    },
    collocationId: {
      type: Schema.Types.ObjectId,
      ref: "Collocation",
      required: true,
    },
    userAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const quizResultSchema = new Schema<IQuizResult>(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    answers: {
      type: [answerSchema],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
quizResultSchema.index({ user: 1, completedAt: -1 });
quizResultSchema.index({ quiz: 1, user: 1 });
quizResultSchema.index({ user: 1, score: -1 });

const QuizResult = model<IQuizResult>("QuizResult", quizResultSchema);
export default QuizResult;

