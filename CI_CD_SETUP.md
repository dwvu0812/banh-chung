# CI/CD Setup Instructions

This guide provides step-by-step instructions to configure the CI/CD pipeline for the Bánh Chưng flashcard application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Railway Setup](#railway-setup)
3. [Vercel Setup](#vercel-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [GitHub Environments Setup](#github-environments-setup)
6. [Branch Protection Rules](#branch-protection-rules)
7. [Testing the Pipeline](#testing-the-pipeline)

## Prerequisites

Before starting, ensure you have:

- A GitHub account with this repository
- Admin access to the repository
- MongoDB Atlas account with dev and prod databases created

## Railway Setup

### 1. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your GitHub account

### 2. Create Development Backend Project

1. Click "New Project" in Railway dashboard
2. Select "Empty Project"
3. Name it `banh-chung-backend-dev`
4. Click "Add Service" → "GitHub Repo"
5. Select your repository
6. Configure the service:

   - **Name**: `backend-dev`
   - **Root Directory**: `packages/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

7. Add environment variables (Settings → Variables):

   ```
   MONGO_URI=<your-dev-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-random-32-char-string>
   JWT_REFRESH_SECRET=<generate-different-random-32-char-string>
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL_DEV=<will-add-after-vercel-setup>
   ```

8. Copy the **Service ID** from Settings (you'll need this for GitHub secrets)
9. Note the deployment URL (e.g., `https://banh-chung-backend-dev.up.railway.app`)

### 3. Create Production Backend Project

1. Click "New Project" again
2. Select "Empty Project"
3. Name it `banh-chung-backend-prod`
4. Click "Add Service" → "GitHub Repo"
5. Select your repository
6. Configure the service:

   - **Name**: `backend-prod`
   - **Root Directory**: `packages/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

7. Add environment variables:

   ```
   MONGO_URI=<your-prod-mongodb-atlas-connection-string>
   JWT_SECRET=<different-random-32-char-string>
   JWT_REFRESH_SECRET=<different-random-32-char-string>
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL_PROD=<will-add-after-vercel-setup>
   ```

8. Copy the **Service ID** from Settings
9. Note the deployment URL (e.g., `https://banh-chung-backend-prod.up.railway.app`)

### 4. Get Railway API Token

1. Click on your profile (top right)
2. Go to "Account Settings"
3. Click "Tokens" in the sidebar
4. Click "Create New Token"
5. Name it `banh-chung-ci-cd`
6. Copy the token (you'll need this for GitHub secrets)

## Vercel Setup

### 1. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" and choose "Continue with GitHub"
3. Authorize Vercel

### 2. Import Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `packages/frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### 3. Configure Environment Variables

**For Production:**

1. Go to project Settings → Environment Variables
2. Select "Production" environment
3. Add:
   ```
   NEXT_PUBLIC_API_URL=<your-railway-prod-backend-url>/api
   ```
   Example: `https://banh-chung-backend-prod.up.railway.app/api`

**For Preview:**

1. Add another variable
2. Select "Preview" environment
3. Add:
   ```
   NEXT_PUBLIC_API_URL=<your-railway-dev-backend-url>/api
   ```
   Example: `https://banh-chung-backend-dev.up.railway.app/api`

### 4. Get Vercel Project IDs

1. In your local project, run:
   ```bash
   cd packages/frontend
   npm install -g vercel
   vercel login
   vercel link
   ```
2. This creates `.vercel/project.json` with:

   - `projectId` - This is your `VERCEL_PROJECT_ID`
   - `orgId` - This is your `VERCEL_ORG_ID`

3. Note these values for GitHub secrets

### 5. Get Vercel API Token

1. Go to Vercel dashboard
2. Click Settings → Tokens
3. Create a new token named `banh-chung-ci-cd`
4. Copy the token (you'll need this for GitHub secrets)

### 6. Update Railway with Frontend URLs

Go back to Railway:

**Dev Backend:**

1. Open `banh-chung-backend-dev` project
2. Go to Variables
3. Update `FRONTEND_URL_DEV` with your Vercel preview URL
   - Example: `https://banh-chung-git-dev-yourusername.vercel.app`

**Prod Backend:**

1. Open `banh-chung-backend-prod` project
2. Go to Variables
3. Update `FRONTEND_URL_PROD` with your Vercel production URL
   - Example: `https://banh-chung.vercel.app`

## GitHub Secrets Configuration

### 1. Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions" in left sidebar
4. Click "New repository secret" for each secret below

### 2. Add Railway Secrets

| Secret Name               | Value                   | Where to Find                             |
| ------------------------- | ----------------------- | ----------------------------------------- |
| `RAILWAY_TOKEN`           | Your Railway API token  | Railway → Account Settings → Tokens       |
| `RAILWAY_SERVICE_ID_DEV`  | Dev backend service ID  | Railway dev project → Service → Settings  |
| `RAILWAY_SERVICE_ID_PROD` | Prod backend service ID | Railway prod project → Service → Settings |

### 3. Add Vercel Secrets

| Secret Name         | Value                 | Where to Find                             |
| ------------------- | --------------------- | ----------------------------------------- |
| `VERCEL_TOKEN`      | Your Vercel API token | Vercel → Settings → Tokens                |
| `VERCEL_ORG_ID`     | Organization ID       | `.vercel/project.json` or Vercel Settings |
| `VERCEL_PROJECT_ID` | Project ID            | `.vercel/project.json` or Vercel Settings |

### 4. Generate JWT Secrets

Generate secure random strings for JWT secrets:

```bash
# Run this command twice to get two different secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add these secrets:

| Secret Name          | Value                        | Notes                      |
| -------------------- | ---------------------------- | -------------------------- |
| `JWT_SECRET`         | Random 64-char hex string    | For production JWT signing |
| `JWT_REFRESH_SECRET` | Different random 64-char hex | For refresh tokens         |

### 5. Add MongoDB Secrets

| Secret Name      | Value                          | Where to Find                               |
| ---------------- | ------------------------------ | ------------------------------------------- |
| `MONGO_URI_DEV`  | Dev MongoDB connection string  | MongoDB Atlas → Connect → Connection String |
| `MONGO_URI_PROD` | Prod MongoDB connection string | MongoDB Atlas → Connect → Connection String |

**Example MongoDB URI:**

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/flashcard-app-dev?retryWrites=true&w=majority
```

## GitHub Environments Setup

### 1. Create Development Environment

1. Go to repository Settings → Environments
2. Click "New environment"
3. Name it `development`
4. Configure:
   - **Deployment branches**: No restrictions (or select `dev` branch)
   - **Environment secrets**: None needed (uses repository secrets)
   - **Required reviewers**: None
5. Click "Configure environment" to save

### 2. Create Production Environment

1. Click "New environment"
2. Name it `production`
3. Configure:
   - **Deployment branches**: Selected branches → Add `main`
   - **Required reviewers**: Add yourself or team members (at least 1)
   - **Wait timer**: 0 minutes (optional: add 5-10 min cooldown)
4. Click "Configure environment" to save

## Branch Protection Rules

### 1. Protect Main Branch

1. Go to Settings → Branches
2. Click "Add branch protection rule"
3. Branch name pattern: `main`
4. Enable these settings:
   - ✅ **Require a pull request before merging**
     - Require approvals: 1
     - Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - Require branches to be up to date before merging
     - Add status checks: `Run Tests`
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings**
5. Click "Create"

### 2. Protect Dev Branch

1. Click "Add branch protection rule" again
2. Branch name pattern: `dev`
3. Enable these settings:
   - ✅ **Require status checks to pass before merging**
     - Add status checks: `Run Tests`
   - ✅ Allow direct pushes (for quick iterations)
4. Click "Create"

## Testing the Pipeline

### 1. Test Pull Request Workflow

```bash
# Create a feature branch
git checkout -b feature/test-ci-cd

# Make a small change
echo "# CI/CD Test" >> TEST.md
git add TEST.md
git commit -m "test: CI/CD pipeline"
git push origin feature/test-ci-cd
```

1. Open a Pull Request to `dev` branch on GitHub
2. Watch the "Run Tests" workflow execute
3. Verify tests pass
4. Merge the PR

### 2. Test Development Deployment

```bash
# Push to dev branch (or merge PR from above)
git checkout dev
git pull origin dev
```

1. Go to Actions tab on GitHub
2. Watch "Deploy to Staging (Dev)" workflow
3. Verify both backend and frontend deploy
4. Check deployment URLs in workflow output
5. Test the deployed application

### 3. Test Production Deployment

```bash
# Create PR from dev to main
git checkout main
git pull origin main
git checkout -b release/v1.0.0
git merge dev
git push origin release/v1.0.0
```

1. Open Pull Request to `main` branch
2. Verify tests pass
3. Get approval from reviewer
4. Merge the PR
5. Go to Actions tab
6. Watch "Deploy to Production" workflow
7. When it reaches approval gate, approve the deployment
8. Verify production deployment completes
9. Test production application

## Troubleshooting

### Workflow Fails on Railway Deployment

**Error**: `Railway token is invalid`

- Verify `RAILWAY_TOKEN` secret is correct
- Token might have expired - generate new one

**Error**: `Service not found`

- Verify `RAILWAY_SERVICE_ID_DEV` and `RAILWAY_SERVICE_ID_PROD` are correct
- Check service IDs in Railway dashboard → Service → Settings

### Workflow Fails on Vercel Deployment

**Error**: `Vercel token is invalid`

- Generate new token in Vercel dashboard
- Update `VERCEL_TOKEN` secret

**Error**: `Project not found`

- Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
- Run `vercel link` locally to get correct IDs

### Tests Fail

**MongoDB connection errors:**

- Tests use in-memory MongoDB
- Check that test dependencies are installed
- Verify `mongodb-memory-server` is in devDependencies

**Frontend tests fail:**

- Check Next.js environment variables
- Ensure `NEXT_PUBLIC_API_URL` is set in test environment

### CORS Errors After Deployment

1. Verify Railway environment variables include correct frontend URLs:

   - `FRONTEND_URL_DEV`
   - `FRONTEND_URL_PROD`

2. Check Vercel deployment URLs match Railway configuration

3. Redeploy backend after updating frontend URLs

## Next Steps

After successful setup:

1. ✅ All tests pass on CI
2. ✅ PRs automatically trigger test workflows
3. ✅ Dev branch auto-deploys to staging
4. ✅ Main branch requires approval before production
5. ✅ Both environments are accessible

### Optional Enhancements

- Add Slack/Discord notifications for deployments
- Set up error tracking (Sentry)
- Add performance monitoring
- Configure custom domains
- Set up database backups schedule

## Support

If you encounter issues:

1. Check workflow logs in Actions tab
2. Review Railway/Vercel deployment logs
3. Verify all secrets are correctly configured
4. Ensure branch protection rules are active
5. Open an issue in the repository
