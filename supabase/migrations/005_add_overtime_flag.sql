-- Add overtime flag for expired estimation timers

ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS is_overtime BOOLEAN NOT NULL DEFAULT false;
