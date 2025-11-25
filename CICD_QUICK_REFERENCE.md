# CI/CD Quick Reference Guide

Quick reference for common CI/CD tasks and commands.

## GitHub Actions Workflows

### Workflows Overview

| Workflow          | Trigger        | Purpose              | Approval Required |
| ----------------- | -------------- | -------------------- | ----------------- |
| `test.yml`        | PR to main/dev | Run tests            | No                |
| `deploy-dev.yml`  | Push to dev    | Deploy to staging    | No                |
| `deploy-prod.yml` | Push to main   | Deploy to production | Yes               |

### Workflow Status

Check workflow status: [GitHub Actions Tab](../../actions)

### Manual Triggers

**Trigger production deployment with database seed:**

```bash
# Go to Actions tab → Deploy to Production → Run workflow
# Check "Run database seed after deployment"
```

## Git Workflow

### Feature Development

```bash
# Start new feature
git checkout dev
git pull origin dev
git checkout -b feature/my-feature

# Make changes, commit
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature

# Create PR to dev → tests run automatically
# After approval, merge → auto-deploys to staging
```

### Production Release

```bash
# Create release PR
git checkout main
git pull origin main
git checkout -b release/v1.x.x
git merge dev

# Resolve conflicts if any
git push origin release/v1.x.x

# Create PR to main → tests run
# Get approval → merge → requires deployment approval → production deploy
```

### Hotfix

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# Fix bug, test locally
git add .
git commit -m "fix: critical bug"
git push origin hotfix/critical-bug

# Create PR to main → tests run
# Merge → approve deployment → production deploy

# Merge back to dev
git checkout dev
git merge main
git push origin dev
```

## Environment URLs

### Development/Staging

- **Backend**: `https://banh-chung-backend-dev.up.railway.app`
- **Frontend**: `https://banh-chung-git-dev-{username}.vercel.app`

### Production

- **Backend**: `https://banh-chung-backend-prod.up.railway.app`
- **Frontend**: `https://banh-chung.vercel.app`

## Secrets Reference

### Railway Secrets

| Secret                    | Location                                  |
| ------------------------- | ----------------------------------------- |
| `RAILWAY_TOKEN`           | Railway → Account Settings → Tokens       |
| `RAILWAY_SERVICE_ID_DEV`  | Railway Dev Project → Service → Settings  |
| `RAILWAY_SERVICE_ID_PROD` | Railway Prod Project → Service → Settings |

### Vercel Secrets

| Secret              | Location                                  |
| ------------------- | ----------------------------------------- |
| `VERCEL_TOKEN`      | Vercel → Settings → Tokens                |
| `VERCEL_ORG_ID`     | `.vercel/project.json` or Vercel Settings |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` or Vercel Settings |

### Generate JWT Secrets

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Common Tasks

### Run Tests Locally

```bash
# All tests
npm run test:all

# Backend only
npm test --workspace=backend

# Frontend only
npm test --workspace=frontend

# With coverage
npm test -- --coverage --workspace=backend
```

### Build Locally

```bash
# All packages
npm run build:all

# Backend only
npm run build --workspace=backend

# Frontend only
npm run build --workspace=frontend
```

### Deploy Manually

#### Railway (Backend)

```bash
cd packages/backend
npm install -g @railway/cli
railway login
railway link
railway up
```

#### Vercel (Frontend)

```bash
cd packages/frontend
npm install -g vercel
vercel login
vercel --prod  # For production
vercel         # For preview
```

## Monitoring & Logs

### Railway Logs

```bash
# Via CLI
railway logs

# Via Dashboard
# Go to railway.app → Project → Service → Deployments → View Logs
```

### Vercel Logs

```bash
# Via CLI
vercel logs

