# Deployment Checklist

Use this checklist when setting up CI/CD for the first time or deploying to a new environment.

## Initial Setup

### MongoDB Atlas

- [ ] Create MongoDB Atlas account
- [ ] Create development database cluster (M0 free tier)
- [ ] Create production database cluster (M0 free tier)
- [ ] Configure network access (allow from anywhere for Railway)
- [ ] Create database user with read/write permissions
- [ ] Copy connection strings for both databases
- [ ] Test connection strings locally

### Railway Setup

- [ ] Create Railway account (sign in with GitHub)
- [ ] Create `banh-chung-backend-dev` project
- [ ] Configure dev backend service:
  - [ ] Set root directory to `packages/backend`
  - [ ] Set build command: `npm install && npm run build`
  - [ ] Set start command: `npm start`
  - [ ] Add environment variables (see below)
  - [ ] Copy service ID
  - [ ] Note deployment URL
- [ ] Create `banh-chung-backend-prod` project
- [ ] Configure prod backend service (same as dev but different env vars)
  - [ ] Copy service ID
  - [ ] Note deployment URL
- [ ] Generate Railway API token
- [ ] Test both deployments manually

**Railway Environment Variables (Dev):**
- [ ] `MONGO_URI` - Dev database connection string
- [ ] `JWT_SECRET` - Random 64-char hex string
- [ ] `JWT_REFRESH_SECRET` - Different random 64-char hex string
- [ ] `NODE_ENV` - `development`
- [ ] `PORT` - `5000`
- [ ] `FRONTEND_URL_DEV` - (add after Vercel setup)

**Railway Environment Variables (Prod):**
- [ ] `MONGO_URI` - Prod database connection string
- [ ] `JWT_SECRET` - Different random 64-char hex string
- [ ] `JWT_REFRESH_SECRET` - Different random 64-char hex string
- [ ] `NODE_ENV` - `production`
- [ ] `PORT` - `5000`
- [ ] `FRONTEND_URL_PROD` - (add after Vercel setup)

### Vercel Setup

- [ ] Create Vercel account (sign in with GitHub)
- [ ] Import GitHub repository
- [ ] Set root directory to `packages/frontend`
- [ ] Configure production environment variables:
  - [ ] `NEXT_PUBLIC_API_URL` - Railway prod backend URL + `/api`
- [ ] Configure preview environment variables:
  - [ ] `NEXT_PUBLIC_API_URL` - Railway dev backend URL + `/api`
- [ ] Run `vercel link` locally to get project IDs
- [ ] Copy `VERCEL_ORG_ID` from `.vercel/project.json`
- [ ] Copy `VERCEL_PROJECT_ID` from `.vercel/project.json`
- [ ] Generate Vercel API token
- [ ] Note production URL
- [ ] Note preview URL pattern
- [ ] Test deployment manually

### Update Railway with Frontend URLs

- [ ] Go back to Railway dev project
  - [ ] Update `FRONTEND_URL_DEV` with Vercel preview URL
- [ ] Go to Railway prod project
  - [ ] Update `FRONTEND_URL_PROD` with Vercel production URL
- [ ] Redeploy both Railway services

### GitHub Repository Setup

#### Secrets Configuration

- [ ] Go to repository Settings → Secrets and variables → Actions
- [ ] Add Railway secrets:
  - [ ] `RAILWAY_TOKEN`
  - [ ] `RAILWAY_SERVICE_ID_DEV`
  - [ ] `RAILWAY_SERVICE_ID_PROD`
