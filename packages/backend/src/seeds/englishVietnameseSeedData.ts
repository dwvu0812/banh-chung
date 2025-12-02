// Sample users with hashed passwords
export const sampleUsers = [
  {
    username: "nguyen_van_a",
    email: "nguyenvana@example.com",
    password: "password123", // Will be hashed
    learningSettings: {
      dailyTarget: 25,
      voiceSpeed: 1.0,
    },
  },
  {
    username: "tran_thi_b",
    email: "tranthib@example.com",
    password: "password123",
    learningSettings: {
      dailyTarget: 30,
      voiceSpeed: 0.8,
    },
  },
  {
    username: "le_minh_c",
    email: "leminhc@example.com",
    password: "password123",
    learningSettings: {
      dailyTarget: 20,
      voiceSpeed: 1.2,
    },
  },
  {
    username: "pham_thu_d",
    email: "phamthud@example.com",
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
    userIndex: 0, // nguyen_van_a
  },
  {
    name: "Business English",
    description: "Từ vựng tiếng Anh thương mại và công việc",
    userIndex: 0, // nguyen_van_a
  },
  {
    name: "IELTS Vocabulary",
    description: "Từ vựng tiếng Anh cho kỳ thi IELTS",
    userIndex: 1, // tran_thi_b
  },
  {
    name: "Travel English",
    description: "Từ vựng tiếng Anh cho du lịch và khách sạn",
    userIndex: 1, // tran_thi_b
  },
  {
    name: "Academic English",
    description: "Từ vựng tiếng Anh học thuật và giáo dục",
    userIndex: 2, // le_minh_c
  },
  {
    name: "Technology Terms",
    description: "Thuật ngữ công nghệ thông tin bằng tiếng Anh",
    userIndex: 2, // le_minh_c
  },
  {
    name: "Medical English",
    description: "Thuật ngữ y tế bằng tiếng Anh",
    userIndex: 3, // pham_thu_d
  },
  {
    name: "Food & Cooking",
    description: "Từ vựng tiếng Anh về ẩm thực và nấu ăn",
    userIndex: 3, // pham_thu_d
  },
];

