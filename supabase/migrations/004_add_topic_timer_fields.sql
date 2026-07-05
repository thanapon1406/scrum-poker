-- Add persisted discussion timer fields to topics

ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS discussion_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS discussion_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS timer_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS timer_seconds INTEGER;
