# 🎲 Planning Poker Online for Free

A fast, simple, and free Planning Poker application for agile teams. Estimate your user stories in real-time with your distributed team.

![Planning Poker](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

- **🚀 Instant Room Creation** - Create a room with one click, no sign-up required
- **🔗 Simple Invite Codes** - Share a short code to invite team members
- **⚡ Real-time Synchronization** - All votes sync instantly using Supabase Realtime
- **🎯 Modified Fibonacci Deck** - Standard estimation cards: 0, 1, 2, 3, 5, 8, 13, 21, ?, ☕
- **📊 Automatic Averaging** - Calculates average scores automatically (excludes ? and ☕)
- **📜 Voting History** - Track all estimated topics and their final scores
- **👥 Participant Status** - See who has voted in real-time
- **🎨 Clean, Minimal UI** - Inspired by planningpokeronline.com
- **📱 Responsive Design** - Works on desktop, tablet, and mobile

## 🏗️ Architecture

### Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Database & Backend:** [Supabase](https://supabase.com/)
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **TypeScript:** Full type safety
- **Deployment:** [Vercel](https://vercel.com/) (recommended)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       User's Browser                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (React Components)           │  │
│  │  • Home Page  • Room Page  • UI Components            │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             Supabase Client Library                   │  │
│  │  • REST API calls  • Realtime subscriptions           │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ HTTPS / WebSocket
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                      │  │
│  │  Tables: rooms, participants, topics, votes           │  │
│  │  Functions: calculate_topic_average, cleanup_old_rooms│  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Realtime Server (WebSocket)                │  │
│  │  • Broadcasts database changes to all subscribers     │  │
│  │  • Channels per room for isolated updates             │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Row Level Security (RLS) Policies             │  │
│  │  • Public read/write for session-based access         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

```sql
┌──────────────┐         ┌──────────────────┐
│    rooms     │         │  participants    │
├──────────────┤         ├──────────────────┤
│ id (PK)      │◄───────┤│ room_id (FK)     │
│ invite_code  │         │ id (PK)          │
│ created_at   │         │ display_name     │
│ updated_at   │         │ is_host          │
│ is_active    │         │ joined_at        │
└──────────────┘         │ last_seen_at     │
                         └──────────────────┘
                                 ▲
                                 │
                         ┌───────┴─────────┐
                         │                 │
                  ┌──────────────┐  ┌──────────────┐
                  │    topics    │  │    votes     │
                  ├──────────────┤  ├──────────────┤
                  │ id (PK)      │  │ id (PK)      │
              ┌──►│ room_id (FK) │  │ topic_id (FK)│───┐
              │   │ title        │◄─┤ participant  │   │
              │   │ description  │  │   _id (FK)   │───┘
              │   │ is_active    │  │ vote_value   │
              │   │ is_revealed  │  │ created_at   │
              │   │ average_score│  │ updated_at   │
              │   │ created_at   │  └──────────────┘
              │   │ completed_at │
              │   └──────────────┘
              │
              └───── One active topic per room
```

### Real-Time Data Flow

```
1. User Action (e.g., Submit Vote)
         ▼
2. Supabase Client sends INSERT/UPDATE to PostgreSQL
         ▼
3. Database triggers Realtime notification
         ▼
4. Realtime server broadcasts to room channel subscribers
         ▼
5. All connected clients receive update
         ▼
6. React components re-render with new data
```

### Component Breakdown

```
app/
├── layout.tsx                 # Root layout
├── page.tsx                   # Home page (create/join room)
├── globals.css                # Global styles
└── room/
    └── [inviteCode]/
        └── page.tsx           # Main room interface

components/
├── VotingCard.tsx             # Individual voting card (0-21, ?, ☕)
├── ParticipantList.tsx        # Shows all participants and vote status
├── TopicManager.tsx           # Create/select topics (host only)
├── ResultsPanel.tsx           # Display revealed votes & average
├── HostControls.tsx           # Reveal/Reset buttons (host only)
└── RoomHeader.tsx             # Room info & invite code

lib/
├── supabase.ts                # Supabase client initialization
└── utils.ts                   # Helper functions (generate code, calculate avg)

types/
├── database.types.ts          # Auto-generated from Supabase
└── index.ts                   # Application types & interfaces
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A [Supabase](https://supabase.com) account (free tier works!)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd planningpokeronlineforfree
```

### 2. Install Dependencies

**Option A: Quick Setup (Recommended)**

```bash
./setup.sh
```

This will install dependencies and create your `.env.local` file.

**Option B: Manual Setup**

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

#### 3.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign in
3. Create a new project
4. Wait for provisioning (~2 minutes)

#### 3.2 Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**

For detailed instructions, see [supabase/README.md](supabase/README.md)

#### 3.3 Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** and **Anon Key**

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 How to Use

### Creating a Room

1. Go to the home page
2. Click **"Create Room"**
3. You'll be redirected to your new room with a unique invite code
4. Enter your display name to join as the **host**

### Inviting Team Members

1. Share the **invite code** or the full URL with your team
2. Team members enter the code on the home page or use the direct link
3. They enter their display name and join the room

### Estimating Stories

1. **Host:** Add a topic/story in the "Topics" section
2. **Host:** Click on a topic to make it active
3. **All Participants:** Select a card to vote
4. **Host:** Click **"Reveal Votes"** when everyone has voted
5. See the average score and individual votes
6. **Host:** Click **"Reset Votes"** to vote again or select a new topic

### Voting Cards

- **0, 1, 2, 3, 5, 8, 13, 21** - Modified Fibonacci sequence for story points
- **?** - "I don't know" or "Need more information"
- **☕** - "Let's take a break"

Only numeric votes (0-21) are included in the average calculation.

## 🎨 Customization

### Changing Vote Values

Edit `types/index.ts`:

```typescript
export const VOTE_VALUES = [
  '0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'
] as const
```

### Changing Colors

Edit `tailwind.config.js` to customize the primary color:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your color palette
      }
    }
  }
}
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **"New Project"**
4. Import your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/planningpokeronlineforfree)

