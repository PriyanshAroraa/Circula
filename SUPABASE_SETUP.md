# 🚀 Supabase Setup Guide for Circula

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** (free)
3. Sign up with GitHub/Google (or email)
4. Click **"New Project"**
5. Fill in:
   - **Name**: `circula` (or your choice)
   - **Database Password**: Save this! (you'll need it)
   - **Region**: Choose closest to you
6. Click **"Create new project"** (takes ~2 minutes)

---

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

---

## Step 3: Set Environment Variables

1. Create `.env` file in project root:
```bash
cp .env.example .env
```

2. Edit `.env` and add your keys:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=your_existing_gemini_key
```

3. **Important**: Add `.env` to `.gitignore` (already done)

---

## Step 4: Create Database Schema

### Option A: Using Supabase Dashboard (Easiest)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy and paste contents of `supabase/migrations/001_initial_schema.sql`
4. Click **"Run"**
5. ✅ Done! Your database is set up

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

---

## Step 5: Enable Authentication Providers

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable providers you want:
   - ✅ **Email** (already enabled)
   - ✅ **Google** (recommended)
   - ✅ **GitHub** (optional)
   - ✅ **Magic Link** (passwordless - already works!)

3. For OAuth providers, you'll need to:
   - Set up OAuth apps (Google Cloud Console, GitHub)
   - Add redirect URLs
   - Copy client IDs/secrets to Supabase

---

## Step 6: Test the Setup

1. Start your dev server:
```bash
npm run dev
```

2. The app should:
   - ✅ Load without errors
   - ✅ Show login/signup buttons (when not authenticated)
   - ✅ Allow creating accounts
   - ✅ Save tasks to Supabase (not localStorage)

---

## Step 7: Verify Real-time Sync

1. Open app in **two browser tabs**
2. Sign in with same account in both
3. Add a task in one tab
4. ✅ It should appear instantly in the other tab!

---

## 🔒 Security Notes

- ✅ **Row Level Security (RLS)** is enabled
- ✅ Users can only see/edit their own tasks
- ✅ `anon` key is safe to use in frontend (it's public)
- ✅ Never commit `.env` file to git

---

## 🐛 Troubleshooting

### "Supabase is not configured" error
- ✅ Check `.env` file exists
- ✅ Check variables start with `VITE_`
- ✅ Restart dev server after adding `.env`

### "Failed to fetch tasks" error
- ✅ Check database schema is created
- ✅ Check RLS policies are set up
- ✅ Check user is authenticated

### Real-time not working
- ✅ Check `supabase_realtime` publication includes `tasks` table
- ✅ Check browser console for errors
- ✅ Verify WebSocket connection in Network tab

---

## 📱 Mobile App Ready!

Once set up, your Supabase project works for:
- ✅ Web app (current)
- ✅ React Native app (future)
- ✅ Flutter app (future)
- ✅ All share the same database!

---

## 🎉 You're Done!

Your app now has:
- ✅ User authentication
- ✅ Cloud database
- ✅ Real-time sync
- ✅ Multi-device support
- ✅ Mobile-ready architecture

**Next**: Integrate auth UI into your app! 🚀

