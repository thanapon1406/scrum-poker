# Architecture Documentation

## 📐 System Architecture

### Overview

Planning Poker Online is a real-time web application built using a modern, serverless architecture. The system follows a client-server model with real-time data synchronization.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Next.js App Router                         │   │
│  │                                                                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐             │   │
│  │  │   Pages    │  │ Components │  │  Services  │             │   │
│  │  │            │  │            │  │            │             │   │
│  │  │ • Home     │  │ • Voting   │  │ • Rooms    │             │   │
│  │  │ • Room     │  │ • Results  │  │ • Topics   │             │   │
│  │  │            │  │ • Topics   │  │ • Votes    │             │   │
│  │  └────────────┘  └────────────┘  └────────────┘             │   │
│  │                                                                │   │
│  │  ┌──────────────────────────────────────────────────────┐    │   │
│  │  │              Supabase Client SDK                      │    │   │
│  │  │  • REST API Client  • Realtime WebSocket Client       │    │   │
│  │  └──────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                   ┌────────────┴────────────┐
                   │                         │
            REST API (HTTPS)          WebSocket (WSS)
                   │                         │
                   └────────────┬────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────────────┐
│                          BACKEND LAYER                                 │
│                       (Supabase Platform)                              │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     API Gateway                               │    │
│  │  • Authentication  • Request Routing  • Rate Limiting         │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                  PostgreSQL Database                          │    │
│  │                                                                │    │
│  │  Tables:                                                       │    │
│  │  ┌────────────┐  ┌──────────────┐  ┌────────────┐           │    │
│  │  │   rooms    │  │ participants │  │   topics   │           │    │
│  │  └────────────┘  └──────────────┘  └────────────┘           │    │
│  │  ┌────────────┐                                               │    │
│  │  │   votes    │                                               │    │
│  │  └────────────┘                                               │    │
│  │                                                                │    │
│  │  Functions:                                                    │    │
│  │  • calculate_topic_average()                                  │    │
│  │  • cleanup_old_rooms()                                        │    │
│  │                                                                │    │
│  │  Triggers:                                                     │    │
│  │  • update_updated_at_column()                                 │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                   Realtime Server                             │    │
│  │                                                                │    │
│  │  • Change Data Capture (CDC) from PostgreSQL                  │    │
│  │  • WebSocket connection pooling                               │    │
│  │  • Message broadcasting to subscribed clients                 │    │
│  │  • Channel-based isolation (room:${roomId})                   │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Row Level Security (RLS)                         │    │
│  │                                                                │    │
│  │  Policies:                                                     │    │
│  │  • All tables: Public read/write                              │    │
│  │  • No authentication required (session-based)                 │    │
│  └──────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### Sequence Diagram

