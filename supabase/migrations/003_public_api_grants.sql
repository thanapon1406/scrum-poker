-- Explicit Data API grants for Planning Poker public tables
-- Supabase now requires table grants for Data API access on new projects/tables.

-- Keep the public schema usable by the roles this app relies on.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Allow the browser app to read and write the app's core tables.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.rooms TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.participants TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.topics TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.votes TO anon, authenticated, service_role;

-- Make future public tables created by the same database role accessible by default.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;