- [ ] Add Vercel secrets:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
- [ ] Add application secrets:
  - [ ] `MONGO_URI_DEV`
  - [ ] `MONGO_URI_PROD`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`

#### GitHub Environments

- [ ] Go to Settings → Environments
- [ ] Create `development` environment:
  - [ ] No deployment branch restrictions
  - [ ] No required reviewers
- [ ] Create `production` environment:
  - [ ] Deployment branch: `main` only
  - [ ] Add required reviewers (yourself/team)

#### Branch Protection

- [ ] Go to Settings → Branches → Add rule
- [ ] Protect `main` branch:
  - [ ] Require pull request before merging
  - [ ] Require 1 approval
  - [ ] Require status checks: `Run Tests`
  - [ ] Require conversation resolution
- [ ] Protect `dev` branch:
  - [ ] Require status checks: `Run Tests`
  - [ ] Allow direct pushes

## Testing CI/CD Pipeline

### Test 1: Pull Request Tests

- [ ] Create feature branch from `dev`
- [ ] Make a small change
- [ ] Push and create PR to `dev`
- [ ] Verify "Run Tests" workflow executes
- [ ] Verify all tests pass
- [ ] Merge PR

### Test 2: Development Deployment

- [ ] Ensure code is merged to `dev` branch
- [ ] Check Actions tab for "Deploy to Staging (Dev)" workflow
- [ ] Verify backend deploys to Railway dev
- [ ] Verify frontend deploys to Vercel preview
- [ ] Visit preview URLs and test application
- [ ] Check Railway logs for errors
- [ ] Check Vercel logs for errors

### Test 3: Production Deployment

- [ ] Create PR from `dev` to `main`
- [ ] Verify tests pass
- [ ] Get PR approved
- [ ] Merge PR to `main`
- [ ] Check Actions tab for "Deploy to Production" workflow
- [ ] Approve deployment when prompted
- [ ] Verify backend deploys to Railway prod
- [ ] Verify frontend deploys to Vercel production
- [ ] Visit production URLs and test application
- [ ] Verify CORS works correctly
- [ ] Test all main features:
  - [ ] User registration
  - [ ] User login
  - [ ] Create deck
  - [ ] Add flashcards
  - [ ] Review flashcards
  - [ ] View statistics

### Test 4: Rollback Procedure

- [ ] Practice rollback on Railway (find previous deployment)
- [ ] Practice rollback on Vercel (use instant rollback)
- [ ] Document rollback times and procedure

## Post-Deployment

### Seed Production Database (Optional)

- [ ] Access Railway prod service shell/terminal
- [ ] Run: `npm run seed:prod`
- [ ] Verify data is seeded correctly
- [ ] Test login with seeded users

### Monitoring Setup

- [ ] Set up Railway alerts for errors
- [ ] Enable Vercel analytics
- [ ] Monitor first week of deployments
- [ ] Check logs regularly
- [ ] Set up error tracking (optional: Sentry)

### Documentation

- [ ] Update README with deployment info
- [ ] Document environment URLs
- [ ] Create runbook for common issues
- [ ] Share access with team members

### Security Review

- [ ] Verify all secrets are properly secured
- [ ] Ensure no `.env` files in git
- [ ] Review CORS configuration
- [ ] Check MongoDB network access rules
- [ ] Verify JWT secrets are strong and unique
- [ ] Enable rate limiting (if needed)

## Maintenance Schedule

### Weekly

- [ ] Review deployment logs
- [ ] Check for failed workflows
- [ ] Monitor database size
- [ ] Review error rates

### Monthly

- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Check for security updates
- [ ] Review and optimize costs
- [ ] Database backup verification

### Quarterly

- [ ] Review access permissions
- [ ] Audit security practices
- [ ] Performance optimization
- [ ] Capacity planning

## Troubleshooting

Common issues and solutions:

### Workflow Fails

1. Check Actions tab for detailed error logs
2. Verify all secrets are correctly set
3. Check service IDs are correct
4. Ensure tokens haven't expired

### Deployment Succeeds but App Doesn't Work

1. Check environment variables on Railway/Vercel
2. Verify CORS configuration
3. Check database connection
4. Review application logs

### CORS Errors

1. Verify frontend URLs in Railway environment variables
2. Check CORS configuration in `server.ts`
3. Ensure URLs match exactly (no trailing slashes)
4. Redeploy backend after URL changes

## Emergency Contacts

- Railway Support: [railway.app/support](https://railway.app/support)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- MongoDB Atlas Support: [mongodb.com/support](https://mongodb.com/support)

## Success Criteria

Your CI/CD pipeline is fully operational when:

- ✅ All tests pass automatically on PRs
- ✅ Dev branch auto-deploys to staging without approval
- ✅ Main branch deploys to production with manual approval
- ✅ Both environments are accessible and functional
- ✅ CORS is configured correctly
- ✅ All features work in production
- ✅ Rollback procedures are tested and documented
- ✅ Team members have necessary access
- ✅ Monitoring and alerts are configured

---

**Last Updated:** {date}
**Completed By:** {name}