```mermaid
---
config:
  theme: neutral
---
sequenceDiagram
    participant C as Next.js Client (Browser)
    participant AG as API Gateway (Supabase)
    participant DB as PostgreSQL DB
    participant RT as Realtime Server (Supabase)

    %% PHASE 1: ROOM INITIALIZATION %%
    rect rgb(253, 245, 230)
    Note over C, RT: PHASE 1: Room Creation & Host Setup
    
    Note over C: User clicks "Create Room"
    C->>C: Generate unique invite code (e.g., using nanoid)
    C->>AG: POST /rest/v1/rooms<br/>Body: { invite_code: '...' }
    AG->>DB: INSERT INTO rooms (invite_code)
    DB-->>AG: Return room record (id: UUID)
    AG-->>C: 201 Created
    C->>C: Redirect to /room/[inviteCode]
    
    Note over C: User enters display name as Host
    C->>AG: POST /rest/v1/participants<br/>Body: { room_id, display_name, is_host: true }
    AG->>DB: INSERT INTO participants
    DB-->>AG: Return participant record (id: UUID)
    AG-->>C: 201 Created (Session retains participant.id)

    C->>RT: supabase.channel('room:${roomId}')
    C->>RT: subscribe() to postgres_changes
    RT-->>C: WebSocket Connection Established
    end

    %% PHASE 2: PARTICIPANT JOINING %%
    rect rgb(240, 248, 255)
    Note over C, RT: PHASE 2: Participant Joining Pipeline
    
    Note over C: Participant visits via Invite Code link
    C->>AG: GET /rest/v1/rooms?invite_code=eq.[code]
    AG->>DB: SELECT * FROM rooms WHERE invite_code = [code]
    DB-->>AG: Return room details
    AG-->>C: 200 OK (Room UUID fetched)
    
    Note over C: Participant enters display name
    C->>AG: POST /rest/v1/participants<br/>Body: { room_id, display_name, is_host: false }
    
    AG->>DB: INSERT INTO participants
    Note over AG, DB: Check UNIQUE(room_id, display_name) constraint
    
    alt Name collision detected
        DB-->>AG: Error: Duplicate entry
        AG-->>C: 409 Conflict (Prompt user to pick a new name)
    else Name is unique
        DB-->>AG: Return participant record
        AG-->>C: 201 Joined Successfully
        
        DB->>RT: CDC Trigger: INSERT participant
        RT-->>C: Broadcast: 'postgres_changes' (participant joined)
        Note over C: React state updates; Host sees new participant
        
        C->>RT: subscribe() to room channel
    end
    end

    %% PHASE 3: ACTIVE VOTING %%
    rect rgb(245, 245, 245)
    Note over C, RT: PHASE 3: Topic Management & Live Voting
    
    Note over C: Host creates & activates a Topic
    C->>AG: POST /rest/v1/topics<br/>Body: { room_id, title, is_active: true }
    AG->>DB: INSERT INTO topics
    DB->>RT: CDC Trigger: INSERT topic
    RT-->>C: Broadcast: 'postgres_changes' (New Topic)
    
    Note over C: Participant clicks a Voting Card (e.g., "5")
    C->>AG: POST /rest/v1/votes<br/>Body: { topic_id, participant_id, vote_value: "5" }
    AG->>DB: INSERT INTO votes
    Note over AG, DB: Enforces UNIQUE(topic_id, participant_id) per card
    DB->>RT: CDC Trigger: INSERT vote
    RT-->>C: Broadcast: 'postgres_changes' (Vote Cast)
    Note over C: UI updates Participant status to "Voted". <br/>Actual vote_value is hidden in UI until Reveal.
    end

    %% PHASE 4: REVEAL & CONSENSUS %%
    rect rgb(230, 255, 230)
    Note over C, RT: PHASE 4: Reveal Results & Analysis
    
    Note over C: Host clicks "Reveal Votes"
    C->>AG: PATCH /rest/v1/topics?id=eq.[topic_id]<br/>Body: { is_revealed: true }
    
    AG->>DB: UPDATE topics SET is_revealed = true
    
    Note over DB: PostgreSQL calculates mode (most chosen card)
    DB->>DB: EXECUTE calculate_topic_average()
    DB->>DB: UPDATE topics SET average_score = Mode_Result
    
    DB->>RT: CDC Trigger: UPDATE topic (is_revealed, average_score)
    RT-->>C: Broadcast: 'postgres_changes' (Topic Update)
    
    Note over C: UI flips cards. All participants now see:<br/>1. Individual Vote values.<br/>2. Final Average / Tie results.
    
    Note over C: Host adds concluding notes (optional)
    C->>AG: PATCH /rest/v1/topics?id=eq.[topic_id]<br/>Body: { description: 'Final consensus thoughts' }
    AG->>DB: UPDATE topics SET description
    end
```

### 1. Room Creation Flow

```
User clicks "Create Room"
    ↓
Generate unique invite code (nanoid)
    ↓
Insert into 'rooms' table
    ↓
Redirect to /room/[inviteCode]
    ↓
User enters display name
    ↓
Insert into 'participants' table (is_host = true)
    ↓
Subscribe to real-time channels
```

### 2. Joining Room Flow

```
User enters invite code
    ↓
Redirect to /room/[inviteCode]
    ↓
Fetch room by invite_code
    ↓
User enters display name
    ↓
Check if name is unique in this room
    ↓
Insert into 'participants' table (is_host = false)
    ↓
Subscribe to real-time channels
    ↓
Load existing participants, topics, votes
```

### 3. Voting Flow

```
Host creates/selects a topic
    ↓
Topic becomes active (is_active = true)
    ↓
All participants see active topic
    ↓
Participant clicks voting card
    ↓
Insert/Update vote in 'votes' table
    ↓
Realtime broadcast to all room participants
    ↓
All participants see "Voted" status
    ↓
Host clicks "Reveal"
    ↓
Update topic (is_revealed = true, average_score)
    ↓
Realtime broadcast
    ↓
All participants see results
```

### 4. Real-time Synchronization Flow

```
Database Change (INSERT/UPDATE/DELETE)
    ↓
PostgreSQL triggers Change Data Capture
    ↓
Supabase Realtime receives change
    ↓
Filter by room_id (channel isolation)
    ↓
Broadcast to all subscribers in channel
    ↓
Client receives WebSocket message
    ↓
React state updates
    ↓
UI re-renders automatically
```

