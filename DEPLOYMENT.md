# ShiftSwap - GitHub Pages Deployment Guide

## ✅ Pre-Deployment Setup (COMPLETED)
- [x] HashRouter configured for static hosting
- [x] vite.config.js updated with base path `/shiftswap/`
- [x] Deploy script added to package.json
- [x] gh-pages package installed
- [x] .env.production created with Supabase credentials
- [x] Debug console.logs removed
- [x] .env file in .gitignore

## 📋 Deployment Steps

### Step 1: Initialize Git (if not already done)
```bash
git init
```

### Step 2: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name it exactly `shiftswap` (important: must match the base path in vite.config.js)
4. **DO NOT** initialize with README
5. Click "Create repository"

### Step 3: Commit Your Code
```bash
git add .
git commit -m "Initial commit - ShiftSwap ready for deployment"
```

### Step 4: Connect to GitHub
Replace `YOUR_USERNAME` with your actual GitHub username:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shiftswap.git
git push -u origin main
```

### Step 5: Deploy to GitHub Pages
```bash
npm run deploy
```

This command will:
1. Build your app (creates optimized production files)
2. Create a `gh-pages` branch
3. Push the built files to GitHub

### Step 6: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" → "Pages" (left sidebar)
3. Under "Source", select branch: `gh-pages`
4. Click "Save"

### Step 7: Access Your Site
After 2-3 minutes, your site will be live at:
```
https://YOUR_USERNAME.github.io/shiftswap/
```

---

## 🔄 Updating Your Deployed Site

Whenever you make changes and want to deploy updates:

```bash
# 1. Commit your changes
git add .
git commit -m "Description of your changes"
git push

# 2. Deploy to GitHub Pages
npm run deploy
```

The site will update within 1-2 minutes.

---

## ⚠️ Important Notes

### Repository Name Must Match Base Path
- Repository name: `shiftswap`
- Base path in vite.config.js: `/shiftswap/`
- These MUST match!

If you want to use a different repository name (e.g., `shift-management`):
1. Change the repo name on GitHub
2. Update `vite.config.js` line 6 to: `base: '/shift-management/',`
3. Redeploy

### Using a Custom Domain (Optional)
If you want a custom domain like `shiftswap.yourcompany.com`:
1. Go to Settings → Pages on GitHub
2. Enter your custom domain
3. Follow GitHub's instructions for DNS setup
4. Update `vite.config.js` to: `base: '/',`

### Environment Variables
Your Supabase credentials are in `.env.production` and will be bundled with the app.
- The anon key is safe to expose (it's designed for client-side use)
- Your actual database is protected by Row Level Security (RLS) policies

---

## 🐛 Troubleshooting

### Issue: Page shows 404
**Solution:** Make sure you've enabled GitHub Pages in Settings → Pages

### Issue: Blank page after deployment
**Solution:** Check that the `base` path in vite.config.js matches your repo name

### Issue: Assets not loading (broken images/CSS)
**Solution:** Verify the base path is correct and redeploy

### Issue: Supabase connection errors
**Solution:** Check that .env.production has the correct credentials

---

## 📱 Testing Locally Before Deployment

To test the production build locally:
```bash
npm run build
npm run preview
```

This will show you exactly how the site will look when deployed.

---

## ✨ Your App is Ready!

All the code changes are done. Just follow the steps above to deploy!
