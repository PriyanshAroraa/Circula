# ✅ Vercel Deployment Checklist

## 🎯 Quick Deploy (5 minutes)

### 1. Push to GitHub (if not already)
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

### 2. Deploy on Vercel
1. Go to: https://vercel.com/new
2. Import your GitHub repository
3. Vercel auto-detects Vite settings ✅
4. Add environment variables (see below)
5. Click "Deploy"
    
### 3. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL = https://ukwefbsbsbbdmgsqwcww.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2VmYnNic2JiZG1nc3F3Y3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDgwMjYsImV4cCI6MjA4MDAyNDAyNn0.aRQYeOYDFsOafguy_jjx1hOdWb2DXDhvxFgwEYJ7gPk
```

(Optional) If using Gemini:
```
GEMINI_API_KEY = your_key_here
```

### 4. Update Supabase Redirect URLs
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add: `https://your-app.vercel.app/auth/callback`

### 5. Redeploy
After adding env vars, redeploy from Vercel dashboard.

---

## ✅ Done!

Your app is live at: `https://your-app.vercel.app`

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

