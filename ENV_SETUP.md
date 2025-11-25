# Environment Variables Setup Guide

This guide will help you set up the required environment variables for both backend and frontend.

## Backend Environment Variables

Create a file named `.env` in `packages/backend/` with the following content:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/flashcard-app

# JWT Secrets (change these to random strings!)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-32chars
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-change-this-too-32chars

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

### MongoDB Options

**Option 1: Local MongoDB**

```env
MONGO_URI=mongodb://localhost:27017/flashcard-app
```

Make sure MongoDB is running locally: `mongod`

**Option 2: MongoDB Atlas (Cloud)**

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/flashcard-app?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, and cluster details with your MongoDB Atlas credentials.

### Generating Secure JWT Secrets

You can generate random secrets using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

## Frontend Environment Variables

Create a file named `.env.local` in `packages/frontend/` with the following content:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### For Production

Update the URL to your deployed backend:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

## Verification Steps

### 1. Check Backend Environment

```bash
cd packages/backend

# Check if .env file exists
ls -la .env

# Test MongoDB connection
npm run dev
```

You should see: `MongoDB Connected`

### 2. Check Frontend Environment

```bash
cd packages/frontend

# Check if .env.local file exists
ls -la .env.local

# Start frontend
npm run dev
```

Visit http://localhost:3000 - the app should load without errors.

## Common Issues

### Backend won't start

**Error: `JWT_REFRESH_SECRET is not defined`**

- Solution: Add `JWT_REFRESH_SECRET` to your `.env` file

**Error: `MongoDB connection failed`**

- Solution 1: Start local MongoDB: `mongod`
- Solution 2: Check MongoDB Atlas connection string and network access

### Frontend API calls fail

**Error: `Network Error` or `404`**

- Check if backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Make sure the URL ends with `/api` (no trailing slash)

### CORS Errors

If you see CORS errors in the browser console:

- Restart both backend and frontend
- Check backend `server.ts` CORS configuration includes your frontend URL

## Environment Variables Checklist

### Backend (`packages/backend/.env`)

- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Random 32+ character string
- [ ] `JWT_REFRESH_SECRET` - Different random 32+ character string
- [ ] `PORT` - Port number (5000)
- [ ] `NODE_ENV` - Set to "development"

### Frontend (`packages/frontend/.env.local`)

- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL (http://localhost:5000/api)

## Security Notes

⚠️ **Important:**

- NEVER commit `.env` or `.env.local` files to Git
- Use different secrets for development and production
- Rotate JWT secrets periodically in production
- Use strong passwords for MongoDB users

## Quick Copy-Paste

### Backend .env (Development)

```bash
cat > packages/backend/.env << 'EOF'
MONGO_URI=mongodb://localhost:27017/flashcard-app
JWT_SECRET=change-this-to-a-random-32-character-string-for-development
JWT_REFRESH_SECRET=change-this-to-another-random-32-char-string-different
PORT=5000
NODE_ENV=development
EOF
```

### Frontend .env.local (Development)

```bash
cat > packages/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF
```

After creating these files, you're ready to run the application! 🚀

See [QUICKSTART.md](QUICKSTART.md) for next steps.
