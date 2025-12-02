# GitHub Actions Workflows

This directory contains the CI/CD workflows for the Bánh Chưng flashcard application.

## Workflows

### 1. test.yml - Run Tests

**Triggers:**
- Pull requests to `main` or `dev` branches
- Direct pushes to `main` or `dev` branches

**Purpose:**
- Ensures code quality by running all tests
- Blocks PRs from merging if tests fail
- Runs backend tests with coverage
- Runs frontend tests

**Jobs:**
- `test`: Runs all test suites for both backend and frontend

**Environment Variables:**
- Uses test-specific environment variables
- No secrets required (uses local test database)

### 2. deploy-dev.yml - Deploy to Staging

**Triggers:**
- Push to `dev` branch only

**Purpose:**
- Automatically deploys to staging environment
- No manual approval required
- Fast feedback for development

**Jobs:**
1. `test`: Runs all tests first
2. `deploy-backend`: Deploys backend to Railway dev environment
3. `deploy-frontend`: Deploys frontend to Vercel preview environment

**Required Secrets:**
- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE_ID_DEV`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Environment:**
- Uses `development` GitHub environment
- No protection rules

### 3. deploy-prod.yml - Deploy to Production

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch (with optional database seed)

**Purpose:**
- Deploys to production environment
- Requires manual approval before deployment
- Ensures production stability

**Jobs:**
1. `test`: Runs all tests first
2. `deploy-backend`: Deploys backend to Railway production
   - Requires approval via `production` environment
3. `deploy-frontend`: Deploys frontend to Vercel production
   - Requires approval via `production` environment

**Required Secrets:**
- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE_ID_PROD`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

**Environment:**
- Uses `production` GitHub environment
- Requires reviewer approval
- Limited to `main` branch only

**Manual Workflow Options:**
- `seed_database`: Optional flag to run database seeding after deployment

## Environment Setup

### GitHub Environments

Two environments must be configured in repository settings:

#### Development
- **Name**: `development`
- **Deployment branches**: Any branch or specific branches (dev)
- **Required reviewers**: None
- **Wait timer**: 0 minutes

#### Production
- **Name**: `production`
- **Deployment branches**: `main` only
- **Required reviewers**: At least 1 team member
- **Wait timer**: 0 minutes (or add delay if desired)

### Repository Secrets

Configure these secrets in repository Settings → Secrets and variables → Actions:

| Secret Name | Description | How to Obtain |
|-------------|-------------|---------------|
| `RAILWAY_TOKEN` | Railway API token | Railway dashboard → Account Settings → Tokens |
| `RAILWAY_SERVICE_ID_DEV` | Dev backend service ID | Railway dev project → Service → Settings |
| `RAILWAY_SERVICE_ID_PROD` | Prod backend service ID | Railway prod project → Service → Settings |
| `VERCEL_TOKEN` | Vercel API token | Vercel dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | Run `vercel link` → check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Vercel project ID | Run `vercel link` → check `.vercel/project.json` |

## Workflow Execution Flow

### Pull Request Flow

```
Developer creates PR → test.yml runs → Tests pass/fail → PR can be merged (if passed)
```

### Development Deployment Flow

```
Merge to dev → deploy-dev.yml triggers
  ↓
Run tests
  ↓
Deploy backend to Railway (dev)
  ↓
Deploy frontend to Vercel (preview)
  ↓
Comment deployment URLs on commit
```

### Production Deployment Flow

```
Merge to main → deploy-prod.yml triggers
  ↓
Run tests
  ↓
Wait for manual approval (via GitHub Environment)
  ↓
Reviewer approves
  ↓
Deploy backend to Railway (prod)
  ↓
Deploy frontend to Vercel (prod)
  ↓
Comment deployment URLs on commit
  ↓
Create deployment summary
```

## Monitoring Workflows

### Via GitHub UI

1. Go to repository → **Actions** tab
2. View all workflow runs
3. Click on specific run for details
4. View logs for each job

### Via GitHub CLI

```bash
# List recent runs
gh run list

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Watch running workflow
gh run watch
```

## Manual Workflow Execution

### Via GitHub UI

1. Go to Actions tab
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Choose branch (main)
5. Optionally check "Run database seed"
6. Click "Run workflow"

### Via GitHub CLI

```bash
# Trigger production deployment
gh workflow run deploy-prod.yml

# Trigger with database seed
gh workflow run deploy-prod.yml -f seed_database=true
```

## Troubleshooting

### Tests Fail

**Symptoms:** Red X on PR, workflow fails at test step

**Solutions:**
1. Check test logs in Actions tab
2. Run tests locally: `npm run test:all`
3. Fix failing tests
4. Push changes → tests re-run automatically

### Deployment Fails

**Railway deployment fails:**
- Verify `RAILWAY_TOKEN` is valid
- Check `RAILWAY_SERVICE_ID_DEV/PROD` are correct
- Ensure Railway project is active
- Check Railway service logs

**Vercel deployment fails:**
- Verify `VERCEL_TOKEN` is valid
- Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`
- Ensure Vercel project exists
- Check Vercel build logs

### Approval Not Showing

**Symptoms:** Production workflow stuck, no approval prompt

**Solutions:**
1. Check GitHub Environments are configured
2. Verify you're added as required reviewer
3. Ensure `production` environment exists
4. Check workflow is using correct environment name

### Secrets Not Working

**Symptoms:** Workflow fails with "secret not found" or authentication errors

**Solutions:**
1. Verify secrets are added in Settings → Secrets
2. Check secret names match exactly (case-sensitive)
3. Ensure no extra spaces in secret names
4. Re-create secrets if needed

## Best Practices

### Commit Messages

Use conventional commits for better changelog generation:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test updates
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

### Pull Requests

- Keep PRs small and focused
- Wait for tests to pass before requesting review
- Include description of changes
- Link related issues
- Test changes on staging before merging to main

### Deployments

- Always deploy to staging (dev) first
- Test thoroughly on staging
- Create PR from dev to main for production
- Get code review before production deployment
- Monitor logs after production deployment

## Workflow Maintenance

### Updating Workflows

1. Create feature branch
2. Edit workflow files in `.github/workflows/`
3. Test changes (workflows will run on feature branch)
4. Create PR with workflow changes
5. Merge to dev first, test thoroughly
6. Merge to main when confirmed working

### Secrets Rotation

Regularly rotate secrets for security:

1. Generate new token/secret
2. Update in GitHub repository secrets
3. Update in Railway/Vercel if applicable
4. Test deployment to ensure it works
5. Revoke old token/secret

**Recommended rotation schedule:**
- API tokens: Every 90 days
- JWT secrets: Every 180 days (coordinate with deployment)
- Passwords: Every 90 days

## Support

For issues with:
- **Workflows**: Check [GitHub Actions documentation](https://docs.github.com/actions)
- **Railway**: Contact [Railway support](https://railway.app/help)
- **Vercel**: Contact [Vercel support](https://vercel.com/support)

## Related Documentation

- [CI/CD Setup Guide](../../CI_CD_SETUP.md)
- [Deployment Checklist](../../DEPLOYMENT_CHECKLIST.md)
- [Quick Reference](../../CICD_QUICK_REFERENCE.md)

