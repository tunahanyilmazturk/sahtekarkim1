-- ============================================================
-- Sahtekar Kim — Birleşik Supabase Migration
-- Tek dosyada: şema + avatar migration + güvenlik + grants
-- Supabase Dashboard > SQL Editor'da çalıştırılabilir.
-- Idempotent: birden fazla çalıştırılsa da güvenli.
-- ============================================================

-- ============================================================
-- 1. TABLOLAR
-- ============================================================

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

-- ============================================================
-- 2. AVATAR MIGRATION (idempotent — eski veritabanları için)
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '👤';
ALTER TABLE users ADD COLUMN IF NOT EXISTS owned_avatars TEXT[] DEFAULT ARRAY['avatar_default_1','avatar_free_1','avatar_free_2','avatar_free_3'];
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

UPDATE users SET avatar = '👤' WHERE avatar IS NULL;
UPDATE users SET owned_avatars = ARRAY['avatar_default_1','avatar_free_1','avatar_free_2','avatar_free_3'] WHERE owned_avatars IS NULL;
UPDATE users SET coins = 0 WHERE coins IS NULL;

-- ============================================================
-- 3. GÜVENLİK — VIEW & RPC
-- ============================================================

-- public_users view: password kolonunu hariç tutar
CREATE OR REPLACE VIEW public_users AS
  SELECT
    id,
    username,
    created_at,
    friends,
    is_online,
    last_seen,
    games_played,
    wins,
    avatar,
    owned_avatars,
    coins
  FROM users;

COMMENT ON VIEW public_users IS 'Public user data without password column. Use this for all non-auth user queries.';

