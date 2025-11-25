# Deployment Guide

Complete guide to deploying Bánh Chưng flashcard app to production.

## Table of Contents

1. [MongoDB Atlas Setup](#mongodb-atlas-setup)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Post-Deployment](#post-deployment)

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account

- Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free account
- Create a new project

### 2. Create Database Cluster

- Click "Build a Database"
- Choose FREE tier (M0)
- Select cloud provider and region (closest to your users)
- Click "Create Cluster"

### 3. Create Database User

- Go to "Database Access" in left sidebar
- Click "Add New Database User"
- Choose "Password" authentication
- Create username and strong password
- Set privileges to "Read and write to any database"
- Click "Add User"

### 4. Configure Network Access

- Go to "Network Access" in left sidebar
- Click "Add IP Address"
- For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
- For production: Add specific IP addresses of your servers
- Click "Confirm"

### 5. Get Connection String

- Go back to "Database" (Clusters)
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- Replace `<password>` with your database user password
- Replace `myFirstDatabase` with your database name (e.g., `flashcard-app`)

Example connection string:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashcard-app?retryWrites=true&w=majority
```

## Backend Deployment

We'll use **Railway** for this guide (free tier available). You can also use Render, Heroku, or DigitalOcean.

### Option A: Railway Deployment

#### 1. Create Railway Account

- Go to [railway.app](https://railway.app)
- Sign up with GitHub

#### 2. Create New Project

- Click "New Project"
- Choose "Deploy from GitHub repo"
- Select your repository
- Railway will auto-detect the app

#### 3. Configure Root Directory

- Click on your service
- Go to "Settings"
- Set "Root Directory" to `packages/backend`

#### 4. Set Environment Variables

- Go to "Variables" tab
- Add the following variables:
  ```
  MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashcard-app
  JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
  JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key-at-least-32-characters
  PORT=5000
  NODE_ENV=production
  ```

#### 5. Configure Build & Start Commands

- Go to "Settings" → "Deploy"
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

#### 6. Deploy

- Railway will automatically deploy
- Get your deployed URL (e.g., `https://your-app.railway.app`)

#### 7. Seed Database (Optional)

- Open Railway service shell/terminal
- Run: `npm run seed:prod`

### Option B: Render Deployment

#### 1. Create Render Account

- Go to [render.com](https://render.com)
- Sign up

#### 2. Create Web Service

- Click "New +"
- Select "Web Service"
- Connect your GitHub repository

#### 3. Configure Service

- Name: `banh-chung-backend`
- Root Directory: `packages/backend`
- Environment: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

#### 4. Add Environment Variables

Same as Railway step 4

#### 5. Create & Deploy

- Click "Create Web Service"
- Wait for deployment
- Copy service URL

## Frontend Deployment

We'll use **Vercel** (recommended for Next.js).

### 1. Create Vercel Account

- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub

### 2. Import Project

- Click "Add New..." → "Project"
- Import your GitHub repository

### 3. Configure Project

- Framework Preset: Next.js (auto-detected)
- Root Directory: `packages/frontend`
- Build Command: `npm run build` (auto-detected)
- Output Directory: `.next` (auto-detected)

### 4. Set Environment Variables

- Click "Environment Variables"
- Add:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
  ```
  (Replace with your actual backend URL from Railway/Render)

### 5. Deploy

- Click "Deploy"
- Wait for build to complete
- Vercel provides a URL: `https://your-app.vercel.app`

### 6. Custom Domain (Optional)

- Go to project settings → "Domains"
- Add your custom domain
- Follow DNS configuration instructions

## Post-Deployment

### 1. Test Backend

Visit your backend URL + `/api/auth/login` to verify it's running:

```bash
curl https://your-backend.railway.app/api/auth/login
```

### 2. Test Frontend

- Visit your Vercel URL
- Try to register a new account
- Create a deck and flashcards
- Test review functionality

### 3. Update CORS Settings

If you get CORS errors, update backend `server.ts`:

```typescript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-app.vercel.app",
      "https://your-custom-domain.com",
    ],
    credentials: true,
  })
);
```

### 4. Seed Production Database (Optional)

```bash
# Via Railway shell
npm run seed:prod

# Or via local terminal
MONGO_URI="your-production-mongodb-uri" npm run seed
```

### 5. Monitor Application

- **Railway**: Check logs in dashboard
- **Vercel**: Check deployment logs and analytics
- **MongoDB Atlas**: Monitor database metrics

## Environment Variables Checklist

### Backend (.env)

- [x] `MONGO_URI` - MongoDB connection string
- [x] `JWT_SECRET` - Secret key for JWT access tokens (32+ characters)
- [x] `JWT_REFRESH_SECRET` - Secret key for JWT refresh tokens (32+ characters)
- [x] `PORT` - Port number (default: 5000)
- [x] `NODE_ENV` - Set to "production"

### Frontend (.env.local)

- [x] `NEXT_PUBLIC_API_URL` - Backend API URL

## Troubleshooting

### Backend Issues

**Problem**: Database connection fails

- Check MongoDB Atlas network access (whitelist IPs)
- Verify connection string format
- Check database user credentials

**Problem**: JWT errors

- Ensure `JWT_SECRET` is set and consistent
- Check token expiration settings

**Problem**: Module not found

- Ensure `npm install` runs in build command
- Check `package.json` dependencies

### Frontend Issues

**Problem**: API calls fail

- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Ensure backend is running

**Problem**: Build fails

- Check all dependencies are in `package.json`
- Verify environment variables are set
- Review build logs for specific errors

### Database Issues

**Problem**: Slow queries

- Add indexes to frequently queried fields
- Check MongoDB Atlas metrics

**Problem**: Connection limit reached

- Upgrade to paid MongoDB Atlas tier
- Implement connection pooling

## Security Best Practices

1. **Environment Variables**

   - Never commit `.env` files
   - Use strong, random values for secrets
   - Rotate secrets periodically

2. **Database**

   - Use strong passwords
   - Enable MongoDB encryption at rest
   - Regular backups (MongoDB Atlas auto-backup)

3. **API**

   - Rate limiting (consider adding express-rate-limit)
   - Input validation
   - HTTPS only in production

4. **CORS**
   - Only allow specific origins in production
   - Remove wildcard origins

## Monitoring & Maintenance

### Regular Tasks

- [ ] Check error logs weekly
- [ ] Monitor database size
- [ ] Review API performance
- [ ] Update dependencies monthly
- [ ] Backup database (if not using Atlas auto-backup)

### Scaling Considerations

- **Database**: Upgrade MongoDB tier when needed
- **Backend**: Add more Railway/Render instances
- **Frontend**: Vercel auto-scales
- **CDN**: Consider Cloudflare for static assets

## Cost Estimates (Free Tiers)

- **MongoDB Atlas**: Free (M0 - 512MB)
- **Railway**: Free tier with limits
- **Vercel**: Free (Hobby plan)
- **Total**: $0/month for small scale

For production at scale:

- **MongoDB Atlas**: $9-57+/month (M10-M30)
- **Railway**: $5-20+/month
- **Vercel**: $20/month (Pro)
- **Total**: ~$34-97+/month

## Support

If you encounter issues:

1. Check deployment logs
2. Review error messages
3. Consult platform documentation
4. Open GitHub issue
