-- Enable Realtime for Planning Poker tables
-- This allows Supabase Realtime to broadcast changes to subscribed clients

-- Add tables to the supabase_realtime publication
-- This enables real-time updates for all INSERT, UPDATE, and DELETE operations

ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE topics;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- Note: This is required for real-time subscriptions to work
-- All changes to these tables will now be broadcast to connected clients
