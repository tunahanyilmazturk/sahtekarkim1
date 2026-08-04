-- ============================================================
-- Security Migration: Password protection & RLS tightening
-- Run this in Supabase SQL Editor after the initial schema
-- ============================================================

-- 1. Create public_users view (excludes password column)
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

-- 2. Grant access to the view (anon can read user data WITHOUT passwords)
GRANT SELECT ON public_users TO anon, authenticated;

-- 3. Keep SELECT on users for anon (client-side auth needs to read password hash)
--    public_users view is used for all non-auth queries to avoid exposing passwords
GRANT SELECT ON users TO anon, authenticated;

-- 4. Keep INSERT/UPDATE/DELETE on users for anon (custom auth needs this)
--    Note: Without Supabase Auth, we cannot restrict row-level updates.
--    This is a known limitation of client-side auth.
GRANT INSERT, UPDATE, DELETE ON users TO anon;

-- 5. Create login RPC — verifies credentials server-side
--    Returns user data (without password) if credentials match
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
    AND u.password = p_password_hash
  LIMIT 1;
END;
$$;

-- Grant execute on login RPC to anon
GRANT EXECUTE ON FUNCTION fn_login(TEXT, TEXT) TO anon;

-- 6. Create register RPC — creates a new user
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

-- Grant execute on register RPC to anon
GRANT EXECUTE ON FUNCTION fn_register(TEXT, TEXT, TEXT, TEXT) TO anon;

-- 7. Update RLS policies on users table
--    Keep SELECT for anon (client-side auth needs to read password hash for verification)
--    All non-auth queries should use public_users view instead
DROP POLICY IF EXISTS "Anyone can view users" ON users;

CREATE POLICY "Anyone can view users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update users" ON users
  FOR UPDATE USING (true);

-- 8. Add comment for documentation
COMMENT ON VIEW public_users IS 'Public user data without password column. Use this for all non-auth user queries.';
COMMENT ON FUNCTION fn_login IS 'Verifies user credentials and returns user data (without password) on success.';
COMMENT ON FUNCTION fn_register IS 'Creates a new user and returns user data (without password).';
