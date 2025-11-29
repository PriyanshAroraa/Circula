# 🚀 Quick Start - Supabase Setup

## ✅ Step 1: Create `.env` File

Create a file named `.env` in your project root with:

```env
VITE_SUPABASE_URL=https://ukwefbsbsbbdmgsqwcww.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2VmYnNic2JiZG1nc3F3Y3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDgwMjYsImV4cCI6MjA4MDAyNDAyNn0.aRQYeOYDFsOafguy_jjx1hOdWb2DXDhvxFgwEYJ7gPk
```

**Important**: The `.env` file is already in `.gitignore` so it won't be committed to git.

---

## ✅ Step 2: Set Up Database Schema

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
6. Click **"Run"** (or press Ctrl+Enter)
7. ✅ You should see "Success. No rows returned"

This creates:
- ✅ `tasks` table
- ✅ Row Level Security (RLS) policies
- ✅ Real-time subscriptions
- ✅ Auto-update timestamps

---

## ✅ Step 3: Test It!

1. Restart your dev server:
```bash
npm run dev
```

2. Check browser console - you should see:
   - ✅ No "Supabase is not configured" warnings
   - ✅ Supabase client initialized

3. The app will still work with localStorage until we integrate auth!

---

## 🎯 Next: Integrate Auth

Once the database is set up, we'll:
1. Add auth UI to your app
2. Replace localStorage with Supabase
3. Enable real-time sync

**Ready?** Let me know when you've run the SQL migration! 🚀

