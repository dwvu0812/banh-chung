# Banh Chung - English-Vietnamese Flashcard Seed Data

This document provides comprehensive information about the seed data for the Banh Chung flashcard application, specifically designed for English-Vietnamese language learning.

## 📊 Database Models Overview

### User Model
- **Fields**: username, email, passwordHash, learningSettings (dailyTarget, voiceSpeed)
- **Relationships**: One-to-many with Decks and Flashcards
- **Timestamps**: createdAt, updatedAt (automatic)

### Deck Model
- **Fields**: name, description, user (ObjectId reference)
- **Relationships**: Belongs to User, has many Flashcards
- **Timestamps**: createdAt, updatedAt (automatic)

### Flashcard Model
- **Fields**: word, definition, pronunciation, examples[], deck, user
- **SRS Data**: interval, easeFactor, repetitions, nextReview
- **Relationships**: Belongs to User and Deck

## 🎯 Seed Data Content

### Sample Users (4 users)
1. **nguyen_van_a** (nguyenvana@example.com)
   - Daily Target: 25 cards
   - Voice Speed: 1.0x
   - Password: `password123`

2. **tran_thi_b** (tranthib@example.com)
   - Daily Target: 30 cards
   - Voice Speed: 0.8x
   - Password: `password123`

3. **le_minh_c** (leminhc@example.com)
   - Daily Target: 20 cards
   - Voice Speed: 1.2x
   - Password: `password123`

4. **pham_thu_d** (phamthud@example.com)
   - Daily Target: 35 cards
   - Voice Speed: 0.9x
   - Password: `password123`

### Sample Decks (8 decks)

#### User 1 (nguyen_van_a) - 2 decks:
1. **Essential English Vocabulary** - Từ vựng tiếng Anh cơ bản cho giao tiếp hàng ngày
2. **Business English** - Từ vựng tiếng Anh thương mại và công việc

#### User 2 (tran_thi_b) - 2 decks:
3. **IELTS Vocabulary** - Từ vựng tiếng Anh cho kỳ thi IELTS
4. **Travel English** - Từ vựng tiếng Anh cho du lịch và khách sạn

#### User 3 (le_minh_c) - 2 decks:
5. **Academic English** - Từ vựng tiếng Anh học thuật và giáo dục
6. **Technology Terms** - Thuật ngữ công nghệ thông tin bằng tiếng Anh

#### User 4 (pham_thu_d) - 2 decks:
7. **Medical English** - Thuật ngữ y tế bằng tiếng Anh
8. **Food & Cooking** - Từ vựng tiếng Anh về ẩm thực và nấu ăn

### Sample Flashcards (20+ cards)

Each flashcard includes:
- **English word/phrase** (front)
- **Vietnamese definition** with explanation (back)
- **Pronunciation URL** (Google TTS links)
- **Example sentences** in both English and Vietnamese
- **SRS data** with varied learning states:
  - New cards (interval: 1, repetitions: 0)
  - Learning cards (interval: 2-6, repetitions: 1-2)
  - Review cards (interval: 8-15, repetitions: 3-4)

## 🚀 How to Run the Seed Data

### Prerequisites
1. MongoDB database running (local or cloud)
2. Environment variables configured in `.env` file:
   ```
   MONGO_URI=mongodb://localhost:27017/banh-chung
   # or your MongoDB connection string
   ```

### Development Environment
```bash
# Navigate to backend directory
cd packages/backend

# Install dependencies (if not already done)
npm install

# Run the seeder
npm run seed
```

### Production Environment
```bash
# Build the project first
npm run build

# Run the production seeder
npm run seed:prod
```

### Manual Execution
```bash
# Using ts-node directly
npx ts-node src/seeds/seedDatabase.ts

# Using node (after building)
node dist/seeds/seedDatabase.js
```

## 📋 What the Seeder Does

1. **Connects to MongoDB** using the MONGO_URI environment variable
2. **Clears existing data** (⚠️ WARNING: This will delete all existing users, decks, and flashcards)
3. **Creates users** with properly hashed passwords using bcrypt
4. **Creates decks** and associates them with users
5. **Creates flashcards** with proper relationships and SRS data
6. **Displays summary** of created data
7. **Disconnects** from the database

## 🔍 Seed Data Features

### Realistic Content
- **Practical vocabulary** for Vietnamese learners of English
- **Varied difficulty levels** from basic to advanced
- **Multiple domains**: business, travel, academic, medical, technology
- **Cultural relevance** with Vietnamese context

### SRS Integration
- **Varied learning states** to test the spaced repetition system
- **Realistic intervals** (1, 2, 3, 6, 8, 10, 12, 15 days)
- **Different ease factors** (2.3 to 2.9)
- **Mixed repetition counts** (0 to 4)

### Audio Support
- **Pronunciation URLs** using Google Text-to-Speech
- **Consistent audio format** for all flashcards
- **US English pronunciation** as standard

## 🧪 Testing Scenarios

The seed data enables testing of:

1. **User Authentication**
   - Login with any of the 4 sample accounts
   - Password: `password123` for all accounts

2. **Deck Management**
   - View decks by different users
   - Create, update, delete operations
   - Deck ownership validation

3. **Flashcard Operations**
   - CRUD operations on flashcards
   - Deck-flashcard relationships
   - User-flashcard associations

4. **Spaced Repetition System**
   - Cards due for review today
   - Cards in different learning states
   - SRS algorithm calculations

5. **Search and Filtering**
   - Find cards by word or definition
   - Filter by deck or user
   - Sort by various criteria

## ⚠️ Important Notes

- **Data Loss Warning**: The seeder clears all existing data before inserting new data
- **Password Security**: All sample users use the same password for testing convenience
- **Production Use**: Do not use this seed data in production environments
- **Vietnamese Text**: The IDE may flag Vietnamese text as unknown words - this is expected

## 🔧 Customization

To modify the seed data:

1. Edit `src/seeds/englishVietnameseSeedData.ts`
2. Add/remove users, decks, or flashcards as needed
3. Adjust SRS data for different testing scenarios
4. Run the seeder again to apply changes

## 📈 Data Statistics

- **4 Users** with different learning preferences
- **8 Decks** covering various topics
- **20+ Flashcards** with comprehensive content
- **Varied SRS states** for realistic testing
- **English-Vietnamese focus** for target audience
