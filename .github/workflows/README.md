# GitHub Actions Deployment Workflows

This directory contains GitHub Actions workflows for manual deployment of the frontend and backend services.

## Workflows

### 1. Deploy Frontend to Netlify (`deploy-frontend.yml`)
Manually triggers a deployment of the Next.js frontend to Netlify.

**Features:**
- Choice of production or preview deployment
- Builds Next.js with environment variables
- Deploys to Netlify with automatic invalidation
- Deployment summary in GitHub Actions UI

**Manual Trigger:**
1. Go to GitHub repository → Actions tab
2. Select "Deploy Frontend to Netlify" workflow
3. Click "Run workflow"
4. Choose environment (production/preview)
5. Click "Run workflow" button

### 2. Deploy Backend to Render (`deploy-backend.yml`)
Manually triggers a deployment of the FastAPI backend to Render.

**Features:**
- Option to clear build cache
- Uses Render deploy hooks for instant deployment
- Deployment summary with status link

**Manual Trigger:**
1. Go to GitHub repository → Actions tab
2. Select "Deploy Backend to Render" workflow
3. Click "Run workflow"
4. Toggle "Clear build cache" if needed
5. Click "Run workflow" button

## Required GitHub Secrets

Configure these secrets in your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

### Frontend Deployment Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token | Netlify Dashboard → User Settings → Applications → Personal access tokens → New access token |
| `NETLIFY_SITE_ID` | Netlify site ID | Netlify Dashboard → Site Settings → General → Site details → API ID |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://apis.darshjoshi.com/api` |
| `NEXT_PUBLIC_API_KEY` | Backend API key | Copy from Render environment variables |

### Backend Deployment Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `RENDER_DEPLOY_HOOK_URL` | Render deploy hook URL | Render Dashboard → Service → Settings → Deploy Hook → Create Deploy Hook |

## Setting Up Secrets

### Netlify Secrets

1. **Get NETLIFY_AUTH_TOKEN:**
   ```
   - Go to https://app.netlify.com/user/applications
   - Click "New access token"
   - Name it "GitHub Actions"
   - Copy the token
   - Add to GitHub Secrets as NETLIFY_AUTH_TOKEN
   ```

2. **Get NETLIFY_SITE_ID:**
   ```
   - Deploy your site first via Netlify Dashboard (manual import)
   - Go to Site Settings → General
   - Copy the "API ID" value
   - Add to GitHub Secrets as NETLIFY_SITE_ID
   ```

3. **Set Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://apis.darshjoshi.com/api
   NEXT_PUBLIC_API_KEY=<copy-from-render>
   ```

### Render Secrets

1. **Get RENDER_DEPLOY_HOOK_URL:**
   ```
   - Go to Render Dashboard → Your Service
   - Navigate to Settings
   - Scroll to "Deploy Hook" section
   - Click "Create Deploy Hook"
   - Name it "GitHub Actions"
   - Copy the webhook URL
   - Add to GitHub Secrets as RENDER_DEPLOY_HOOK_URL
   ```

## Usage Examples

### Frontend Deployment

**Production deployment:**
- Builds with production environment variables
- Deploys to production domain (apps.darshjoshi.com)
- Full cache invalidation

**Preview deployment:**
- Generates a preview URL
- Useful for testing before production
- Does not affect production site

### Backend Deployment

**Normal deployment:**
- Pulls latest code from GitHub
- Uses cached dependencies if available
- Faster deployment

**Clear cache deployment:**
- Clears all build caches
- Reinstalls all dependencies
- Useful when dependencies change or build issues occur

## Troubleshooting

### Frontend deployment fails with "Site not found"
- Check that `NETLIFY_SITE_ID` is correct
- Ensure the site exists in Netlify dashboard
- Verify `NETLIFY_AUTH_TOKEN` has not expired

### Backend deployment doesn't trigger
- Verify `RENDER_DEPLOY_HOOK_URL` is correct and complete
- Check that the deploy hook exists in Render dashboard
- Ensure the service is not already deploying

### Build fails with missing environment variables
- Verify all secrets are set in GitHub repository settings
- Check secret names match exactly (case-sensitive)
- Re-run the workflow after adding missing secrets

## Security Notes

- Never commit secrets to the repository
- Rotate tokens periodically for security
- Use separate tokens for different environments if possible
- Review workflow runs for any exposed sensitive data
