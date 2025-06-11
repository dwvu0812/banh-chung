import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User";
import Deck from "../models/Deck";
import Flashcard from "../models/Flashcard";

// Sample users with hashed passwords
export const sampleUsers = [
  {
    username: "john_doe",
    email: "john@example.com",
    password: "password123", // Will be hashed
    learningSettings: {
      dailyTarget: 25,
      voiceSpeed: 1.0,
    },
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "password123",
    learningSettings: {
      dailyTarget: 30,
      voiceSpeed: 0.8,
    },
  },
  {
    username: "alex_wilson",
    email: "alex@example.com",
    password: "password123",
    learningSettings: {
      dailyTarget: 20,
      voiceSpeed: 1.2,
    },
  },
  {
    username: "maria_garcia",
    email: "maria@example.com",
    password: "password123",
    learningSettings: {
      dailyTarget: 35,
      voiceSpeed: 0.9,
    },
  },
];

// Sample decks with English-Vietnamese content
export const sampleDecks = [
  {
    name: "Essential English Vocabulary",
    description: "Từ vựng tiếng Anh cơ bản cho giao tiếp hàng ngày",
    userIndex: 0, // john_doe
  },
  {
    name: "Business English",
    description: "Từ vựng tiếng Anh thương mại và công việc",
    userIndex: 0, // john_doe
  },
  {
    name: "IELTS Vocabulary",
    description: "Từ vựng tiếng Anh cho kỳ thi IELTS",
    userIndex: 1, // jane_smith
  },
  {
    name: "Travel English",
    description: "Từ vựng tiếng Anh cho du lịch và khách sạn",
    userIndex: 1, // jane_smith
  },
  {
    name: "Academic English",
    description: "Từ vựng tiếng Anh học thuật và giáo dục",
    userIndex: 2, // alex_wilson
  },
  {
    name: "Technology Terms",
    description: "Thuật ngữ công nghệ thông tin bằng tiếng Anh",
    userIndex: 2, // alex_wilson
  },
  {
    name: "Medical English",
    description: "Thuật ngữ y tế bằng tiếng Anh",
    userIndex: 3, // maria_garcia
  },
  {
    name: "Food & Cooking",
    description: "Từ vựng tiếng Anh về ẩm thực và nấu ăn",
    userIndex: 3, // maria_garcia
  },
];

