# 🔧 Update Redirect URLs for circulea.vercel.app

## ✅ Step 1: Update Supabase Redirect URLs

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**: `ukwefbsbsbbdmgsqwcww`
3. **Go to**: Authentication → URL Configuration
4. **Add to "Redirect URLs"**:
   ```
   https://circulea.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
5. **Click "Save"**

---

## ✅ Step 2: Update Google OAuth (if configured)

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Navigate to**: APIs & Services → Credentials
3. **Click on your OAuth 2.0 Client ID**
4. **Add to "Authorized redirect URIs"**:
   ```
   https://circulea.vercel.app
   https://ukwefbsbsbbdmgsqwcww.supabase.co/auth/v1/callback
   http://localhost:3000
   ```
5. **Click "Save"**

---

## ✅ Step 3: Update Auth Service (if needed)

The auth service should automatically use the current domain. But let's verify it's using `window.location.origin`.

---

## 🧪 Test

1. Visit: https://circulea.vercel.app
2. Click "Sign In"
3. Try OAuth (Google/GitHub) - should redirect correctly
4. Try email/password - should work
5. Try magic link - should work

---

## ✅ Done!

Your auth should now work with `https://circulea.vercel.app`! 🎉