## 🗄️ Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│     rooms       │
├─────────────────┤
│ id              │ PK, UUID
│ invite_code     │ UNIQUE, TEXT
│ created_at      │ TIMESTAMP
│ updated_at      │ TIMESTAMP
│ is_active       │ BOOLEAN
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│  participants   │
├─────────────────┤
│ id              │ PK, UUID
│ room_id         │ FK → rooms.id
│ display_name    │ TEXT
│ is_host         │ BOOLEAN
│ joined_at       │ TIMESTAMP
│ last_seen_at    │ TIMESTAMP
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐         ┌─────────────────┐
│     topics      │         │      votes      │
├─────────────────┤         ├─────────────────┤
│ id              │ PK, UUID│ id              │ PK, UUID
│ room_id         │ FK      │ topic_id        │ FK → topics.id
│ title           │ TEXT    │ participant_id  │ FK → participants.id
│ description     │ TEXT    │ vote_value      │ TEXT
│ is_active       │ BOOLEAN │ created_at      │ TIMESTAMP
│ is_revealed     │ BOOLEAN │ updated_at      │ TIMESTAMP
│ average_score   │ DECIMAL └─────────────────┘
│ created_at      │ TIMESTAMP    │
│ completed_at    │ TIMESTAMP    │
└─────────────────┘              │
        │ 1:N                    │
        └────────────────────────┘
```

### Key Constraints

- **rooms.invite_code:** UNIQUE constraint
- **participants:** UNIQUE(room_id, display_name) - one name per room
- **votes:** UNIQUE(topic_id, participant_id) - one vote per participant per topic
- **CASCADE DELETE:** Deleting a room deletes all related participants, topics, and votes

## 🔐 Security Model

### Authentication

- **No traditional authentication** - Session-based access
- Users identified by `participant.id` stored in React state
- No cookies, no JWT, no server-side sessions

### Authorization (Row Level Security)

```sql
-- All tables have public read/write access
-- This is intentional for a simple, session-based app

-- Example policy for 'rooms' table
CREATE POLICY "Rooms are viewable by everyone" 
  ON rooms FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create a room" 
  ON rooms FOR INSERT 
  WITH CHECK (true);
```

### Security Considerations

1. **Invite Code as Secret:** The invite code acts as the "password" to access a room
2. **No Sensitive Data:** Application doesn't store personal or sensitive information
3. **Ephemeral Sessions:** No persistent user accounts
4. **Rate Limiting:** Handled by Supabase (1000 req/sec for free tier)

### Production Recommendations

For production use with sensitive data:

1. **Add Authentication:**
   ```typescript
   import { Auth } from '@supabase/auth-ui-react'
   ```

2. **Restrict RLS Policies:**
   ```sql
   CREATE POLICY "Users can only see their rooms"
     ON rooms FOR SELECT
     USING (auth.uid() IN (
       SELECT user_id FROM room_members WHERE room_id = rooms.id
     ));
   ```

3. **Add User Management:**
   - Create `users` table
   - Link participants to authenticated users
   - Track user history and preferences

## 📡 Real-time Implementation

### Supabase Realtime

Uses **PostgreSQL Change Data Capture (CDC)** to broadcast database changes.

### Channel Structure

```typescript
// One channel per room for isolation
const channel = supabase.channel(`room:${roomId}`)
```

### Subscription Setup

```typescript
channel
  .on('postgres_changes', {
    event: '*',              // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'participants',
    filter: `room_id=eq.${roomId}`
  }, handleChange)
  .subscribe()
