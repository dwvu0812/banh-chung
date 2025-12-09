# 🔐 Environment Setup Guide

This guide will help you configure environment variables for local development, Railway (backend), and Vercel (frontend).

## 📋 Quick Start Checklist

- [ ] Generate JWT secrets
- [ ] Setup MongoDB Atlas databases
- [ ] Configure local environment files
- [ ] Setup Railway environment variables
- [ ] Setup Vercel environment variables
- [ ] Update CORS URLs after deployment

---

## 🔑 1. Generate JWT Secrets

Run this command **4 times** to generate unique secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

You'll need:

- Development JWT Secret
- Development Refresh Secret
- Production JWT Secret (must be different)
- Production Refresh Secret (must be different)

**✅ Already generated in your files:**

- Dev JWT Secret: `546b659952a6c249c7b7f65729f7a301b560ef8e96574db25c84937adb9ab3d9`
- Dev Refresh: `db9a191c277ca251160945d12bd3c1a697aff82a946e3cbc0b2d7a95b6d73ed6`
- Prod JWT Secret: `853aab4fa3740bd6e72b624a7d15aff748e4f143184f0e0a6801f96d3613ad6f`
- Prod Refresh: `1990070663edee822f7d58ca1d82133c451124151dcfe2a54a37ee4799288bb2`

---

## 🗄️ 2. Setup MongoDB Atlas

### Create Development Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new database: `banh-chung-dev`
3. Get connection string:
   - Click **Connect** → **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace database name with `banh-chung-dev`

Example:

```
mongodb+srv://admin:MyP@ssw0rd@cluster0.abc123.mongodb.net/banh-chung-dev?retryWrites=true&w=majority
```

### Create Production Database

1. Create another database: `banh-chung-prod`
2. Get connection string (same process as above)
3. Use different credentials for production (recommended)

---

## 💻 3. Local Development Setup

### Backend Local Environment

Edit `packages/backend/.env.development`:

```bash
# Replace this with your actual MongoDB connection string
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/banh-chung-dev?retryWrites=true&w=majority

# JWT secrets are already configured
JWT_SECRET=546b659952a6c249c7b7f65729f7a301b560ef8e96574db25c84937adb9ab3d9
JWT_REFRESH_SECRET=db9a191c277ca251160945d12bd3c1a697aff82a946e3cbc0b2d7a95b6d73ed6

NODE_ENV=development
PORT=5000
FRONTEND_URL_DEV=http://localhost:3000
```

### Frontend Local Environment

Edit `packages/frontend/.env.development`:

```bash
# Points to local backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_DEBUG=true
```

### Test Local Setup

```bash
# Terminal 1 - Start backend
cd packages/backend
npm run dev

# Terminal 2 - Start frontend
cd packages/frontend
npm run dev
```

Open http://localhost:3000 and test login/register.

---

## 🚂 4. Railway Setup (Backend Hosting)

### Development Environment

