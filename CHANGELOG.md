# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