### Other Deployment Options

- **Netlify:** Works great with Next.js
- **Railway:** Simple deployment with PostgreSQL
- **Self-hosted:** Use `npm run build` and `npm start`

## 📚 API Reference

### Supabase Realtime Events

The app subscribes to these database events:

```typescript
// Participants table
supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'participants',
    filter: `room_id=eq.${roomId}`
  }, handleParticipantChange)
  .subscribe()

// Topics table
.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'topics',
    filter: `room_id=eq.${roomId}`
  }, handleTopicChange)

// Votes table
.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'votes'
  }, handleVoteChange)
```

### Key Functions

```typescript
// Generate unique invite code
generateInviteCode(length?: number): string

// Calculate average of numeric votes
calculateAverage(votes: string[]): number | null

// Copy text to clipboard
copyToClipboard(text: string): Promise<boolean>

// Get vote card color based on value
getVoteCardColor(value: string): string
```

## 🔒 Security

- **No Authentication Required:** Users provide a display name per session
- **Row Level Security (RLS):** Enabled on all tables with public policies
- **Session-based Access:** Room data is accessible to anyone with the invite code
- **No Sensitive Data:** No personal information is stored

> **Note:** This is designed for internal team use. For production use with sensitive data, consider adding authentication and more restrictive RLS policies.

## 🛠️ Troubleshooting

### "Room not found" error

- Check that the database migration was run successfully
- Verify your Supabase credentials in `.env.local`

### Real-time updates not working

- Ensure Realtime is enabled in your Supabase project (it is by default)
- Check browser console for WebSocket connection errors
- Verify RLS policies are set correctly

### TypeScript errors

- Run `npm run type-check` to see all type errors
- Make sure all dependencies are installed
- Check that `database.types.ts` matches your database schema

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by [planningpokeronline.com](https://planningpokeronline.com)
- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

Have questions or suggestions? Open an issue or reach out!

---

**Made with ❤️ for agile teams everywhere**
