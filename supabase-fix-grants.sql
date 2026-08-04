-- ============================================================
-- FIX: Grant table permissions to anon role
-- Run this in Supabase SQL Editor
-- ============================================================

-- Grant access to all tables for anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON friend_requests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON rooms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON players TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON votes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON room_invites TO anon, authenticated;

-- Ensure sequences are accessible (for UUID generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure RLS policies exist for friend_requests
DROP POLICY IF EXISTS "Anyone can view friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Anyone can create friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Anyone can update friend requests" ON friend_requests;

CREATE POLICY "Anyone can view friend requests" ON friend_requests
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create friend requests" ON friend_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update friend requests" ON friend_requests
  FOR UPDATE USING (true);

-- Ensure RLS policies exist for rooms
DROP POLICY IF EXISTS "Rooms are publicly viewable" ON rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON rooms;
DROP POLICY IF EXISTS "Rooms can be updated by anyone in game" ON rooms;
DROP POLICY IF EXISTS "Rooms can be deleted" ON rooms;

CREATE POLICY "Rooms are publicly viewable" ON rooms
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON rooms
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Rooms can be updated by anyone in game" ON rooms
  FOR UPDATE USING (true);
CREATE POLICY "Rooms can be deleted" ON rooms
  FOR DELETE USING (true);

-- Ensure RLS policies exist for players
DROP POLICY IF EXISTS "Players visible to room members" ON players;
DROP POLICY IF EXISTS "Anyone can add players" ON players;
DROP POLICY IF EXISTS "Players can be updated" ON players;
DROP POLICY IF EXISTS "Players can be removed" ON players;

CREATE POLICY "Players visible to room members" ON players
  FOR SELECT USING (true);
CREATE POLICY "Anyone can add players" ON players
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Players can be updated" ON players
  FOR UPDATE USING (true);
CREATE POLICY "Players can be removed" ON players
  FOR DELETE USING (true);

-- Ensure RLS policies exist for messages
DROP POLICY IF EXISTS "Messages visible to room members" ON messages;
DROP POLICY IF EXISTS "Anyone can add messages" ON messages;

CREATE POLICY "Messages visible to room members" ON messages
  FOR SELECT USING (true);
CREATE POLICY "Anyone can add messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Ensure RLS policies exist for votes
DROP POLICY IF EXISTS "Votes visible to room members" ON votes;
DROP POLICY IF EXISTS "Anyone can submit votes" ON votes;
DROP POLICY IF EXISTS "Votes can be deleted" ON votes;

CREATE POLICY "Votes visible to room members" ON votes
  FOR SELECT USING (true);
CREATE POLICY "Anyone can submit votes" ON votes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Votes can be deleted" ON votes
  FOR DELETE USING (true);

-- Ensure RLS policies exist for room_invites
DROP POLICY IF EXISTS "Anyone can view room invites" ON room_invites;
DROP POLICY IF EXISTS "Anyone can create room invites" ON room_invites;
DROP POLICY IF EXISTS "Anyone can update room invites" ON room_invites;

CREATE POLICY "Anyone can view room invites" ON room_invites
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create room invites" ON room_invites
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update room invites" ON room_invites
  FOR UPDATE USING (true);

-- Enable Realtime for all tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'users') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'friend_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rooms') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'players') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE players;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'votes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE votes;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'room_invites') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE room_invites;
  END IF;
END $$;
