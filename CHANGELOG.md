# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-14

### Added
- **Edit Participant Names**: Each participant can now edit their own display name
  - Inline editing with save/cancel buttons
  - Real-time updates across all participants
  - Name validation (2-50 characters)
  - Edit icon (✏️) only visible for your own name
- **Delete Topics (Host Only)**: Host can now delete topics
  - Delete button (🗑️) appears only for host
  - Confirmation dialog before deletion
  - UI-level restriction (host-only visibility)

### Changed
- **Vote Calculation**: Changed from average to mode (most selected card)
- **Vote Values**: Updated deck to custom scale: 0, 1/2, 1, 2, 3.5, 5, 7, 10.5, 14, 21, 40, ?, ☕
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

## [Unreleased]

### Planned
- User authentication (optional)
- Dark mode
- Custom voting decks
- Export voting history
- Timer mode for auto-reveal
- Multi-language support
- Mobile app (React Native)

---

For more details, see the [GitHub Releases](https://github.com/yourusername/planningpokeronlineforfree/releases) page.