1. Go to [Railway Dashboard](https://railway.app)
2. Select your **dev backend project**
3. Click **Variables** tab
4. Add these variables:

```bash
MONGO_URI=mongodb+srv://...../banh-chung-dev
JWT_SECRET=546b659952a6c249c7b7f65729f7a301b560ef8e96574db25c84937adb9ab3d9
JWT_REFRESH_SECRET=db9a191c277ca251160945d12bd3c1a697aff82a946e3cbc0b2d7a95b6d73ed6
NODE_ENV=development
PORT=5000
FRONTEND_URL_DEV=http://localhost:3000
FRONTEND_URL_PROD=
```

5. Click **Deploy** (Railway will auto-redeploy)
6. Copy the deployment URL (e.g., `https://banh-chung-backend-dev.up.railway.app`)

### Production Environment

1. Select your **prod backend project**
2. Click **Variables** tab
3. Add these variables:

```bash
MONGO_URI=mongodb+srv://...../banh-chung-prod
JWT_SECRET=853aab4fa3740bd6e72b624a7d15aff748e4f143184f0e0a6801f96d3613ad6f
JWT_REFRESH_SECRET=1990070663edee822f7d58ca1d82133c451124151dcfe2a54a37ee4799288bb2
NODE_ENV=production
PORT=5000
FRONTEND_URL_DEV=
FRONTEND_URL_PROD=https://banh-chung.vercel.app
```

**Note:** You'll update `FRONTEND_URL_PROD` after deploying to Vercel.

---

## ▲ 5. Vercel Setup (Frontend Hosting)

### Get Project IDs

```bash
cd packages/frontend
vercel login
vercel link
```

This creates `.vercel/project.json` with:

- `orgId`: Your organization ID
- `projectId`: Your project ID

**✅ Your IDs:**

- Org ID: `team_dVrhXngbZUOr6k6H0VrXeGOQ`
- Project ID: `prj_BQKoqIeVkdJir6nOlbMVc2MIUPd2`

### Preview Environment (Dev)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Settings → **Environment Variables**
4. Add variable:

```
Key: NEXT_PUBLIC_API_URL
Value: https://banh-chung-backend-dev.up.railway.app/api
Environment: ✓ Preview
```

### Production Environment

Add another variable:

```
Key: NEXT_PUBLIC_API_URL
Value: https://banh-chung-backend-prod.up.railway.app/api
Environment: ✓ Production
```

**Note:** Use the actual Railway URLs you got from step 4.

---

## 🔄 6. Update CORS URLs

After deploying to Vercel, you need to update Railway with the frontend URLs:

### Update Railway Dev

1. Go to Railway **dev backend project**
2. Variables → Edit `FRONTEND_URL_DEV`
3. Set to your Vercel preview URL:
   ```
   https://banh-chung-git-dev-yourusername.vercel.app
   ```

### Update Railway Prod

1. Go to Railway **prod backend project**
2. Variables → Edit `FRONTEND_URL_PROD`
3. Set to your Vercel production URL:

   ```
   https://banh-chung.vercel.app
   ```

4. Railway will auto-redeploy with new CORS settings

---

## 🔐 7. GitHub Secrets Setup

For CI/CD to work, add these secrets in GitHub:

**Repository Settings → Secrets and variables → Actions**

### Railway Secrets

```
RAILWAY_TOKEN=<get from Railway Account Settings → Tokens>
RAILWAY_SERVICE_ID_DEV=<get from Railway dev project → Service → Settings>
RAILWAY_SERVICE_ID_PROD=<get from Railway prod project → Service → Settings>
```

### Vercel Secrets

```
VERCEL_TOKEN=<get from Vercel Settings → Tokens>
VERCEL_ORG_ID=team_dVrhXngbZUOr6k6H0VrXeGOQ
VERCEL_PROJECT_ID=prj_BQKoqIeVkdJir6nOlbMVc2MIUPd2
```

---

## ✅ Verification Checklist

### Local Development

- [ ] Backend starts without errors (`npm run dev` in packages/backend)
- [ ] Frontend starts without errors (`npm run dev` in packages/frontend)
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Can create a deck
- [ ] No CORS errors in browser console

### Railway Dev

- [ ] Backend deploys successfully
- [ ] Can access Railway URL in browser
- [ ] Logs show "MongoDB connected"
- [ ] Health check works: `curl https://your-backend-dev.railway.app/api/auth/health`

### Vercel Preview

- [ ] Frontend deploys successfully
- [ ] Can access preview URL
- [ ] Can login/register
- [ ] API calls work (check Network tab)
- [ ] No CORS errors

### Railway Prod

- [ ] Backend deploys successfully
- [ ] Using production database
- [ ] Different JWT secrets than dev
- [ ] Health check works

### Vercel Production

- [ ] Frontend deploys successfully
- [ ] Production URL works
- [ ] Connects to production backend
- [ ] All features work end-to-end

---

## 🐛 Troubleshooting

### "MongoDB connection failed"

- Check connection string format
- Verify password is correct (no special characters need URL encoding)
- Check MongoDB Atlas network access (allow 0.0.0.0/0 for Railway)

### "CORS error" in browser

- Verify `FRONTEND_URL_DEV` or `FRONTEND_URL_PROD` is set in Railway
- Check the URL matches exactly (no trailing slash)
- Redeploy backend after changing CORS settings

### "Cannot connect to API"

- Check `NEXT_PUBLIC_API_URL` in Vercel
- Verify Railway backend is running
- Test backend directly: `curl https://your-backend.railway.app/api/auth/health`

### "JWT secret too short" error

- JWT secrets must be at least 32 characters
- Use the generated 64-character hex strings provided

### Environment variables not working

- Railway: Click "Redeploy" after changing variables
- Vercel: Redeploy after changing variables
- Local: Restart dev servers after changing .env files

---

## 📚 Related Documentation

- [CI/CD Setup Guide](./CI_CD_SETUP.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Quick Reference](./CICD_QUICK_REFERENCE.md)

---

## 🔒 Security Notes

⚠️ **NEVER commit these files:**

- `.env.development`
- `.env.production`
- `.env.local`
- Any file containing real credentials

✅ **Safe to commit:**

- `.env.example` (contains no real values)

**Keep your secrets safe:**

- Use different secrets for dev and prod
- Rotate secrets every 90 days
- Never share secrets in chat/email
- Use GitHub Secrets for CI/CD

---

**Need help?** Check the troubleshooting section or review the related documentation files.
