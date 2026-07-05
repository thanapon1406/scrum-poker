# 🚀 Quick Start Guide

Get your Planning Poker app running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Option A: Quick Setup (Recommended)

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Click "New Project" and create a project
3. Wait ~2 minutes for it to provision

### Option B: Use Existing Supabase Project

Skip to Step 3 if you already have a Supabase project.

## Step 3: Run Database Migration

1. In Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **"Run"**
5. You should see "Success. No rows returned"

✅ Your database is ready!

## Step 4: Get Your API Keys

1. Go to **Project Settings** → **API** in Supabase
2. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 5: Configure Environment

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

**Replace** the values with your actual Supabase credentials from Step 4.

## Step 6: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Step 7: Test It Out

1. Click **"Create Room"**
2. Enter your name and join as host
3. Share the room code with a teammate (or open in another browser tab)
4. Create a topic (as host)
5. Vote on the topic
6. Reveal votes and see the mode result
7. **Try new features:**
   - Click the edit icon (✏️) next to your name to change it
   - As host, hover over topics to see the delete button (🗑️)
   - After revealing votes, add notes/explanations as host
   - **Enable the countdown timer** when creating a topic to set a time limit
   - **Watch the timer count down** in real-time for all participants
   - **See the "Overtime" indicator** when the timer expires
   - After completing topics, click "View Session Summary" to see all results
   - Print or copy the session summary for documentation

## 🎯 Next Steps

- **Deploy to Vercel:** Push to GitHub and connect to Vercel
- **Customize:** Edit colors in `tailwind.config.js`
- **Read Docs:** Check out `README.md` and `ARCHITECTURE.md`

## 🆘 Troubleshooting

### "Room not found" error
- Make sure you ran the database migration (Step 3)
- Check that your `.env.local` has the correct Supabase URL and key

### TypeScript errors
- The errors you're seeing are because dependencies aren't installed yet
- Run `npm install` to fix them

### Real-time not working
- Realtime is enabled by default in Supabase
- Check browser console for WebSocket errors
- Verify your Supabase project is active

### Build errors
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📚 Need Help?

- 📖 Read the full [README.md](README.md)
- 🏗️ Check the [ARCHITECTURE.md](ARCHITECTURE.md)
- 🐛 Open an issue on GitHub
- 💬 Ask in discussions

**Happy Planning! 🎲✨**
