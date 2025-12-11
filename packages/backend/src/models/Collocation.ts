import { Schema, model, Document } from "mongoose";

export enum CollocationDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export interface ICollocationComponent {
  word: string;
  meaning: string;
  partOfSpeech?: string;
}

export interface ICollocation extends Document {
  phrase: string;
  meaning: string;
  components: ICollocationComponent[];
  examples: string[];
  pronunciation?: string;
  tags: string[];
  deck: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  difficulty: CollocationDifficulty;
  srsData: {
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReview: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const collocationComponentSchema = new Schema<ICollocationComponent>(
  {
    word: {
      type: String,
      required: true,
    },
    meaning: {
      type: String,
      required: true,
    },
    partOfSpeech: {
      type: String,
    },
  },
  { _id: false }
);

const collocationSchema = new Schema<ICollocation>(
  {
    phrase: {
      type: String,
      required: [true, "Phrase is required"],
      trim: true,
      minlength: [3, "Phrase must be at least 3 characters long"],
      maxlength: [100, "Phrase cannot exceed 100 characters"],
      index: true,
    },
    meaning: {
      type: String,
      required: [true, "Meaning is required"],
      trim: true,
    },
    components: {
      type: [collocationComponentSchema],
      required: true,
      validate: {
        validator: function (v: ICollocationComponent[]) {
          return v && v.length > 0;
        },
        message: "At least one component is required",
      },
    },
    examples: {
      type: [String],
      default: [],
    },
    pronunciation: {
      type: String,
    },
    tags: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
      index: true,
    },
    deck: {
      type: Schema.Types.ObjectId,
      ref: "Deck",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(CollocationDifficulty),
      default: CollocationDifficulty.INTERMEDIATE,
      index: true,
    },
    srsData: {
      interval: { type: Number, default: 1 },
      easeFactor: { type: Number, default: 2.5 },
      repetitions: { type: Number, default: 0 },
      nextReview: { type: Date, default: () => new Date(), index: true },
    },
  },
  {
    timestamps: true,
  }
);

// === PERFORMANCE OPTIMIZED INDEXES ===

// Text search index for collocation search functionality
collocationSchema.index({ 
  phrase: "text", 
  meaning: "text", 
  examples: "text",
  tags: "text" 
}, {
  weights: {
    phrase: 10,      // Highest priority for phrase matching
    meaning: 5,      // Medium priority for meaning
    tags: 3,         // Lower priority for tags
    examples: 1      // Lowest priority for examples
  },
  name: "collocation_search_index"
});

// === COMPOUND INDEXES FOR COMMON QUERY PATTERNS ===

// 1. User-based queries (most common)
collocationSchema.index({ user: 1, deck: 1, difficulty: 1 }, { 
  name: "user_deck_difficulty_index" 
});

// 2. SRS review queries (critical for performance)
collocationSchema.index({ 
  user: 1, 
  "srsData.nextReview": 1, 
  deck: 1 
}, { 
  name: "srs_review_index" 
});

// 3. Deck browsing with filtering
collocationSchema.index({ 
  deck: 1, 
  difficulty: 1, 
  tags: 1 
}, { 
  name: "deck_filter_index" 
});

// 4. Admin/crawler queries for data management
collocationSchema.index({ 
  phrase: 1, 
  deck: 1 
}, { 
  unique: true,  // Prevent duplicate phrases in same deck
  name: "unique_phrase_per_deck" 
});

// 5. Category-based queries (for collocation browsing)
collocationSchema.index({ 
  tags: 1, 
  difficulty: 1, 
  createdAt: -1 
}, { 
  name: "category_browse_index" 
});

// 6. Performance monitoring queries
collocationSchema.index({ 
  createdAt: -1, 
  user: 1 
}, { 
  name: "creation_tracking_index" 
});

// 7. Sparse index for pronunciation URLs (only indexed if exists)
collocationSchema.index({ 
  pronunciation: 1 
}, { 
  sparse: true,
  name: "pronunciation_sparse_index" 
});

const Collocation = model<ICollocation>("Collocation", collocationSchema);
export default Collocation;

