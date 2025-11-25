# Quick Start Guide

Get Bánh Chưng up and running in 5 minutes!

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

## 1. Clone & Install
```bash
git clone <repository-url>
cd banh-chung
npm install
```

## 2. Setup Backend

```bash
cd packages/backend

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb://localhost:27017/flashcard-app
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
PORT=5000
EOF

# Install dependencies
npm install

# Seed database (optional)
npm run seed
```

## 3. Setup Frontend

```bash
cd ../frontend

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF

# Install dependencies
npm install
```

## 4. Run

Open two terminals:

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd packages/frontend
npm run dev
```

## 5. Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 6. Login

If you seeded the database, use:
- Email: `nguyenvana@example.com`
- Password: `password123`

Otherwise, register a new account!

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [API.md](API.md) for API reference
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide

## Troubleshooting

**MongoDB connection failed?**
- Ensure MongoDB is running: `mongod` or use MongoDB Atlas
- Check `MONGO_URI` in `.env`

**Port already in use?**
- Change `PORT` in backend `.env`
- Change Next.js port: `PORT=3001 npm run dev`

**API calls failing?**
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

## Testing

```bash
# Backend tests
cd packages/backend
npm test

# Frontend tests
cd packages/frontend
npm test
```

Enjoy learning! 🚀

