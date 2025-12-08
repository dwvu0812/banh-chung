# 🌍 Environment Files Overview

This document explains all environment files created and how to use them.

## 📂 Files Created

### Backend (`packages/backend/`)

```
packages/backend/
├── .env.example          ✅ Safe to commit (template)
├── .env.development      ❌ DO NOT commit (local dev)
├── .env.production       ❌ DO NOT commit (prod config)
└── verify-env.js         ✅ Safe to commit (verification tool)
```

### Frontend (`packages/frontend/`)

```
packages/frontend/
├── .env.example          ✅ Safe to commit (template)
├── .env.development      ❌ DO NOT commit (local dev)
└── .env.production       ❌ DO NOT commit (prod config)
```

---

## 🎯 Quick Start

### 1. First Time Setup

```bash
# Step 1: Verify environment files exist
cd packages/backend
npm run verify-env

# Step 2: Update MONGO_URI in both files
# Edit packages/backend/.env.development
# Edit packages/backend/.env.production

# Step 3: Verify again
npm run verify-env

# Step 4: Start development
npm run dev
```

### 2. What to Update

#### Required Changes:

**Backend Development** (`packages/backend/.env.development`):

```bash
# Replace this line:
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/banh-chung-dev?retryWrites=true&w=majority

# With your actual MongoDB Atlas connection string
```

**Backend Production** (`packages/backend/.env.production`):

```bash
# Replace this line:
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/banh-chung-prod?retryWrites=true&w=majority

# With your actual MongoDB Atlas connection string
```

**Frontend Production** (`packages/frontend/.env.production`):

```bash
# Replace this line after deploying backend to Railway:
NEXT_PUBLIC_API_URL=https://banh-chung-backend-prod.up.railway.app/api

# With your actual Railway production URL
```

---

## 🔐 Security Features

### JWT Secrets Already Generated

✅ **Development secrets** (already in `.env.development`):

- JWT_SECRET: `546b659952a6c249c7b7f65729f7a301b560ef8e96574db25c84937adb9ab3d9`
- JWT_REFRESH_SECRET: `db9a191c277ca251160945d12bd3c1a697aff82a946e3cbc0b2d7a95b6d73ed6`

✅ **Production secrets** (already in `.env.production`):

- JWT_SECRET: `853aab4fa3740bd6e72b624a7d15aff748e4f143184f0e0a6801f96d3613ad6f`
- JWT_REFRESH_SECRET: `1990070663edee822f7d58ca1d82133c451124151dcfe2a54a37ee4799288bb2`

**Note:** These secrets are DIFFERENT between dev and prod (security best practice).

### .gitignore Protection

The `.gitignore` file has been updated to protect sensitive files:

```gitignore
# Environment files (allow .env.example to be committed)
packages/backend/.env
packages/backend/.env.local
packages/backend/.env.development
packages/backend/.env.production
packages/backend/.env.*.local
packages/frontend/.env
packages/frontend/.env.local
packages/frontend/.env.development
packages/frontend/.env.production
packages/frontend/.env.*.local
```

Only `.env.example` files will be committed to git.

---

## 🛠️ Verification Tool

### Usage

```bash
cd packages/backend
npm run verify-env
```

### What It Checks

✅ All environment files exist  
✅ Required variables are set  
✅ JWT secrets are long enough (32+ chars)  
✅ MongoDB URI has valid format  
✅ JWT secrets are DIFFERENT between dev and prod

### Example Output

```
╔════════════════════════════════════════════╗
║   Backend Environment Verification Tool   ║
╚════════════════════════════════════════════╝

📁 Checking environment files:
✓ .env.example exists
✓ .env.development exists
✓ .env.production exists

📋 Validating Development environment variables:
✓ MONGO_URI: Valid format
✓ JWT_SECRET: Configured (64 chars)
✓ JWT_REFRESH_SECRET: Configured (64 chars)
✓ NODE_ENV: development
✓ PORT: 5000

🔐 Checking JWT secrets are different between environments:
✓ JWT_SECRET is different between dev and prod
✓ JWT_REFRESH_SECRET is different between dev and prod

✅ All environment variables are properly configured!
```

---

## 📋 Environment Variables Reference

### Backend Variables

