# Supabase Database Setup Instructions

## 🚀 Quick Setup

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign in
3. Create a new project (choose a name, database password, and region)
4. Wait for the project to be provisioned (~2 minutes)

### 2. Run the Database Migration

#### Option A: Using Supabase SQL Editor (Recommended for Beginners)
1. In your Supabase project dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" message
7. **Repeat steps 2-6** for `supabase/migrations/002_enable_realtime.sql` to enable real-time updates

#### Option B: Using Supabase CLI (Advanced)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Enable Realtime (Important!)
After running the migrations, verify that Realtime is enabled:
1. Go to **Database** → **Publications** in your Supabase dashboard
2. Make sure the `supabase_realtime` publication includes these tables:
   - ✅ `rooms`
   - ✅ `participants`
   - ✅ `topics`
   - ✅ `votes`

If any table is missing, the `002_enable_realtime.sql` migration should have added them automatically.

### 4. Get Your API Keys
1. Go to **Project Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)
3. Create a `.env.local` file in your project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 5. Verify Installation
After running the migration, you should see these tables in **Table Editor**:
- ✅ `rooms`
- ✅ `participants`
- ✅ `topics`
- ✅ `votes`

## 📊 Database Schema Overview

### Tables

#### `rooms`
Stores poker planning sessions.
- `id` (UUID, Primary Key)
- `invite_code` (TEXT, Unique) - Short code for joining
- `created_at`, `updated_at` (Timestamps)
- `is_active` (BOOLEAN)

#### `participants`
Stores users in each room.
- `id` (UUID, Primary Key)
- `room_id` (UUID, Foreign Key → rooms)
- `display_name` (TEXT)
- `is_host` (BOOLEAN)
- `joined_at`, `last_seen_at` (Timestamps)

#### `topics`
Stores stories/tasks to estimate.
- `id` (UUID, Primary Key)
- `room_id` (UUID, Foreign Key → rooms)
- `title` (TEXT)
- `description` (TEXT)
- `is_active` (BOOLEAN) - Currently voting on
- `is_revealed` (BOOLEAN) - Votes revealed
- `average_score` (DECIMAL)
- `created_at`, `completed_at` (Timestamps)

#### `votes`
Stores individual votes.
- `id` (UUID, Primary Key)
- `topic_id` (UUID, Foreign Key → topics)
- `participant_id` (UUID, Foreign Key → participants)
- `vote_value` (TEXT) - "0", "1", "2", "3", "5", "8", "13", "21", "?", "☕"
- `created_at`, `updated_at` (Timestamps)

## 🔒 Security (Row Level Security)

All tables have RLS enabled with public read/write access. This is intentional for a simple, session-based app without user authentication. In production, you may want to add more restrictive policies.

## 🛠️ Helper Functions

- `calculate_topic_average(topic_uuid)` - Calculates average of numeric votes
- `cleanup_old_rooms()` - Marks rooms older than 7 days as inactive (for maintenance)

## 📝 Notes

- The schema uses UUIDs for all primary keys
- Proper indexes are created for performance
- Cascade deletes ensure data consistency
- Timestamps are in UTC with timezone support
