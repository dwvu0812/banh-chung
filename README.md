# Bánh Chưng - Flashcard Learning App

A modern, full-stack flashcard application built with Next.js, Express, and MongoDB. Features spaced repetition learning (SRS) using the SM-2 algorithm, audio pronunciation, and beautiful UI.

## 🚀 Features

- **User Authentication** - Secure JWT-based authentication
- **Deck Management** - Create, edit, and organize flashcard decks
- **Flashcard CRUD** - Full create, read, update, delete operations for cards
- **Spaced Repetition (SRS)** - SM-2 algorithm for optimal learning
- **Review System** - Interactive flip cards with keyboard shortcuts
- **Audio Pronunciation** - Google Text-to-Speech integration
- **Statistics Dashboard** - Track learning progress and stats
- **Responsive Design** - Mobile-friendly interface
- **Comprehensive Tests** - Both frontend and backend test coverage

## 📋 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **Jest & React Testing Library** - Testing

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type safety
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Jest & Supertest** - Testing

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Clone the Repository
```bash
git clone <repository-url>
cd banh-chung
npm install
```

### Environment Variables

#### Backend (.env in `packages/backend/`)
```env
MONGO_URI=mongodb://localhost:27017/flashcard-app
# OR use MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/flashcard-app

JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
```

#### Frontend (.env.local in `packages/frontend/`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd packages/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 🚀 Running the Application

### Development Mode

#### 1. Start Backend
```bash
cd packages/backend
npm run dev
```
Backend will run on http://localhost:5000

#### 2. Start Frontend
```bash
cd packages/frontend
npm run dev
```
Frontend will run on http://localhost:3000

### Seed Database (Optional)
```bash
cd packages/backend
npm run seed
```
This creates sample users, decks, and flashcards.

**Default test account:**
- Email: `nguyenvana@example.com`
- Password: `password123`

### Verify Seeded Data
```bash
cd packages/backend
npm run verify-seed
```

## 🧪 Running Tests

### Backend Tests
```bash
cd packages/backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

### Frontend Tests
```bash
cd packages/frontend
npm test                # Run all tests
npm run test:watch      # Watch mode
```

## 📁 Project Structure

```
banh-chung/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── middleware/     # Auth middleware
│   │   │   ├── models/         # Mongoose models
│   │   │   ├── routes/         # API routes
│   │   │   ├── lib/            # Utilities (SRS, TTS)
│   │   │   ├── seeds/          # Database seeding
│   │   │   ├── __tests__/      # Backend tests
│   │   │   └── server.ts       # Entry point
│   │   ├── dist/               # Compiled JS
│   │   └── package.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── app/            # Next.js pages
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom hooks
│       │   ├── lib/            # Utilities (API, auth)
│       │   ├── store/          # Zustand stores
│       │   └── __tests__/      # Frontend tests
│       └── package.json
│
├── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Decks
- `GET /api/decks` - Get all user's decks
- `GET /api/decks/:id` - Get single deck
- `POST /api/decks` - Create deck
- `PUT /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck

### Flashcards
- `GET /api/decks/:deckId/cards` - Get cards in deck
- `POST /api/decks/:deckId/cards` - Create card
- `GET /api/cards/:cardId` - Get single card
- `PUT /api/cards/:cardId` - Update card
- `DELETE /api/cards/:cardId` - Delete card
- `POST /api/cards/:cardId/audio` - Generate audio

### Reviews
- `GET /api/reviews` - Get cards due for review
- `POST /api/reviews/:cardId` - Submit review

### Statistics
- `GET /api/stats/dashboard` - Dashboard statistics
- `GET /api/stats/deck/:deckId` - Deck statistics

## ⌨️ Keyboard Shortcuts (Review Mode)

- **Space** - Flip card
- **1** - Rate "Again"
- **2** - Rate "Hard"
- **3** - Rate "Good"
- **4** - Rate "Easy"
- **ESC** - Exit review

## 🎨 Key Features Explained

### Spaced Repetition System (SRS)
Uses the SM-2 algorithm to optimize learning intervals:
- **Again (0)**: Review in < 1 minute
- **Hard (3)**: Review in 1 day
- **Good (4)**: Review in 2-3 days  
- **Easy (5)**: Review in 4+ days

### Audio Pronunciation
- Auto-generates pronunciation URLs using Google TTS
- Supports multiple languages
- Click speaker icon or use keyboard shortcut to play

### Statistics
- Cards due today
- New cards added
- Total vocabulary learned
- Deck-specific mastery percentages

## 🚢 Deployment

### Backend Deployment (Railway/Render)

1. Create a new project on Railway or Render
2. Connect your Git repository
3. Set environment variables:
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `PORT`
4. Deploy command: `npm run build && npm start`

### Frontend Deployment (Vercel)

1. Import project to Vercel
2. Set root directory to `packages/frontend`
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` (your backend URL)
4. Deploy

### MongoDB Atlas Setup

1. Create free cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get connection string and add to backend .env

## 🧪 Testing Guide

### Backend Testing
Tests include:
- Controller unit tests (auth, decks, cards, reviews, stats)
- SRS algorithm tests
- TTS utility tests
- Integration tests

### Frontend Testing
Tests include:
- Component rendering tests
- User interaction tests
- Store/state management tests

## 📝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Your Name / Team Name

## 🙏 Acknowledgments

- SM-2 Algorithm by Piotr Wozniak
- shadcn/ui for beautiful components
- Next.js team for amazing framework
- MongoDB team for excellent database

