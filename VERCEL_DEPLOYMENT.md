# 🚀 Deploy Circula to Vercel

## ✅ Pre-Deployment Checklist

- [x] Build works locally (`npm run build`)
- [x] Vercel configuration created
- [ ] Environment variables ready
- [ ] GitHub repository (optional but recommended)

---

## 📋 Step 1: Prepare Your Code

### 1.1 Test Build Locally
```bash
npm run build
```

This should create a `dist` folder with your built app.

### 1.2 Commit Your Code (if using Git)
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

---

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub (or email)
3. **Click "Add New Project"**
4. **Import your repository**:
   - If your code is on GitHub, select the repository
   - If not, you can drag & drop the `dist` folder (less ideal)
5. **Configure Project**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
6. **Add Environment Variables** (see Step 3 below)
7. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Follow the prompts**:
   - Link to existing project? No (first time)
   - Project name: `circula` (or your choice)
   - Directory: `./`
   - Override settings? No

5. **Add environment variables** (see Step 3)

---

## 🔐 Step 3: Add Environment Variables

### 3.1 In Vercel Dashboard

1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

#### Required for Supabase:
```
VITE_SUPABASE_URL
https://ukwefbsbsbbdmgsqwcww.supabase.co
```

```
VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2VmYnNic2JiZG1nc3F3Y3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDgwMjYsImV4cCI6MjA4MDAyNDAyNn0.aRQYeOYDFsOafguy_jjx1hOdWb2DXDhvxFgwEYJ7gPk
```

#### Optional (if using Gemini AI):
```
GEMINI_API_KEY
your_gemini_api_key_here
```

### 3.2 Environment Types

For each variable, select:
- ✅ **Production** (for live site)
- ✅ **Preview** (for PR previews)
- ✅ **Development** (for local dev)

### 3.3 Redeploy After Adding Variables

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

Or trigger a new deployment by pushing to your repo.

---

## 🔄 Step 4: Configure OAuth Redirect URLs

### 4.1 Update Supabase Redirect URLs

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```

### 4.2 Update Google OAuth (if configured)

1. Go to Google Cloud Console → **APIs & Services** → **Credentials**
2. Edit your OAuth client
3. Add to **Authorized redirect URIs**:
   ```
   https://your-app.vercel.app
   https://ukwefbsbsbbdmgsqwcww.supabase.co/auth/v1/callback
   ```

---

## ✅ Step 5: Verify Deployment

1. **Visit your Vercel URL**: `https://your-app.vercel.app`
2. **Test features**:
   - ✅ App loads correctly
   - ✅ Sign in works
   - ✅ Tasks save to Supabase
   - ✅ Real-time sync works

---

## 🔧 Troubleshooting

### Build Fails

**Error**: "Module not found"
- ✅ Run `npm install` locally first
- ✅ Check `package.json` has all dependencies
- ✅ Commit `package-lock.json`

**Error**: "Environment variable not found"
- ✅ Add variables in Vercel dashboard
- ✅ Redeploy after adding variables
- ✅ Check variable names start with `VITE_`

### App Works Locally But Not on Vercel

**Check**:
- ✅ Environment variables are set
- ✅ Supabase URL is correct
- ✅ Browser console for errors
- ✅ Network tab for failed requests

### OAuth Not Working

**Check**:
- ✅ Redirect URLs updated in Supabase
- ✅ Redirect URLs updated in Google Console (if using Google auth)
- ✅ Vercel URL matches redirect URLs exactly

---

## 🚀 Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your domain: `circula.com` (or your domain)
3. Follow DNS setup instructions
4. Vercel handles SSL automatically

---

## 📊 Monitoring

### Vercel Analytics (Optional)
1. Go to **Analytics** tab
2. Enable Vercel Analytics (free tier available)
3. Track page views, performance, etc.

### Logs
- Go to **Deployments** → Click deployment → **Logs**
- See build logs, runtime errors, etc.

---

## 🔄 Continuous Deployment

### Automatic Deploys
- ✅ Push to `main` branch → Auto-deploy to production
- ✅ Push to other branches → Auto-deploy preview
- ✅ Open PR → Auto-deploy preview

### Manual Deploy
- Go to **Deployments** → **"..."** → **Redeploy**

---

## 💰 Vercel Pricing

### Free Tier (Hobby)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Preview deployments
- ✅ Custom domains

### When to Upgrade
- 100GB+ bandwidth/month
- Need team features
- Need advanced analytics

**For Circula**: Free tier is perfect! 🎉

---

## 🎉 You're Live!

Your app is now:
- ✅ Deployed to production
- ✅ Accessible worldwide
- ✅ Auto-deploying on git push
- ✅ SSL secured
- ✅ Fast CDN delivery

**Next Steps**:
1. Share your Vercel URL
2. Test on mobile devices
3. Monitor analytics
4. Set up custom domain (optional)

---

## 📝 Quick Reference

**Vercel Dashboard**: https://vercel.com/dashboard
**Project Settings**: Settings → General
**Environment Variables**: Settings → Environment Variables
**Deployments**: Deployments tab
**Logs**: Deployments → [deployment] → Logs

**Your App URL**: `https://your-app.vercel.app`

