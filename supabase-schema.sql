-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  friends TEXT[] DEFAULT '{}',
  is_online BOOLEAN DEFAULT false,
  last_seen BIGINT,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  avatar TEXT DEFAULT '👤',
  owned_avatars TEXT[] DEFAULT '{"avatar_default_1","avatar_free_1","avatar_free_2","avatar_free_3"}',
  coins INTEGER DEFAULT 0
);

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id TEXT NOT NULL,
  from_username TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at BIGINT NOT NULL
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  password TEXT,
  game_settings JSONB,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_turn_index INTEGER DEFAULT 0,
  round INTEGER DEFAULT 0,
  word TEXT,
  hint TEXT,
  category TEXT,
  winner TEXT,
  last_word TEXT,
  created_at BIGINT NOT NULL
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  is_host BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT false,
  is_bot BOOLEAN DEFAULT false,
  role TEXT,
  word TEXT,
  hint TEXT
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id TEXT,
  player_name TEXT,
  player_avatar TEXT,
  text TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at BIGINT NOT NULL
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  voted_player_id TEXT NOT NULL,
  UNIQUE(room_id, voter_id)
);

-- Room invites table
CREATE TABLE IF NOT EXISTS room_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL,
  from_user_id TEXT NOT NULL,
  from_username TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at BIGINT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Herkes kendi verisini görebilir, anon sadece kayıt için
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "Public can view users list" ON users;
CREATE POLICY "Public can view users list" ON users
  FOR SELECT USING (true);

-- Friend requests: İlgili kullanıcılar görebilir
DROP POLICY IF EXISTS "Friend requests visible to involved users" ON friend_requests;
CREATE POLICY "Friend requests visible to involved users" ON friend_requests
  FOR SELECT USING (auth.uid()::text = from_user_id OR auth.uid()::text = to_user_id);

DROP POLICY IF EXISTS "Users can create friend requests" ON friend_requests;
CREATE POLICY "Users can create friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid()::text = from_user_id);

DROP POLICY IF EXISTS "Users can update own friend requests" ON friend_requests;
CREATE POLICY "Users can update own friend requests" ON friend_requests
  FOR UPDATE USING (auth.uid()::text = to_user_id OR auth.uid()::text = from_user_id);

-- Rooms: Herkes görebilir, sadece host güncelleyebilir
DROP POLICY IF EXISTS "Rooms are publicly viewable" ON rooms;
CREATE POLICY "Rooms are publicly viewable" ON rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create rooms" ON rooms;
CREATE POLICY "Anyone can create rooms" ON rooms
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Rooms can be updated by anyone in game" ON rooms;
CREATE POLICY "Rooms can be updated by anyone in game" ON rooms
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Rooms can be deleted" ON rooms;
CREATE POLICY "Rooms can be deleted" ON rooms
  FOR DELETE USING (true);

-- Players: Odadaki oyuncular görebilir
DROP POLICY IF EXISTS "Players visible to room members" ON players;
CREATE POLICY "Players visible to room members" ON players
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can add players" ON players;
CREATE POLICY "Anyone can add players" ON players
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Players can be updated" ON players;
CREATE POLICY "Players can be updated" ON players
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Players can be removed" ON players;
CREATE POLICY "Players can be removed" ON players
  FOR DELETE USING (true);

-- Messages: Odadaki oyuncular görebilir
DROP POLICY IF EXISTS "Messages visible to room members" ON messages;
CREATE POLICY "Messages visible to room members" ON messages
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can add messages" ON messages;
CREATE POLICY "Anyone can add messages" ON messages
  FOR INSERT WITH CHECK (true);

-- Votes: Odadaki oyuncular görebilir
DROP POLICY IF EXISTS "Votes visible to room members" ON votes;
CREATE POLICY "Votes visible to room members" ON votes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can submit votes" ON votes;
CREATE POLICY "Anyone can submit votes" ON votes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Votes can be deleted" ON votes;
CREATE POLICY "Votes can be deleted" ON votes
  FOR DELETE USING (true);

-- Room invites: İlgili kullanıcılar görebilir
DROP POLICY IF EXISTS "Room invites visible to recipient" ON room_invites;
CREATE POLICY "Room invites visible to recipient" ON room_invites
  FOR SELECT USING (auth.uid()::text = to_user_id OR auth.uid()::text = from_user_id);

DROP POLICY IF EXISTS "Users can create room invites" ON room_invites;
CREATE POLICY "Users can create room invites" ON room_invites
  FOR INSERT WITH CHECK (auth.uid()::text = from_user_id);

DROP POLICY IF EXISTS "Users can update own invites" ON room_invites;
CREATE POLICY "Users can update own invites" ON room_invites
  FOR UPDATE USING (auth.uid()::text = to_user_id);

-- Enable Realtime (only add if not already added)
DO $$
BEGIN
  -- Users
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;

  -- Friend requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'friend_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
  END IF;

  -- Rooms
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;

  -- Players
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE players;
  END IF;

  -- Messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  -- Votes
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE votes;
  END IF;

  -- Room invites
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'room_invites'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE room_invites;
  END IF;
END $$;

-- Indexes for performance (create if not exists)
CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_room ON votes(room_id);
CREATE INDEX IF NOT EXISTS idx_room_invites_to ON room_invites(to_user_id);
CREATE INDEX IF NOT EXISTS idx_room_invites_room ON room_invites(room_id);
