# 🔐 Google OAuth Setup for Supabase

## Overview

Supabase **handles the OAuth flow**, but you need to:
1. Create a Google OAuth app (in Google Cloud Console)
2. Get Client ID & Secret
3. Add them to Supabase

**Time**: ~10 minutes

---

## Step 1: Create Google OAuth App

### 1.1 Go to Google Cloud Console
1. Visit: https://console.cloud.google.com
2. Sign in with your Google account
3. Click **"Select a project"** → **"New Project"**
4. Name it: `Circula` (or your choice)
5. Click **"Create"**

### 1.2 Enable Google+ API
1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** (or **"Google Identity"**)
3. Click on it and click **"Enable"**

### 1.3 Create OAuth Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen first:
   - **User Type**: External (unless you have Google Workspace)
   - **App name**: `Circula`
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"**
   - **Scopes**: Click **"Save and Continue"** (default is fine)
   - **Test users**: Click **"Save and Continue"** (skip for now)
   - Click **"Back to Dashboard"**

4. Now create OAuth client:
   - **Application type**: **Web application**
   - **Name**: `Circula Web`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-domain.com
     ```
   - **Authorized redirect URIs**:
     ```
     https://ukwefbsbsbbdmgsqwcww.supabase.co/auth/v1/callback
     ```
   - Click **"Create"**

5. **Copy these values:**
   - ✅ **Client ID** (looks like: `123456789-abc...googleusercontent.com`)
   - ✅ **Client Secret** (looks like: `GOCSPX-abc...`)

---

## Step 2: Add to Supabase

### 2.1 Go to Supabase Dashboard
1. Visit: https://app.supabase.com
2. Select your project: `ukwefbsbsbbdmgsqwcww`
3. Go to **"Authentication"** → **"Providers"**

### 2.2 Enable Google Provider
1. Find **"Google"** in the list
2. Toggle it **ON**
3. Enter your credentials:
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client secret (for OAuth)**: Paste your Google Client Secret
4. Click **"Save"**

✅ **Done!** Google auth is now configured.

---

## Step 3: Test It

### 3.1 In Your App
1. Click **"Sign In"** button
2. You should see a **"Sign in with Google"** option (if we add it to the UI)
3. Click it → Google login popup appears
4. Sign in → Redirects back to your app
5. ✅ You're logged in!

### 3.2 Add Google Button to Login Modal

The `LoginModal` component already has OAuth support via `signInWithOAuth`. We just need to add a button for it!

---

## 🔧 Adding Google Button to UI

I can add a "Sign in with Google" button to your login modal. Would you like me to:

1. Add Google button to `LoginModal.tsx`
2. Add GitHub button (optional)
3. Add Apple button (optional)

---

## 📝 Important Notes

### Redirect URI Format
Supabase's redirect URI is always:
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

For your project:
```
https://ukwefbsbsbbdmgsqwcww.supabase.co/auth/v1/callback
```

### Multiple Environments
If you have dev/staging/production, add all redirect URIs:
- `http://localhost:3000` (dev)
- `https://staging.yourapp.com` (staging)
- `https://yourapp.com` (production)

### OAuth Consent Screen
- **Testing**: Works immediately
- **Production**: Needs Google verification (can take days)
- For now, you can add test users in Google Console

---

## 🚀 Quick Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth credentials
- [ ] Added redirect URI to Google Console
- [ ] Added Client ID/Secret to Supabase
- [ ] Enabled Google provider in Supabase
- [ ] Tested login flow

---

## 💡 Pro Tips

1. **Use same Google account** for Google Console and Supabase (easier)
2. **Save credentials** in password manager
3. **Test in incognito** to avoid cached sessions
4. **Check browser console** if login fails

---

## 🐛 Troubleshooting

### "redirect_uri_mismatch" Error
- ✅ Check redirect URI in Google Console matches exactly
- ✅ Must be: `https://ukwefbsbsbbdmgsqwcww.supabase.co/auth/v1/callback`

### "Access blocked" Error
- ✅ OAuth consent screen not configured
- ✅ Go back to Step 1.3 and complete consent screen

### Button Not Appearing
- ✅ Check if Google provider is enabled in Supabase
- ✅ Check browser console for errors
- ✅ Make sure you're using the latest code

---

## 🎉 Once Configured

Your users can:
- ✅ Sign in with Google (one click!)
- ✅ No password needed
- ✅ Secure OAuth flow
- ✅ Works on web + mobile

**Want me to add the Google sign-in button to your login modal?** 🚀

