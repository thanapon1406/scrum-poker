-- Planning Poker Database Schema
-- This file contains all the database migrations for the Planning Poker application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: rooms
-- Description: Stores poker planning rooms/sessions
-- =============================================
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Index for faster invite code lookups
CREATE INDEX idx_rooms_invite_code ON rooms(invite_code);
CREATE INDEX idx_rooms_created_at ON rooms(created_at DESC);

-- =============================================
-- Table: participants
-- Description: Stores users/participants in each room
-- =============================================
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  is_host BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Unique constraint: one display name per room
  UNIQUE(room_id, display_name)
);

-- Indexes for participants
CREATE INDEX idx_participants_room_id ON participants(room_id);
CREATE INDEX idx_participants_joined_at ON participants(joined_at DESC);

-- =============================================
-- Table: topics
-- Description: Stores topics/stories to be estimated
-- =============================================
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  is_revealed BOOLEAN DEFAULT false,
  average_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for topics
CREATE INDEX idx_topics_room_id ON topics(room_id);
CREATE INDEX idx_topics_is_active ON topics(is_active);
CREATE INDEX idx_topics_created_at ON topics(created_at DESC);

-- =============================================
-- Table: votes
-- Description: Stores individual votes for each topic
-- =============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  vote_value TEXT NOT NULL, -- Can be: 0, 1, 2, 3, 5, 8, 13, 21, ?, ☕
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Unique constraint: one vote per participant per topic
  UNIQUE(topic_id, participant_id)
);

-- Indexes for votes
CREATE INDEX idx_votes_topic_id ON votes(topic_id);
CREATE INDEX idx_votes_participant_id ON votes(participant_id);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Rooms: Anyone can read and insert (create new rooms)
CREATE POLICY "Rooms are viewable by everyone" 
  ON rooms FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create a room" 
  ON rooms FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update a room" 
  ON rooms FOR UPDATE 
  USING (true);

-- Participants: Anyone can read and insert (join rooms)
CREATE POLICY "Participants are viewable by everyone" 
  ON participants FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can join a room" 
  ON participants FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update participants" 
  ON participants FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete participants" 
  ON participants FOR DELETE 
  USING (true);

-- Topics: Anyone can read and insert
CREATE POLICY "Topics are viewable by everyone" 
  ON topics FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create topics" 
  ON topics FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update topics" 
  ON topics FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete topics" 
  ON topics FOR DELETE 
  USING (true);

-- Votes: Anyone can read and insert
CREATE POLICY "Votes are viewable by everyone" 
  ON votes FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can submit votes" 
  ON votes FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update votes" 
  ON votes FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete votes" 
  ON votes FOR DELETE 
  USING (true);

-- =============================================
-- Triggers
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rooms
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for votes
CREATE TRIGGER update_votes_updated_at
  BEFORE UPDATE ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to calculate average score for a topic
CREATE OR REPLACE FUNCTION calculate_topic_average(topic_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_score DECIMAL;
BEGIN
  SELECT AVG(
    CASE 
      WHEN vote_value ~ '^[0-9]+$' THEN vote_value::DECIMAL
      ELSE NULL
    END
  )
  INTO avg_score
  FROM votes
  WHERE topic_id = topic_uuid;
  
  RETURN ROUND(avg_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to clean up inactive rooms (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  UPDATE rooms
  SET is_active = false
  WHERE updated_at < NOW() - INTERVAL '7 days'
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;
