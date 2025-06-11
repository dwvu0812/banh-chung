# 🌱 Banh Chung Flashcard App - Seed Data Instructions

## 🎯 Quick Start

### 1. Run the Seeder
```bash
cd packages/backend
npm run seed
```

### 2. Verify the Data
```bash
npm run verify-seed
```

### 3. Test Login
Use any of these accounts:
- **Username**: `nguyen_van_a` | **Email**: `nguyenvana@example.com` | **Password**: `password123`
- **Username**: `tran_thi_b` | **Email**: `tranthib@example.com` | **Password**: `password123`
- **Username**: `le_minh_c` | **Email**: `leminhc@example.com` | **Password**: `password123`
- **Username**: `pham_thu_d` | **Email**: `phamthud@example.com` | **Password**: `password123`

## 📊 What You Get

### ✅ 4 Sample Users
- Different learning preferences (daily targets: 20-35 cards)
- Various voice speed settings (0.8x - 1.2x)
- Realistic Vietnamese names and emails

### ✅ 8 Themed Decks
1. **Essential English Vocabulary** - Basic daily conversation
2. **Business English** - Professional workplace terms
3. **IELTS Vocabulary** - Academic test preparation
4. **Travel English** - Tourism and hospitality
5. **Academic English** - Educational and research terms
6. **Technology Terms** - IT and software vocabulary
7. **Medical English** - Healthcare terminology
8. **Food & Cooking** - Culinary vocabulary

### ✅ 21 Comprehensive Flashcards
- **English words** with **Vietnamese definitions**
- **Pronunciation URLs** (Google TTS)
- **Bilingual example sentences**
- **Varied SRS states** for testing spaced repetition

## 🧪 Testing Scenarios

### Authentication Testing
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nguyenvana@example.com","password":"password123"}'
```

### Deck Management Testing
- Each user owns 2 decks
- Test deck CRUD operations
- Verify ownership restrictions

### Flashcard Operations
- Cards distributed across all decks
- Test card creation, editing, deletion
- Verify deck-card relationships

### SRS System Testing
- **8 new cards** (ready to learn)
- **9 learning cards** (in progress)
- **4 review cards** (mastered)
- **8 cards due today** (ready for review)

## 🔧 Available Scripts

```bash
# Seed the database (development)
npm run seed

# Seed the database (production)
npm run seed:prod

# Verify seeded data
npm run verify-seed

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 File Structure

```
packages/backend/src/seeds/
├── englishVietnameseSeedData.ts    # Raw seed data
├── seedDatabase.ts                 # Main seeder script
├── verifySeededData.ts            # Verification script
└── seedDatabase.ts                # Original seeder (mixed content)
```

## ⚠️ Important Notes

1. **Data Loss Warning**: The seeder clears ALL existing data before inserting new data
2. **Environment Setup**: Ensure `MONGO_URI` is configured in your `.env` file
3. **Development Only**: This seed data is for development and testing only
4. **Password Security**: All accounts use the same password for convenience

## 🚀 Next Steps

After seeding the database, you can:

1. **Start the backend server**: `npm run dev`
2. **Test API endpoints** with the sample user accounts
3. **Verify the spaced repetition system** with cards due for review
4. **Test deck and flashcard CRUD operations**
5. **Implement frontend features** using the seeded data

## 📈 Data Statistics

- **Total Users**: 4
- **Total Decks**: 8 (2 per user)
- **Total Flashcards**: 21 (2-5 per deck)
- **Cards Due Today**: 8
- **Languages**: English → Vietnamese
- **Topics**: 8 different domains

## 🎉 Success Indicators

After running the seeder, you should see:
- ✅ 4 users created
- ✅ 8 decks created  
- ✅ 21 flashcards created
- ✅ Proper relationships established
- ✅ SRS data initialized
- ✅ Cards ready for review

The verification script will confirm all data is properly inserted and relationships are working correctly.
