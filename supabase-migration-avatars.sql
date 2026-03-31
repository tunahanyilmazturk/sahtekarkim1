-- Migration: Avatar sistemi için users tablosuna yeni kolonlar ekle
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. avatar kolonu ekle (yoksa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '👤';

-- 2. owned_avatars kolonu ekle (yoksa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS owned_avatars TEXT[] DEFAULT ARRAY['avatar_default_1','avatar_free_1','avatar_free_2','avatar_free_3'];

-- 3. coins kolonu ekle (yoksa)
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;

-- 4. Mevcut kullanıcıların owned_avatars ve coins değerlerini varsayılanlara güncelle (NULL olanlar için)
UPDATE users SET avatar = '👤' WHERE avatar IS NULL;
UPDATE users SET owned_avatars = ARRAY['avatar_default_1','avatar_free_1','avatar_free_2','avatar_free_3'] WHERE owned_avatars IS NULL;
UPDATE users SET coins = 0 WHERE coins IS NULL;

-- 5. Şema cache'ini yenile (Supabase'de genellikle otomatik olur)
-- NOTIFY pgrst, 'reload schema';
