# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-05-29

### Added
- **Architecture Documentation Update**: Added a highly detailed Mermaid Sequence Diagram inside `ARCHITECTURE.md` to perfectly map the Next.js Client, Supabase API Gateway, PostgreSQL DB, and Realtime Server lifecycle across 4 distinct phases (Initialization, Joining, Voting, Consensus).

## [1.1.0] - 2025-11-14

### Added
- **Session Summary**: Host can now view a comprehensive summary of all completed topics
  - View all completed topics with title, description, result, and individual votes
  - Print functionality for documentation
  - Copy to clipboard as formatted text
  - Modal dialog with clean, organized layout
  - Accessible via "View Session Summary" button after completing topics
- **Edit Participant Names**: Each participant can now edit their own display name
  - Inline editing with save/cancel buttons
  - Real-time updates across all participants
  - Name validation (2-50 characters)
  - Edit icon (✏️) only visible for your own name
- **Delete Topics (Host Only)**: Host can now delete topics
  - Delete button (🗑️) appears only for host
  - Confirmation dialog before deletion
  - UI-level restriction (host-only visibility)
- **Host Notes After Voting**: Host can add notes/explanations after revealing votes
  - Add context for conflicts or decisions
  - Saves to topic description field
  - Inline editing with save/cancel
  - Visible to all participants
  - Helpful for documenting why certain estimates were chosen

### Changed
- **Vote Calculation**: Changed from average to mode (most selected card)
- **Vote Values**: Updated deck to custom scale: 0, 1/2, 1, 2, 3.5, 5, 7, 10.5, 14, 17.5, 21, 40, ?, ☕
- **Time Estimates**: Each card now shows estimated hours
- **Tie Handling**: When votes tie, displays "X or Y" format (e.g., "7 or 10.5")
- **Card Selection UI**: Changed to white cards with blue border when selected
- **Results Display**: Label changed from "Average Score" to "Final Result"

### Fixed
- Improved code consistency by removing dynamic imports
- Better separation of concerns in component structure

## [1.0.0] - 2024-01-15

### Added
- Initial release of Planning Poker Online
- Room creation with unique invite codes
- Real-time voting with Supabase Realtime
- Modified Fibonacci voting deck (0, 1, 2, 3, 5, 8, 13, 21, ?, ☕)
- Automatic average calculation (excludes ? and ☕)
- Host controls (reveal, reset votes)
- Topic/story management
- Participant list with vote status
- Voting history per room
- Responsive design for mobile, tablet, desktop
- Clean, minimal UI inspired by planningpokeronline.com

### Technical
- Next.js 14 with App Router
- TypeScript for type safety
- Supabase for database and real-time
- Tailwind CSS for styling
- PostgreSQL database schema with RLS
- Comprehensive documentation and architecture guide

## [1.4.0] - 2026-07-05

### Added
- **Countdown Timer**: Host can now set a countdown timer when creating a topic
  - Optional timer with configurable duration (in seconds)
  - Real-time countdown display for all participants
  - Automatic overtime detection when timer expires
  - Red "Overtime" UI indicator when timer runs out
  - Discussion duration tracking (time from activation to reveal)
  - Overtime flag displayed in session summary and results panel
- **Timer Fields in Database**: New columns added to `topics` table
  - `timer_enabled` (BOOLEAN) - Whether timer is enabled for the topic
  - `timer_seconds` (INTEGER) - Duration of the timer in seconds
  - `discussion_started_at` (TIMESTAMPTZ) - When the topic was activated
  - `discussion_duration_seconds` (INTEGER) - Actual discussion duration
  - `is_overtime` (BOOLEAN) - Whether the timer expired before reveal
- **Utility Functions**: New helper functions in `lib/utils.ts`
  - `formatDuration()` - Formats seconds into human-readable string (e.g., "4m 12s")
  - `formatRelativeTime()` - Formats timestamps to relative time strings

### Changed
- **Topic Creation Form**: Added timer checkbox and seconds input for host
- **Topic List Items**: Shows countdown timer for active topics, overtime indicator, and discussion duration
- **Results Panel**: Displays discussion time and overtime badge
- **Session Summary**: Shows discussion time and overtime status per topic
- **Room Page**: Client-side timer tick with `setInterval` for countdown synchronization
- **Database Migrations**: Added migrations 004 and 005 for timer fields

## [Unreleased]

### Planned
- User authentication (optional)
- Dark mode
- Custom voting decks
- Export voting history
- Multi-language support
- Mobile app (React Native)

---

For more details, see the [GitHub Releases](https://github.com/yourusername/planningpokeronlineforfree/releases) page.