| Variable             | Required    | Description                     | Example                       |
| -------------------- | ----------- | ------------------------------- | ----------------------------- |
| `MONGO_URI`          | ✅ Yes      | MongoDB connection string       | `mongodb+srv://...`           |
| `JWT_SECRET`         | ✅ Yes      | JWT signing secret (64 chars)   | Generated automatically       |
| `JWT_REFRESH_SECRET` | ✅ Yes      | Refresh token secret (64 chars) | Generated automatically       |
| `NODE_ENV`           | ✅ Yes      | Environment name                | `development` or `production` |
| `PORT`               | ✅ Yes      | Server port                     | `5000`                        |
| `FRONTEND_URL_DEV`   | ⚠️ Optional | Dev frontend URL for CORS       | `http://localhost:3000`       |
| `FRONTEND_URL_PROD`  | ⚠️ Optional | Prod frontend URL for CORS      | `https://your-app.vercel.app` |
| `DEBUG`              | ⚠️ Optional | Debug namespace                 | `app:*`                       |
| `LOG_LEVEL`          | ⚠️ Optional | Logging level                   | `debug` or `error`            |

### Frontend Variables

| Variable                 | Required    | Description           | Example                     |
| ------------------------ | ----------- | --------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL`    | ✅ Yes      | Backend API endpoint  | `http://localhost:5000/api` |
| `NEXT_PUBLIC_DEBUG`      | ⚠️ Optional | Enable debug mode     | `true` or `false`           |
| `NEXT_PUBLIC_ENABLE_TTS` | ⚠️ Optional | Enable text-to-speech | `true` or `false`           |

---

## 🚀 Deployment Configurations

### Railway (Backend)

When deploying to Railway, add these environment variables in the Railway dashboard:

**Development Service:**

```bash
MONGO_URI=<your-dev-mongodb-uri>
JWT_SECRET=546b659952a6c249c7b7f65729f7a301b560ef8e96574db25c84937adb9ab3d9
JWT_REFRESH_SECRET=db9a191c277ca251160945d12bd3c1a697aff82a946e3cbc0b2d7a95b6d73ed6
NODE_ENV=development
PORT=5000
FRONTEND_URL_DEV=http://localhost:3000
```

**Production Service:**

```bash
MONGO_URI=<your-prod-mongodb-uri>
JWT_SECRET=853aab4fa3740bd6e72b624a7d15aff748e4f143184f0e0a6801f96d3613ad6f
JWT_REFRESH_SECRET=1990070663edee822f7d58ca1d82133c451124151dcfe2a54a37ee4799288bb2
NODE_ENV=production
PORT=5000
FRONTEND_URL_PROD=<your-vercel-prod-url>
```

### Vercel (Frontend)

Add these in Vercel dashboard → Settings → Environment Variables:

**Preview Environment:**

```
NEXT_PUBLIC_API_URL=<your-railway-dev-url>/api
```

**Production Environment:**

```
NEXT_PUBLIC_API_URL=<your-railway-prod-url>/api
```

---

## 🔄 Workflow

### Local Development

1. Edit `.env.development` files
2. Run `npm run verify-env` in backend
3. Start backend: `npm run dev`
4. Start frontend: `npm run dev`
5. Test at http://localhost:3000

### Deploy to Staging (Dev)

1. Configure Railway Dev environment variables
2. Configure Vercel Preview environment variables
3. Push to `dev` branch
4. GitHub Actions automatically deploys
5. Update `FRONTEND_URL_DEV` in Railway after Vercel deploys

### Deploy to Production

1. Configure Railway Prod environment variables
2. Configure Vercel Production environment variables
3. Create PR from `dev` to `main`
4. Merge after approval
5. GitHub Actions deploys (requires manual approval)
6. Update `FRONTEND_URL_PROD` in Railway after Vercel deploys

---

## 🐛 Common Issues

### Issue: "MongoDB connection failed"

**Solution:**

1. Check MONGO_URI format
2. Verify password doesn't have special characters (or URL encode them)
3. Check MongoDB Atlas network access (whitelist 0.0.0.0/0 for Railway)

### Issue: "JWT secret too short"

**Solution:**

- Use the pre-generated 64-character secrets in the files
- Or generate new ones: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Issue: "CORS error in browser"

**Solution:**

1. Verify `FRONTEND_URL_DEV` or `FRONTEND_URL_PROD` is set in Railway
2. Make sure URL matches exactly (no trailing slash)
3. Redeploy backend after changing CORS settings

### Issue: "Cannot find module 'dotenv'"

**Solution:**

```bash
cd packages/backend
npm install
```

---

## 📚 Related Documentation

- **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)** - Detailed setup instructions
- **[CI_CD_SETUP.md](./CI_CD_SETUP.md)** - CI/CD pipeline configuration
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

---

## ✅ Checklist

Before committing:

- [ ] Only `.env.example` files are staged
- [ ] No `.env.development` or `.env.production` in git
- [ ] Verified with `git status`

Before deploying:

- [ ] Run `npm run verify-env` in backend
- [ ] All checks pass
- [ ] MongoDB URIs are correct
- [ ] Railway environment variables configured
- [ ] Vercel environment variables configured

---

**Last Updated:** December 8, 2024  
**Status:** ✅ Ready to use

Need help? Check the [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md) for step-by-step instructions.