# Via Dashboard
# Go to vercel.com → Project → Deployments → Click deployment → Logs
```

### GitHub Actions Logs

1. Go to repository → Actions tab
2. Click on workflow run
3. Click on job to see detailed logs

## Rollback Procedures

### Railway Rollback

**Via Dashboard:**

1. Go to Railway project
2. Click on Service
3. Go to Deployments tab
4. Find previous working deployment
5. Click three dots → "Redeploy"

**Via CLI:**

```bash
railway status
railway redeploy <deployment-id>
```

### Vercel Rollback

**Via Dashboard:**

1. Go to Vercel project
2. Click Deployments
3. Find previous working deployment
4. Click three dots → "Promote to Production"

**Via CLI:**

```bash
vercel rollback
```

### Database Rollback

MongoDB Atlas has automatic backups:

1. Go to MongoDB Atlas
2. Click on Cluster
3. Go to "Backup" tab
4. Choose point-in-time to restore
5. Restore to new cluster or replace existing

## Troubleshooting

### Tests Failing

```bash
# Check test output
npm test --workspace=backend -- --verbose

# Clear cache
npm test -- --clearCache --workspace=backend

# Update snapshots (if needed)
npm test -- -u --workspace=frontend
```

### Deployment Failing

1. Check Actions tab for error logs
2. Verify secrets are set correctly
3. Check service IDs match
4. Ensure environment variables are configured

### CORS Errors

1. Check Railway environment variables:
   - `FRONTEND_URL_DEV`
   - `FRONTEND_URL_PROD`
2. Verify URLs match Vercel deployments exactly
3. Check backend `server.ts` CORS configuration
4. Redeploy backend after URL changes

### Environment Variables Not Working

**Railway:**

1. Go to project → Variables
2. Verify all required vars are set
3. Click "Redeploy" after changes

**Vercel:**

1. Go to project Settings → Environment Variables
2. Verify vars are set for correct environment (Production/Preview)
3. Redeploy after changes

## Status Checks

### Health Check Endpoints

```bash
# Backend health check
curl https://banh-chung-backend-prod.up.railway.app/api/auth/health

# Check all endpoints
curl https://banh-chung-backend-prod.up.railway.app/api/decks
```

### Test Deployments

```bash
# Test frontend
curl -I https://banh-chung.vercel.app

# Test API connection
curl https://banh-chung.vercel.app/api/auth/health
```

## Branch Protection Status

### Main Branch

- ✅ Requires PR
- ✅ Requires 1 approval
- ✅ Requires tests to pass
- ✅ Requires conversation resolution

### Dev Branch

- ✅ Requires tests to pass
- ✅ Allows direct pushes

## Emergency Procedures

### Production is Down

1. Check Railway/Vercel status pages
2. Review recent deployments
3. Check logs for errors
4. Rollback to last working deployment
5. Investigate issue on staging
6. Deploy fix when ready

### Database Connection Issues

1. Check MongoDB Atlas network access
2. Verify connection string in Railway variables
3. Check MongoDB Atlas cluster status
4. Review database logs
5. Restart Railway service if needed

### CI/CD Pipeline Broken

1. Check GitHub Actions status
2. Verify secrets haven't expired
3. Check service IDs are correct
4. Test deployment manually
5. Update secrets if needed
6. Re-run failed workflow

## Useful Commands

```bash
# Check workflow status
gh run list

# View workflow logs
gh run view <run-id> --log

# Cancel workflow
gh run cancel <run-id>

# List secrets
gh secret list

# Update secret
gh secret set SECRET_NAME

# Create PR from CLI
gh pr create --base dev --title "feat: my feature"

# Check PR status
gh pr status

# Merge PR
gh pr merge --auto --squash
```

## Contact & Support

- **Railway Support**: help.railway.app
- **Vercel Support**: vercel.com/help
- **MongoDB Support**: mongodb.com/support
- **GitHub Actions Docs**: docs.github.com/actions

## Quick Links

- [Full CI/CD Setup Guide](./CI_CD_SETUP.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Setup](./ENV_SETUP.md)
- [GitHub Actions Workflows](./.github/workflows/)
