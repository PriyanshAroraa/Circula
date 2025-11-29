# 🔧 Update Supabase Redirect URLs for circulea.vercel.app

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Supabase Dashboard
1. Visit: https://app.supabase.com
2. **Select your project**: `ukwefbsbsbbdmgsqwcww`

### Step 2: Update Redirect URLs
1. Go to: **Authentication** → **URL Configuration**
2. In the **"Redirect URLs"** section, you should see:
   ```
   http://localhost:3000
   ```
3. **Add your production URL**:
   ```
   https://circulea.vercel.app/auth/callback
   ```
4. **Keep localhost for development**:
   ```
   http://localhost:3000/auth/callback
   ```
5. **Click "Save"**

### Step 3: Verify
Your Redirect URLs should now include:
- ✅ `http://localhost:3000/auth/callback` (for local dev)
- ✅ `https://circulea.vercel.app/auth/callback` (for production)

---

## 🎯 What This Does

This tells Supabase that it's safe to redirect OAuth callbacks to:
- Your local dev environment
- Your production Vercel domain

**Without this**, Supabase will reject OAuth redirects from `circulea.vercel.app` for security reasons.

---

## ✅ Done!

After saving, OAuth and magic links will work on:
- ✅ https://circulea.vercel.app
- ✅ http://localhost:3000

**Test it**: Try signing in with Google or magic link on your live site!

