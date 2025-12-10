import { Schema, model, Document } from "mongoose";

export enum QuestionType {
  DEFINITION_CHOICE = "definition_choice",
  FILL_BLANK = "fill_blank",
  MATCH_PAIRS = "match_pairs",
}

export enum QuizDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  MIXED = "mixed",
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  deck: Schema.Types.ObjectId;
  collocationIds: Schema.Types.ObjectId[];
  questionCount: number;
  questionTypes: QuestionType[];
  difficulty: QuizDifficulty;
  timeLimit?: number;
  createdBy: Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    deck: {
      type: Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
      index: true,
    },
    collocationIds: {
      type: [Schema.Types.ObjectId],
      ref: "Collocation",
      required: true,
      validate: {
        validator: function (v: Schema.Types.ObjectId[]) {
          return v && v.length > 0;
        },
        message: "At least one collocation is required",
      },
    },
    questionCount: {
      type: Number,
      required: true,
      min: [1, "Question count must be at least 1"],
      max: [50, "Question count cannot exceed 50"],
    },
    questionTypes: {
      type: [String],
      enum: Object.values(QuestionType),
      required: true,
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: "At least one question type is required",
      },
    },
    difficulty: {
      type: String,
      enum: Object.values(QuizDifficulty),
      default: QuizDifficulty.MIXED,
      index: true,
    },
    timeLimit: {
      type: Number,
      min: [60, "Time limit must be at least 60 seconds"],
      max: [3600, "Time limit cannot exceed 3600 seconds (1 hour)"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
quizSchema.index({ deck: 1, isActive: 1 });
quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ difficulty: 1, isActive: 1 });

const Quiz = model<IQuiz>("Quiz", quizSchema);
export default Quiz;

