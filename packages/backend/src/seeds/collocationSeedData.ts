// High-frequency English collocations with Vietnamese translations
// Data curated based on Oxford Collocations Dictionary and Cambridge English Corpus

export const collocationDecks = [
  {
    name: "Essential English Collocations",
    description: "Các cụm từ tiếng Anh thiết yếu cho giao tiếp hàng ngày",
    userIndex: 0,
  },
  {
    name: "Business English Collocations",
    description: "Cụm từ tiếng Anh thương mại và công việc",
    userIndex: 0,
  },
  {
    name: "Academic English Collocations",
    description: "Cụm từ tiếng Anh học thuật",
    userIndex: 0,
  },
];

export const sampleCollocations = [
  // Essential English Collocations - Deck 0
  {
    phrase: "make a decision",
    meaning: "đưa ra quyết định",
    components: [
      { word: "make", meaning: "làm, tạo ra", partOfSpeech: "verb" },
      { word: "decision", meaning: "quyết định", partOfSpeech: "noun" },
    ],
    examples: [
      "We need to make a decision about the project by Friday.",
      "It's difficult to make a decision without all the information.",
    ],
    tags: ["make", "decision", "essential"],
    difficulty: "beginner",
    deckIndex: 0,
    userIndex: 0,
  },
  {
    phrase: "take a break",
    meaning: "nghỉ ngơi, nghỉ giải lao",
    components: [
      { word: "take", meaning: "lấy, nhận", partOfSpeech: "verb" },
      { word: "break", meaning: "giờ nghỉ", partOfSpeech: "noun" },
    ],
    examples: [
      "Let's take a break for 15 minutes.",
      "You should take a break from studying every hour.",
    ],
    tags: ["take", "break", "essential"],
    difficulty: "beginner",
    deckIndex: 0,
    userIndex: 0,
  },
  {
    phrase: "make progress",
    meaning: "tiến bộ, đạt được tiến triển",
    components: [
      { word: "make", meaning: "làm, tạo ra", partOfSpeech: "verb" },
      { word: "progress", meaning: "sự tiến bộ", partOfSpeech: "noun" },
    ],
    examples: [
      "She's making good progress in learning English.",
      "We've made significant progress on the project.",
    ],
    tags: ["make", "progress", "essential"],
    difficulty: "beginner",
    deckIndex: 0,
    userIndex: 0,
  },
  {
    phrase: "do homework",
    meaning: "làm bài tập về nhà",
    components: [
      { word: "do", meaning: "làm", partOfSpeech: "verb" },
      { word: "homework", meaning: "bài tập về nhà", partOfSpeech: "noun" },
    ],
    examples: [
      "I need to do my homework before dinner.",
      "Did you do your homework last night?",
    ],
    tags: ["do", "homework", "essential", "education"],
    difficulty: "beginner",
    deckIndex: 0,
    userIndex: 0,
  },
  {
    phrase: "have a chat",
    meaning: "trò chuyện, nói chuyện",
    components: [
      { word: "have", meaning: "có", partOfSpeech: "verb" },
      { word: "chat", meaning: "cuộc trò chuyện", partOfSpeech: "noun" },
    ],
    examples: [
      "Let's have a chat over coffee.",
      "I had a nice chat with my neighbor this morning.",
    ],
    tags: ["have", "chat", "essential", "conversation"],
    difficulty: "beginner",
    deckIndex: 0,
    userIndex: 0,
  },
  {
    phrase: "catch up with",
    meaning: "bắt kịp, gặp gỡ để cập nhật tin tức",
    components: [
      { word: "catch up", meaning: "bắt kịp", partOfSpeech: "phrasal verb" },
      { word: "with", meaning: "với", partOfSpeech: "preposition" },
    ],
    examples: [
      "I need to catch up with my work after vacation.",
      "Let's catch up with each other next week.",
    ],
    tags: ["catch", "phrasal-verb", "essential"],
    difficulty: "intermediate",
    deckIndex: 0,
    userIndex: 0,
  },
  {
    phrase: "look forward to",
    meaning: "mong chờ, trông đợi",
    components: [
      { word: "look forward", meaning: "nhìn về phía trước", partOfSpeech: "phrasal verb" },
      { word: "to", meaning: "đến", partOfSpeech: "preposition" },
    ],
    examples: [
      "I'm looking forward to seeing you again.",
      "We look forward to hearing from you soon.",
    ],
    tags: ["look", "phrasal-verb", "essential"],
    difficulty: "intermediate",
    deckIndex: 0,
    userIndex: 0,
  },
  {
    phrase: "pay attention",
    meaning: "chú ý, tập trung",
    components: [
      { word: "pay", meaning: "trả, dành", partOfSpeech: "verb" },
      { word: "attention", meaning: "sự chú ý", partOfSpeech: "noun" },
    ],
    examples: [
      "Please pay attention to the instructions.",
      "Students should pay attention in class.",
    ],
    tags: ["pay", "attention", "essential"],
    difficulty: "beginner",
    deckIndex: 0,
    userIndex: 0,
  },

  // Business English Collocations - Deck 1
  {
    phrase: "reach an agreement",
    meaning: "đạt được thỏa thuận",
    components: [
      { word: "reach", meaning: "đạt được", partOfSpeech: "verb" },
      { word: "agreement", meaning: "thỏa thuận", partOfSpeech: "noun" },
    ],
    examples: [
      "The two companies reached an agreement after months of negotiation.",
      "We need to reach an agreement before the deadline.",
    ],
    tags: ["reach", "agreement", "business", "negotiation"],
    difficulty: "intermediate",
    deckIndex: 1,
    userIndex: 0,
  },
  {
    phrase: "meet a deadline",
    meaning: "hoàn thành đúng hạn",
    components: [
      { word: "meet", meaning: "đáp ứng, hoàn thành", partOfSpeech: "verb" },
      { word: "deadline", meaning: "hạn chót", partOfSpeech: "noun" },
    ],
    examples: [
      "We worked overtime to meet the deadline.",
      "It's important to meet all project deadlines.",
    ],
    tags: ["meet", "deadline", "business", "time-management"],
    difficulty: "intermediate",
    deckIndex: 1,
    userIndex: 0,
  },
  {
    phrase: "close a deal",
    meaning: "chốt giao dịch, ký kết hợp đồng",
    components: [
      { word: "close", meaning: "đóng, kết thúc", partOfSpeech: "verb" },
      { word: "deal", meaning: "giao dịch", partOfSpeech: "noun" },
    ],
    examples: [
      "The sales team closed a major deal yesterday.",
      "He's excellent at closing deals with clients.",
    ],
    tags: ["close", "deal", "business", "sales"],
    difficulty: "intermediate",
    deckIndex: 1,
    userIndex: 0,
  },
  {
    phrase: "hold a meeting",
    meaning: "tổ chức cuộc họp",
    components: [
      { word: "hold", meaning: "tổ chức, giữ", partOfSpeech: "verb" },
      { word: "meeting", meaning: "cuộc họp", partOfSpeech: "noun" },
    ],
    examples: [
      "We'll hold a meeting next Monday at 10 AM.",
      "The board holds meetings quarterly.",
    ],
    tags: ["hold", "meeting", "business"],
    difficulty: "beginner",
    deckIndex: 1,
    userIndex: 0,
  },
  {
    phrase: "boost productivity",
    meaning: "tăng năng suất",
    components: [
      { word: "boost", meaning: "thúc đẩy, tăng cường", partOfSpeech: "verb" },
      { word: "productivity", meaning: "năng suất", partOfSpeech: "noun" },
    ],
    examples: [
      "The new software helped boost productivity by 30%.",
      "Regular breaks can boost productivity at work.",
    ],
    tags: ["boost", "productivity", "business"],
    difficulty: "intermediate",
    deckIndex: 1,
    userIndex: 0,
  },
  {
    phrase: "cut costs",
    meaning: "cắt giảm chi phí",
    components: [
      { word: "cut", meaning: "cắt giảm", partOfSpeech: "verb" },
      { word: "costs", meaning: "chi phí", partOfSpeech: "noun" },
    ],
    examples: [
      "The company needs to cut costs to remain competitive.",
      "We're looking for ways to cut costs without reducing quality.",
    ],
    tags: ["cut", "costs", "business", "finance"],
    difficulty: "intermediate",
    deckIndex: 1,
    userIndex: 0,
  },

  // Academic English Collocations - Deck 2
  {
    phrase: "conduct research",
    meaning: "tiến hành nghiên cứu",
    components: [
      { word: "conduct", meaning: "tiến hành, thực hiện", partOfSpeech: "verb" },
      { word: "research", meaning: "nghiên cứu", partOfSpeech: "noun" },
    ],
    examples: [
      "The university conducts research in various fields.",
      "Scientists are conducting research on climate change.",
    ],
    tags: ["conduct", "research", "academic"],
    difficulty: "intermediate",
    deckIndex: 2,
    userIndex: 0,
  },
  {
    phrase: "draw conclusions",
    meaning: "rút ra kết luận",
    components: [
      { word: "draw", meaning: "rút ra", partOfSpeech: "verb" },
      { word: "conclusions", meaning: "kết luận", partOfSpeech: "noun" },
    ],
    examples: [
      "Based on the data, we can draw several conclusions.",
      "It's too early to draw conclusions from these results.",
    ],
    tags: ["draw", "conclusions", "academic"],
    difficulty: "intermediate",
    deckIndex: 2,
    userIndex: 0,
  },
  {
    phrase: "gather evidence",
    meaning: "thu thập bằng chứng",
    components: [
      { word: "gather", meaning: "thu thập", partOfSpeech: "verb" },
      { word: "evidence", meaning: "bằng chứng", partOfSpeech: "noun" },
    ],
    examples: [
      "Researchers gathered evidence to support their hypothesis.",
      "We need to gather more evidence before publishing.",
    ],
    tags: ["gather", "evidence", "academic"],
    difficulty: "intermediate",
    deckIndex: 2,
    userIndex: 0,
  },
  {
    phrase: "analyze data",
    meaning: "phân tích dữ liệu",
    components: [
      { word: "analyze", meaning: "phân tích", partOfSpeech: "verb" },
      { word: "data", meaning: "dữ liệu", partOfSpeech: "noun" },
    ],
    examples: [
      "The team spent weeks analyzing the data.",
      "We use statistical software to analyze data efficiently.",
    ],
    tags: ["analyze", "data", "academic"],
    difficulty: "intermediate",
    deckIndex: 2,
    userIndex: 0,
  },
  {
    phrase: "formulate a hypothesis",
    meaning: "đưa ra giả thuyết",
    components: [
      { word: "formulate", meaning: "hình thành, đưa ra", partOfSpeech: "verb" },
      { word: "hypothesis", meaning: "giả thuyết", partOfSpeech: "noun" },
    ],
    examples: [
      "Scientists formulate hypotheses based on observations.",
      "The first step is to formulate a clear hypothesis.",
    ],
    tags: ["formulate", "hypothesis", "academic"],
    difficulty: "advanced",
    deckIndex: 2,
    userIndex: 0,
  },
  {
    phrase: "cite sources",
    meaning: "trích dẫn nguồn",
    components: [
      { word: "cite", meaning: "trích dẫn", partOfSpeech: "verb" },
      { word: "sources", meaning: "nguồn", partOfSpeech: "noun" },
    ],
    examples: [
      "Always cite your sources in academic writing.",
      "The paper fails to cite important sources.",
    ],
    tags: ["cite", "sources", "academic", "writing"],
    difficulty: "intermediate",
    deckIndex: 2,
    userIndex: 0,
  },
];