-- fn_login: kimlik doğrulama (server-side)
CREATE OR REPLACE FUNCTION fn_login(p_username TEXT, p_password_hash TEXT)
RETURNS TABLE (
  id TEXT,
  username TEXT,
  created_at BIGINT,
  friends TEXT[],
  is_online BOOLEAN,
  last_seen BIGINT,
  games_played INTEGER,
  wins INTEGER,
  avatar TEXT,
  owned_avatars TEXT[],
  coins INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id, u.username, u.created_at, u.friends, u.is_online,
    u.last_seen, u.games_played, u.wins, u.avatar, u.owned_avatars, u.coins
  FROM users u
  WHERE u.username ILIKE p_username
    AND (
      u.password = p_password_hash
      OR (position(':' in u.password) = 0 AND u.password = split_part(p_password_hash, ':', 2))
    )
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION fn_login IS 'Verifies user credentials and returns user data (without password) on success.';

-- PBKDF2 salt değeri gizli değildir; istemcinin parola özetini üretmesini sağlar.
-- Tam parola özeti hiçbir zaman Data API üzerinden döndürülmez.
CREATE OR REPLACE FUNCTION fn_password_salt(p_username TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN position(':' in password) > 0 THEN split_part(password, ':', 1)
    ELSE 'sahtekar_salt_v1'
  END
  FROM users
  WHERE username ILIKE p_username
  LIMIT 1;
$$;

-- fn_register: yeni kullanıcı oluşturma
CREATE OR REPLACE FUNCTION fn_register(
  p_id TEXT,
  p_username TEXT,
  p_password TEXT,
  p_avatar TEXT DEFAULT '👤'
)
RETURNS TABLE (
  id TEXT,
  username TEXT,
  created_at BIGINT,
  friends TEXT[],
  is_online BOOLEAN,
  last_seen BIGINT,
  games_played INTEGER,
  wins INTEGER,
  avatar TEXT,
  owned_avatars TEXT[],
  coins INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO users (id, username, password, created_at, friends, is_online, last_seen, games_played, wins, avatar, owned_avatars, coins)
  VALUES (p_id, p_username, p_password, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, '{}', true, EXTRACT(EPOCH FROM NOW())::BIGINT * 1000, 0, 0, p_avatar, '{"avatar_default_1","avatar_free_1","avatar_free_2","avatar_free_3"}', 0);

  RETURN QUERY
  SELECT
    u.id, u.username, u.created_at, u.friends, u.is_online,
    u.last_seen, u.games_played, u.wins, u.avatar, u.owned_avatars, u.coins
  FROM users u
  WHERE u.id = p_id;
END;
$$;

COMMENT ON FUNCTION fn_register IS 'Creates a new user and returns user data (without password).';

-- ============================================================
-- 4. GRANTS
-- ============================================================

-- public_users view (password yok)
GRANT SELECT ON public_users TO anon, authenticated;

-- Parola özeti yalnızca fn_login/fn_register içinde erişilebilir olmalıdır.
REVOKE ALL ON users FROM anon, authenticated;
GRANT SELECT (id, username, created_at, friends, is_online, last_seen, games_played, wins, avatar, owned_avatars, coins)
  ON users TO anon, authenticated;
GRANT UPDATE (username, friends, is_online, last_seen, games_played, wins, avatar, owned_avatars, coins)
  ON users TO anon, authenticated;

-- Diğer tablolar
GRANT SELECT, INSERT, UPDATE, DELETE ON friend_requests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON rooms TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON players TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON votes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON room_invites TO anon, authenticated;

-- Sequence erişimi (UUID üretimi için)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- RPC'ler
REVOKE ALL ON FUNCTION fn_login(TEXT, TEXT) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION fn_password_salt(TEXT) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION fn_register(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION fn_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION fn_password_salt(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION fn_register(TEXT, TEXT, TEXT, TEXT) TO anon;

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_invites ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Public can view users list" ON users;
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Anyone can update users" ON users;

CREATE POLICY "Anyone can view public user columns" ON users
  FOR SELECT USING (true);
CREATE POLICY "Anyone can update non-secret user columns" ON users
  FOR UPDATE USING (true) WITH CHECK (true);

-- friend_requests
DROP POLICY IF EXISTS "Friend requests visible to involved users" ON friend_requests;
DROP POLICY IF EXISTS "Users can create friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can update own friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Anyone can view friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Anyone can create friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Anyone can update friend requests" ON friend_requests;

CREATE POLICY "Anyone can view friend requests" ON friend_requests
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create friend requests" ON friend_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update friend requests" ON friend_requests
  FOR UPDATE USING (true);

-- rooms
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

-- players
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

-- messages
DROP POLICY IF EXISTS "Messages visible to room members" ON messages;
DROP POLICY IF EXISTS "Anyone can add messages" ON messages;

CREATE POLICY "Messages visible to room members" ON messages
  FOR SELECT USING (true);
CREATE POLICY "Anyone can add messages" ON messages
  FOR INSERT WITH CHECK (true);

-- votes
DROP POLICY IF EXISTS "Votes visible to room members" ON votes;
DROP POLICY IF EXISTS "Anyone can submit votes" ON votes;
DROP POLICY IF EXISTS "Votes can be deleted" ON votes;

CREATE POLICY "Votes visible to room members" ON votes
  FOR SELECT USING (true);
CREATE POLICY "Anyone can submit votes" ON votes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Votes can be deleted" ON votes
  FOR DELETE USING (true);

-- room_invites
DROP POLICY IF EXISTS "Room invites visible to recipient" ON room_invites;
DROP POLICY IF EXISTS "Users can create room invites" ON room_invites;
DROP POLICY IF EXISTS "Users can update own invites" ON room_invites;
DROP POLICY IF EXISTS "Anyone can view room invites" ON room_invites;
DROP POLICY IF EXISTS "Anyone can create room invites" ON room_invites;
DROP POLICY IF EXISTS "Anyone can update room invites" ON room_invites;

CREATE POLICY "Anyone can view room invites" ON room_invites
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create room invites" ON room_invites
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update room invites" ON room_invites
  FOR UPDATE USING (true);

-- ============================================================
-- 6. REALTIME
-- ============================================================

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

-- ============================================================
-- 7. INDEXLER
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_votes_room ON votes(room_id);
CREATE INDEX IF NOT EXISTS idx_room_invites_to ON room_invites(to_user_id);
CREATE INDEX IF NOT EXISTS idx_room_invites_room ON room_invites(room_id);