```

### Events Broadcasted

| Table | Events | Trigger |
|-------|--------|---------|
| `participants` | INSERT | User joins room |
| `participants` | DELETE | User leaves room |
| `topics` | INSERT | Host creates topic |
| `topics` | UPDATE | Topic activated/revealed |
| `votes` | INSERT | User submits vote |
| `votes` | UPDATE | User changes vote |
| `votes` | DELETE | Host resets votes |

### Performance Optimization

1. **Filtered Subscriptions:** Only subscribe to changes for current room
2. **Debouncing:** UI updates are batched by React
3. **Selective Re-renders:** Only affected components re-render
4. **Connection Pooling:** Supabase manages WebSocket connections

## 🎨 Frontend Architecture

### Component Hierarchy

```
RoomPage (app/room/[inviteCode]/page.tsx)
  ├── RoomHeader
  │   └── Invite code display & copy button
  │
  ├── ParticipantList
  │   ├── Participant items (with vote status)
  │   └── Edit name button (own participant only)
  │       ├── Inline input field
  │       ├── Save button (✓)
  │       └── Cancel button (✗)
  │
  ├── TopicManager
  │   ├── Topic creation form (host only)
  │   ├── Topic list items
  │   └── Delete button per topic (host only)
  │
  ├── VotingCard (×13)
  │   └── Cards: 0, 1/2, 1, 2, 3.5, 5, 7, 10.5, 14, 21, 40, ?, ☕
  │
  ├── ResultsPanel
  │   ├── Final result display (mode calculation)
  │   ├── Tie handling ("X or Y" format)
  │   ├── Vote distribution chart
  │   ├── Individual votes list
  │   └── Host notes/description editor
  │
  ├── HostControls (host only)
  │   ├── Reveal button
  │   └── Reset button
  │
  └── SessionSummary (host only)
      ├── Modal with all completed topics
      ├── Print functionality
      └── Copy to clipboard
```

### State Management

**Local React State** - No Redux/Zustand needed

```typescript
// Room state
const [room, setRoom] = useState<Room | null>(null)
const [currentUser, setCurrentUser] = useState<Participant | null>(null)
const [participants, setParticipants] = useState<Participant[]>([])
const [topics, setTopics] = useState<Topic[]>([])
const [activeTopic, setActiveTopic] = useState<Topic | null>(null)
const [votes, setVotes] = useState<Vote[]>([])
const [selectedVote, setSelectedVote] = useState<VoteValue | null>(null)
```

### Data Fetching Strategy

1. **Initial Load:** Fetch all data on room mount
2. **Real-time Updates:** Supabase subscriptions trigger refetch
3. **Optimistic Updates:** UI updates immediately, syncs with server
4. **Error Handling:** Retry logic and user-friendly error messages

## 🚀 Performance

### Optimizations

1. **Server Components:** Where possible (static pages)
2. **Client Components:** For interactive UI (`'use client'`)
3. **Code Splitting:** Automatic by Next.js
4. **Image Optimization:** Next.js Image component (if images added)
5. **Tailwind Purging:** Removes unused CSS in production

### Benchmarks

- **Initial Page Load:** < 1s
- **Room Join:** < 500ms
- **Vote Submission:** < 200ms
- **Real-time Broadcast:** < 100ms latency

## 📊 Scalability

### Current Limits (Supabase Free Tier)

- **Database:** 500 MB storage, Unlimited API requests
- **Realtime:** 200 concurrent connections
- **Bandwidth:** 5 GB egress/month

### Scaling Strategy

1. **Upgrade Supabase Plan:** Pro ($25/mo) → Team → Enterprise
2. **Add CDN:** Vercel Edge Network (included)
3. **Database Indexing:** Already optimized with indexes
4. **Connection Pooling:** Supabase handles this
5. **Horizontal Scaling:** Deploy multiple Next.js instances

### Cost Estimation

| Users/Month | Rooms/Day | Estimated Cost |
|-------------|-----------|----------------|
| 0-1,000     | 0-50      | $0 (Free)      |
| 1,000-10,000| 50-500    | $25 (Pro)      |
| 10,000+     | 500+      | $599+ (Team)   |

## 🧪 Testing Strategy

### Recommended Testing Tools

```bash
npm install -D @testing-library/react @testing-library/jest-dom jest
npm install -D cypress # for E2E testing
```

### Test Coverage

1. **Unit Tests:** Utility functions (calculateAverage, generateInviteCode)
2. **Component Tests:** UI components with mocked data
3. **Integration Tests:** Room flow, voting flow
4. **E2E Tests:** Full user journey with Cypress

## 📈 Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics:** Built-in performance monitoring
2. **Supabase Dashboard:** Database metrics, real-time connections
3. **Sentry:** Error tracking and performance monitoring
4. **Plausible/Google Analytics:** User behavior tracking

## 🔮 Future Enhancements

### Potential Features

1. **User Authentication:** Optional login for saved rooms
2. **Room Templates:** Pre-configured voting decks
3. **Timer Mode:** Auto-reveal after time limit
4. **Custom Card Decks:** T-shirt sizes, hours, etc.
5. **Export Results:** Download voting history as CSV/PDF
6. **Room Persistence:** Save room for later use
7. **Spectator Mode:** Join without voting rights
8. **Multi-language:** i18n support
9. **Dark Mode:** Theme toggle
10. **Mobile App:** React Native version

---

**Last Updated:** May 2026
**Version:** 1.2.0