// Sample flashcards with varied content
export const sampleFlashcards = [
  // Essential English Vocabulary (Deck 0)
  {
    word: "Serendipity",
    definition:
      "The occurrence and development of events by chance in a happy or beneficial way",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/serendipity--_us_1.mp3",
    examples: [
      "Meeting my best friend was pure serendipity.",
      "The discovery was a happy serendipity.",
    ],
    deckIndex: 0,
    userIndex: 0,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
  },
  {
    word: "Ubiquitous",
    definition: "Present, appearing, or found everywhere",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/ubiquitous--_us_1.mp3",
    examples: [
      "Smartphones have become ubiquitous in modern society.",
      "The ubiquitous presence of social media affects daily life.",
    ],
    deckIndex: 0,
    userIndex: 0,
    srsData: {
      interval: 3,
      easeFactor: 2.6,
      repetitions: 2,
      nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },
  {
    word: "Ephemeral",
    definition: "Lasting for a very short time",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/ephemeral--_us_1.mp3",
    examples: [
      "The beauty of cherry blossoms is ephemeral.",
      "Social media posts often have an ephemeral nature.",
    ],
    deckIndex: 0,
    userIndex: 0,
    srsData: {
      interval: 6,
      easeFactor: 2.4,
      repetitions: 1,
      nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  },

  // Business English (Deck 1)
  {
    word: "Synergy",
    definition:
      "The interaction of elements that when combined produce a total effect greater than the sum of individual elements",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/synergy--_us_1.mp3",
    examples: [
      "The merger created synergy between the two companies.",
      "We need to find synergy between our marketing and sales teams.",
    ],
    deckIndex: 1,
    userIndex: 0,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
  },
  {
    word: "Leverage",
    definition: "Use something to maximum advantage",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/leverage--_us_1.mp3",
    examples: [
      "We can leverage our existing customer base for this new product.",
      "The company leveraged technology to improve efficiency.",
    ],
    deckIndex: 1,
    userIndex: 0,
    srsData: {
      interval: 2,
      easeFactor: 2.7,
      repetitions: 1,
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  },

  // Spanish Basics (Deck 2)
  {
    word: "Hola",
    definition: "Hello (informal greeting)",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/hola--_es_1.mp3",
    examples: ["¡Hola! ¿Cómo estás?", "Hola, me llamo María."],
    deckIndex: 2,
    userIndex: 1,
    srsData: {
      interval: 15,
      easeFactor: 2.8,
      repetitions: 4,
      nextReview: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  },
  {
    word: "Gracias",
    definition: "Thank you",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/gracias--_es_1.mp3",
    examples: ["Gracias por tu ayuda.", "¡Muchas gracias!"],
    deckIndex: 2,
    userIndex: 1,
    srsData: {
      interval: 8,
      easeFactor: 2.9,
      repetitions: 3,
      nextReview: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },
  },

  // French Cuisine Terms (Deck 3)
  {
    word: "Mise en place",
    definition:
      "Everything in its place - the preparation and organization of ingredients before cooking",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/mise_en_place--_fr_1.mp3",
    examples: [
      "Good mise en place is essential for efficient cooking.",
      "The chef emphasized the importance of mise en place.",
    ],
    deckIndex: 3,
    userIndex: 1,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
  },
  {
    word: "Sauté",
    definition: "To cook quickly in a small amount of fat over high heat",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/saute--_fr_1.mp3",
    examples: [
      "Sauté the onions until they're golden brown.",
      "The vegetables were perfectly sautéed.",
    ],
    deckIndex: 3,
    userIndex: 1,
    srsData: {
      interval: 4,
      easeFactor: 2.6,
      repetitions: 2,
      nextReview: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  },

  // Japanese Hiragana (Deck 4)
  {
    word: "あ (a)",
    definition:
      "The first character of the Japanese hiragana syllabary, pronounced 'ah'",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/a--_ja_1.mp3",
    examples: ["あさ (asa) means morning", "あか (aka) means red"],
    deckIndex: 4,
    userIndex: 2,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
  },
  {
    word: "か (ka)",
    definition: "A hiragana character pronounced 'kah'",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/ka--_ja_1.mp3",
    examples: ["かみ (kami) means paper or god", "かわ (kawa) means river"],
    deckIndex: 4,
    userIndex: 2,
    srsData: {
      interval: 2,
      easeFactor: 2.6,
      repetitions: 1,
      nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  },
  {
    word: "さ (sa)",
    definition: "A hiragana character pronounced 'sah'",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/sa--_ja_1.mp3",
    examples: [
      "さくら (sakura) means cherry blossom",
      "さかな (sakana) means fish",
    ],
    deckIndex: 4,
    userIndex: 2,
    srsData: {
      interval: 6,
      easeFactor: 2.4,
      repetitions: 1,
      nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  },

  // German Grammar (Deck 5)
  {
    word: "Der, Die, Das",
    definition:
      "German definite articles (the) - Der (masculine), Die (feminine), Das (neuter)",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/der--_de_1.mp3",
    examples: [
      "Der Mann (the man) - masculine",
      "Die Frau (the woman) - feminine",
      "Das Kind (the child) - neuter",
    ],
    deckIndex: 5,
    userIndex: 2,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
  },
  {
    word: "Akkusativ",
    definition: "The accusative case in German, used for direct objects",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/akkusativ--_de_1.mp3",
    examples: [
      "Ich sehe den Mann (I see the man) - 'den Mann' is accusative",
      "Sie kauft das Buch (She buys the book) - 'das Buch' is accusative",
    ],
    deckIndex: 5,
    userIndex: 2,
    srsData: {
      interval: 3,
      easeFactor: 2.3,
      repetitions: 2,
      nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },

  // Medical Terminology (Deck 6)
  {
    word: "Hypertension",
    definition:
      "High blood pressure - a condition where blood pressure is consistently elevated",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/hypertension--_us_1.mp3",
    examples: [
      "The patient was diagnosed with hypertension.",
      "Hypertension is often called the 'silent killer'.",
    ],
    deckIndex: 6,
    userIndex: 3,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
  },
  {
    word: "Tachycardia",
    definition:
      "Rapid heart rate, typically over 100 beats per minute in adults",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/tachycardia--_us_1.mp3",
    examples: [
      "The patient presented with tachycardia after exercise.",
      "Tachycardia can be caused by various factors including stress and caffeine.",
    ],
    deckIndex: 6,
    userIndex: 3,
    srsData: {
      interval: 5,
      easeFactor: 2.7,
      repetitions: 2,
      nextReview: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },

  // Programming Concepts (Deck 7)
  {
    word: "Algorithm",
    definition:
      "A step-by-step procedure for solving a problem or completing a task",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/algorithm--_us_1.mp3",
    examples: [
      "The sorting algorithm efficiently organizes the data.",
      "We need to optimize this algorithm for better performance.",
    ],
    deckIndex: 7,
    userIndex: 3,
    srsData: {
      interval: 10,
      easeFactor: 2.8,
      repetitions: 3,
      nextReview: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  },
  {
    word: "Recursion",
    definition:
      "A programming technique where a function calls itself to solve smaller instances of the same problem",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/recursion--_us_1.mp3",
    examples: [
      "The factorial function is a classic example of recursion.",
      "Recursion can be elegant but may cause stack overflow if not handled properly.",
    ],
    deckIndex: 7,
    userIndex: 3,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
  },
];
