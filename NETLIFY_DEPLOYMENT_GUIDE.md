# Smart Zambia - Netlify Deployment Guide

This guide covers deploying Smart Zambia to Netlify with Supabase backend integration.

## Prerequisites

- Netlify account (free tier is sufficient)
- Supabase project set up (follow `supabase/SETUP_GUIDE.md`)
- Git repository with Smart Zambia code
- Node.js 18+ installed locally

## Step 1: Prepare Local Environment

### 1.1 Install Dependencies

```bash
cd smart-zambia
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client
- `stripe` - Payment processing
- Vite and build tools

### 1.2 Create Environment File

```bash
cd smart-zambia-frontend
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 1.3 Test Local Build

```bash
cd ..
npm run build
```

This should create a `smart-zambia-frontend/dist` folder with the built application.

### 1.4 Test Local Preview

```bash
npm run preview
```

Visit `http://localhost:4173` to verify the build works.

## Step 2: Push to Git

### 2.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit with Supabase integration"
```

### 2.2 Push to GitHub/GitLab/Bitbucket

```bash
git remote add origin https://github.com/your-username/smart-zambia.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended for first deployment)

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select the `smart-zambia` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `smart-zambia-frontend/dist`
   - **Node version**: `18`
6. Click "Deploy site"

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

## Step 4: Configure Environment Variables

### 4.1 Add Environment Variables in Netlify Dashboard

1. Go to your site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment variables**
3. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | e.g., `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Found in Supabase dashboard → API |

### 4.2 Redeploy After Adding Variables

After adding environment variables, trigger a new deployment:
- Go to **Deploys** → Click **Trigger deploy** → **Deploy site**

## Step 5: Verify Deployment

1. Visit your Netlify URL (e.g., `https://smart-zambia.netlify.app`)
2. Test the authentication flow:
   - Click "Sign In" or "Sign Up"
   - Should redirect to `auth.html`
   - Test email/password login
3. Check browser console for any errors
4. Verify Supabase connection is working

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `smartzambia.com`)
4. Follow DNS instructions provided by Netlify

### 6.2 Enable HTTPS

Netlify automatically provides HTTPS certificates for custom domains via Let's Encrypt.

## Step 7: Configure Redirects

The `netlify.toml` file already includes necessary redirects:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures all routes work with client-side routing.

## Step 8: Configure Security Headers

The `netlify.toml` file already includes security headers:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Step 9: Set Up Automatic Deployments

Netlify automatically deploys when you push to Git:

- **Main branch**: Production deployment
- **Other branches**: Preview deployments (deploy previews)

### Branch Configuration

1. Go to **Site settings** → **Build & deploy** → **Continuous Deployment** → **Branches**
2. Configure which branches to deploy automatically

## Step 10: Monitor and Debug

### 10.1 View Deployment Logs

1. Go to **Deploys** → Click on a deployment
2. View build logs for errors

### 10.2 View Function Logs

If using Netlify Functions (for Supabase Edge Functions):
1. Go to **Functions** → **Functions log**

### 10.3 Enable Analytics

1. Go to **Site settings** → **Analytics**
2. Enable Netlify Analytics (free tier available)

## Troubleshooting

### Build Fails

**Issue**: Build fails with "Module not found" error

**Solution**:
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Build fails with Vite errors

**Solution**: Check `vite.config.js` paths are correct:
- `root: 'smart-zambia-frontend'`
- `publicDir: 'smart-zambia-frontend/public'`
- `outDir: 'smart-zambia-frontend/dist'`

### Environment Variables Not Working

**Issue**: Supabase connection fails

**Solution**:
1. Verify environment variables are set in Netlify dashboard
2. Ensure variables start with `VITE_` prefix
3. Trigger a new deployment after adding variables
4. Check build logs to confirm variables are loaded

### 404 Errors on Routes

**Issue**: Direct links to routes show 404

**Solution**: Ensure `netlify.toml` has the redirect:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Authentication Not Working

**Issue**: Auth redirects not working

**Solution**:
1. Check Supabase auth URL is correct
2. Verify redirect URLs in Supabase dashboard:
   - Add your Netlify URL to allowed redirect URLs
   - Format: `https://your-site.netlify.app/auth/callback`
3. Check browser console for CORS errors

### Service Worker Issues

**Issue**: Old service worker caching issues

**Solution**:
1. Update `sw.js` version
2. Clear browser cache
3. Unregister service worker in DevTools

## Netlify vs Vercel Comparison

| Feature | Netlify | Vercel |
|---------|--------|--------|
| Free tier | 100GB bandwidth/month | 100GB bandwidth/month |
| Build time | 300 min/month | 6,000 min/month |
| Functions | 125k invocations/month | 100k invocations/month |
| Edge Functions | Yes | Yes |
| Preview deployments | Yes | Yes |
| Custom domains | Unlimited | Unlimited |
| HTTPS | Automatic | Automatic |
| CLI | Powerful | Simple |

**Recommendation**: Both are excellent. Netlify has better CLI and form handling. Vercel has better Next.js integration.

## CI/CD Pipeline

### Automatic Testing Before Deploy

Add a `netlify.toml` hook:

```toml
[build]
  command = "npm run test && npm run build"
```

### Deploy Preview on Pull Requests

Netlify automatically creates deploy previews for pull requests. Reviewers can test changes before merging.

## Performance Optimization

### Enable Asset Optimization

Netlify automatically:
- Minifies HTML, CSS, JS
- Optimizes images
- Gzips assets
- Uses CDN

### Enable Brotli Compression

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Encoding = "br"
```

## Backup and Rollback

### Automatic Backups

Netlify keeps:
- All deploy history
- Ability to rollback to any previous deploy
- Unlimited deploys on free tier

### Manual Rollback

1. Go to **Deploys**
2. Click on a previous deployment
3. Click **Publish deploy** → **Republish**

## Monitoring

### Set Up Uptime Monitoring

1. Go to **Site settings** → **Monitoring**
2. Enable uptime monitoring (free tier available)

### Set Up Alerts

1. Go to **Site settings** → **Notifications**
2. Configure email/Slack alerts for:
   - Deploy failures
   - Form submissions
   - Function errors

## Cost Summary

**Free Tier** (sufficient for MVP):
- 100GB bandwidth/month
- 300 min build time/month
- 125k function invocations/month
- Unlimited sites
- SSL certificates
- CDN

**Estimated Cost for Production**:
- Pro plan: $19/month (500GB bandwidth, 1000 min build time)
- Additional bandwidth: $0.15/GB

## Next Steps

After successful deployment:

1. **Test all features** thoroughly
2. **Set up monitoring** and alerts
3. **Configure custom domain**
4. **Enable analytics** (Google Analytics 4)
5. **Set up error tracking** (Sentry)
6. **Implement CI/CD** with testing
7. **Document deployment process**

## Support

- Netlify Docs: https://docs.netlify.com
- Netlify Community: https://community.netlify.com
- Supabase Docs: https://supabase.com/docs