// Sample flashcards with English-Vietnamese content
export const sampleFlashcards = [
  // Essential English Vocabulary (Deck 0)
  {
    word: "Hello",
    definition: "Xin chào - Lời chào hỏi thông dụng",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/hello--_us_1.mp3",
    examples: [
      "Hello, how are you? - Xin chào, bạn khỏe không?",
      "Hello everyone! - Xin chào mọi người!",
    ],
    deckIndex: 0,
    userIndex: 0,
    srsData: {
      interval: 15,
      easeFactor: 2.9,
      repetitions: 4,
      nextReview: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  },
  {
    word: "Beautiful",
    definition: "Đẹp, xinh đẹp - Có vẻ ngoài hấp dẫn",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/beautiful--_us_1.mp3",
    examples: [
      "She is very beautiful. - Cô ấy rất đẹp.",
      "What a beautiful day! - Thật là một ngày đẹp trời!",
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
    word: "Important",
    definition: "Quan trọng - Có ý nghĩa lớn hoặc có giá trị cao",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/important--_us_1.mp3",
    examples: [
      "This is very important. - Điều này rất quan trọng.",
      "Education is important for everyone. - Giáo dục quan trọng đối với mọi người.",
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
  {
    word: "Family",
    definition: "Gia đình - Nhóm người có quan hệ huyết thống",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/family--_us_1.mp3",
    examples: [
      "I love my family. - Tôi yêu gia đình mình.",
      "Family comes first. - Gia đình là trên hết.",
    ],
    deckIndex: 0,
    userIndex: 0,
    srsData: {
      interval: 8,
      easeFactor: 2.7,
      repetitions: 3,
      nextReview: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    },
  },
  {
    word: "Friend",
    definition: "Bạn bè - Người có mối quan hệ thân thiết",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/friend--_us_1.mp3",
    examples: [
      "He is my best friend. - Anh ấy là bạn thân nhất của tôi.",
      "Friends are important in life. - Bạn bè rất quan trọng trong cuộc sống.",
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

  // Business English (Deck 1)
  {
    word: "Meeting",
    definition: "Cuộc họp - Buổi tập hợp để thảo luận công việc",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/meeting--_us_1.mp3",
    examples: [
      "We have a meeting at 2 PM. - Chúng ta có cuộc họp lúc 2 giờ chiều.",
      "The meeting was very productive. - Cuộc họp rất hiệu quả.",
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
    word: "Deadline",
    definition: "Hạn chót - Thời điểm cuối cùng để hoàn thành công việc",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/deadline--_us_1.mp3",
    examples: [
      "The deadline is tomorrow. - Hạn chót là ngày mai.",
      "We need to meet the deadline. - Chúng ta cần phải đáp ứng hạn chót.",
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
  {
    word: "Presentation",
    definition: "Bài thuyết trình - Việc trình bày thông tin trước đám đông",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/presentation--_us_1.mp3",
    examples: [
      "I have to give a presentation. - Tôi phải thuyết trình.",
      "The presentation was excellent. - Bài thuyết trình rất xuất sắc.",
    ],
    deckIndex: 1,
    userIndex: 0,
    srsData: {
      interval: 4,
      easeFactor: 2.3,
      repetitions: 2,
      nextReview: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  },

  // IELTS Vocabulary (Deck 2)
  {
    word: "Significant",
    definition: "Đáng kể, quan trọng - Có ý nghĩa hoặc tầm quan trọng lớn",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/significant--_us_1.mp3",
    examples: [
      "There was a significant improvement. - Có sự cải thiện đáng kể.",
      "This is a significant discovery. - Đây là một khám phá quan trọng.",
    ],
    deckIndex: 2,
    userIndex: 1,
    srsData: {
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: new Date(),
    },
  },
  {
    word: "Analyze",
    definition: "Phân tích - Xem xét chi tiết để hiểu rõ",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/analyze--_us_1.mp3",
    examples: [
      "We need to analyze the data. - Chúng ta cần phân tích dữ liệu.",
      "Let's analyze this problem. - Hãy phân tích vấn đề này.",
    ],
    deckIndex: 2,
    userIndex: 1,
    srsData: {
      interval: 5,
      easeFactor: 2.8,
      repetitions: 2,
      nextReview: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },

  // Travel English (Deck 3)
  {
    word: "Airport",
    definition: "Sân bay - Nơi máy bay cất cánh và hạ cánh",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/airport--_us_1.mp3",
    examples: [
      "I'm going to the airport. - Tôi đang đi sân bay.",
      "The airport is very busy. - Sân bay rất đông đúc.",
    ],
    deckIndex: 3,
    userIndex: 1,
    srsData: {
      interval: 12,
      easeFactor: 2.9,
      repetitions: 3,
      nextReview: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    },
  },
  {
    word: "Hotel",
    definition: "Khách sạn - Nơi cung cấp chỗ ở tạm thời",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/hotel--_us_1.mp3",
    examples: [
      "We stayed at a nice hotel. - Chúng tôi ở một khách sạn đẹp.",
      "The hotel has a swimming pool. - Khách sạn có hồ bơi.",
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
    word: "Reservation",
    definition: "Đặt chỗ - Việc đặt trước dịch vụ hoặc chỗ ngồi",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/reservation--_us_1.mp3",
    examples: [
      "I made a reservation for dinner. - Tôi đã đặt chỗ cho bữa tối.",
      "Do you have a reservation? - Bạn có đặt chỗ không?",
    ],
    deckIndex: 3,
    userIndex: 1,
    srsData: {
      interval: 3,
      easeFactor: 2.6,
      repetitions: 2,
      nextReview: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },

  // Academic English (Deck 4)
  {
    word: "Research",
    definition: "Nghiên cứu - Việc tìm hiểu có hệ thống về một chủ đề",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/research--_us_1.mp3",
    examples: [
      "I'm doing research on climate change. - Tôi đang nghiên cứu về biến đổi khí hậu.",
      "This research is very important. - Nghiên cứu này rất quan trọng.",
    ],
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
    word: "Hypothesis",
    definition: "Giả thuyết - Lời giải thích tạm thời cho một hiện tượng",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/hypothesis--_us_1.mp3",
    examples: [
      "We need to test this hypothesis. - Chúng ta cần kiểm tra giả thuyết này.",
      "The hypothesis was proven correct. - Giả thuyết đã được chứng minh đúng.",
    ],
    deckIndex: 4,
    userIndex: 2,
    srsData: {
      interval: 7,
      easeFactor: 2.4,
      repetitions: 2,
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },

  // Technology Terms (Deck 5)
  {
    word: "Software",
    definition: "Phần mềm - Chương trình máy tính",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/software--_us_1.mp3",
    examples: [
      "We need to update the software. - Chúng ta cần cập nhật phần mềm.",
      "This software is very useful. - Phần mềm này rất hữu ích.",
    ],
    deckIndex: 5,
    userIndex: 2,
    srsData: {
      interval: 10,
      easeFactor: 2.8,
      repetitions: 3,
      nextReview: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  },
  {
    word: "Database",
    definition: "Cơ sở dữ liệu - Hệ thống lưu trữ thông tin có tổ chức",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/database--_us_1.mp3",
    examples: [
      "The database contains customer information. - Cơ sở dữ liệu chứa thông tin khách hàng.",
      "We need to backup the database. - Chúng ta cần sao lưu cơ sở dữ liệu.",
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

  // Medical English (Deck 6)
  {
    word: "Symptom",
    definition: "Triệu chứng - Dấu hiệu của bệnh tật",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/symptom--_us_1.mp3",
    examples: [
      "What are your symptoms? - Triệu chứng của bạn là gì?",
      "Fever is a common symptom. - Sốt là triệu chứng thường gặp.",
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
    word: "Treatment",
    definition: "Điều trị - Phương pháp chữa bệnh",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/treatment--_us_1.mp3",
    examples: [
      "The treatment is working well. - Việc điều trị đang có hiệu quả.",
      "What treatment do you recommend? - Bạn khuyên điều trị như thế nào?",
    ],
    deckIndex: 6,
    userIndex: 3,
    srsData: {
      interval: 6,
      easeFactor: 2.7,
      repetitions: 2,
      nextReview: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  },

  // Food & Cooking (Deck 7)
  {
    word: "Recipe",
    definition: "Công thức nấu ăn - Hướng dẫn cách làm món ăn",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/recipe--_us_1.mp3",
    examples: [
      "I found a great recipe online. - Tôi tìm thấy một công thức tuyệt vời trên mạng.",
      "Can you share the recipe? - Bạn có thể chia sẻ công thức không?",
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
  {
    word: "Ingredient",
    definition: "Nguyên liệu - Thành phần dùng để nấu ăn",
    pronunciation:
      "https://ssl.gstatic.com/dictionary/static/sounds/20200429/ingredient--_us_1.mp3",
    examples: [
      "What ingredients do we need? - Chúng ta cần những nguyên liệu gì?",
      "Fresh ingredients make better food. - Nguyên liệu tươi làm món ăn ngon hơn.",
    ],
    deckIndex: 7,
    userIndex: 3,
    srsData: {
      interval: 4,
      easeFactor: 2.6,
      repetitions: 2,
      nextReview: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  },
];
