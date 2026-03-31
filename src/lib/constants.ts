export const APP_NAME = 'Sahtekar Kim?';
export const APP_TAGLINE = 'Kelime tahmin ve blöf oyunu';

export const GAME_CONFIG = {
  MIN_PLAYERS: 3,
  MAX_PLAYERS: 16,
  ROLE_CARD_DURATION: 5000,
  ROOM_CODE_LENGTH: 6,
  PLAYER_NAME_MIN_LENGTH: 2,
  PLAYER_NAME_MAX_LENGTH: 15,
  VOTE_DELAY: 100,
} as const;

export const POINTS = {
  IMPOSTOR_WIN: 15,
  CITIZEN_WIN: 10,
  CORRECT_GUESS: 20,
  TIE: 5,
} as const;

export const AVATARS = [
  '🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁',
  '🐮', '🐷', '🐸', '🐵', '🐙', '🦄', '🦖', '👽',
  '🤖', '🎃', '👻', '🎅', '🦸', '🦹', '🧙', '🧚',
] as const;

// ─── Avatar Mağazası ────────────────────────────────────────────────────────
export interface ShopAvatar {
  id: string;
  emoji: string;
  name: string;
  price: number;
  category: 'free' | 'common' | 'rare' | 'epic' | 'legendary';
  isNew?: boolean;
}

export const AVATAR_CATEGORIES = {
  free:      { label: 'Ücretsiz', color: 'text-zinc-600',  bg: 'bg-zinc-100',   border: 'border-zinc-200' },
  common:    { label: 'Yaygın',   color: 'text-green-600', bg: 'bg-green-50',   border: 'border-green-200' },
  rare:      { label: 'Nadir',    color: 'text-blue-600',  bg: 'bg-blue-50',    border: 'border-blue-200' },
  epic:      { label: 'Epik',     color: 'text-purple-600',bg: 'bg-purple-50',  border: 'border-purple-200' },
  legendary: { label: 'Efsane',   color: 'text-yellow-600',bg: 'bg-yellow-50',  border: 'border-yellow-300' },
} as const;

export const SHOP_AVATARS: ShopAvatar[] = [
  // ── Ücretsiz ───────────────────────────────────────────────────────────────
  { id: 'avatar_default_1',  emoji: '👤', name: 'Varsayılan',     price: 0,   category: 'free' },
  { id: 'avatar_free_1',     emoji: '😊', name: 'Mutlu Yüz',      price: 0,   category: 'free' },
  { id: 'avatar_free_2',     emoji: '🎭', name: 'Maske',          price: 0,   category: 'free' },
  { id: 'avatar_free_3',     emoji: '🎪', name: 'Sirk',           price: 0,   category: 'free' },
  
  // ── Yaygın (Common) - 50-100 XP ────────────────────────────────────────────
  { id: 'avatar_common_1',   emoji: '🐶', name: 'Köpek',          price: 50,  category: 'common' },
  { id: 'avatar_common_2',   emoji: '🐱', name: 'Kedi',           price: 50,  category: 'common' },
  { id: 'avatar_common_3',   emoji: '🦊', name: 'Tilki',          price: 50,  category: 'common' },
  { id: 'avatar_common_4',   emoji: '🐻', name: 'Ayı',            price: 50,  category: 'common' },
  { id: 'avatar_common_5',   emoji: '🐼', name: 'Panda',          price: 50,  category: 'common' },
  { id: 'avatar_common_6',   emoji: '🐯', name: 'Kaplan',         price: 75,  category: 'common' },
  { id: 'avatar_common_7',   emoji: '🦁', name: 'Aslan',          price: 75,  category: 'common' },
  { id: 'avatar_common_8',   emoji: '🐸', name: 'Kurbağa',        price: 50,  category: 'common' },
  { id: 'avatar_common_9',   emoji: '🐵', name: 'Maymun',         price: 50,  category: 'common' },
  { id: 'avatar_common_10',  emoji: '🦋', name: 'Kelebek',        price: 75,  category: 'common' },
  { id: 'avatar_common_11',  emoji: '🐢', name: 'Kaplumbağa',     price: 75,  category: 'common' },
  { id: 'avatar_common_12',  emoji: '🦀', name: 'Yengeç',         price: 75,  category: 'common' },
  
  // ── Nadir (Rare) - 150-300 XP ──────────────────────────────────────────────
  { id: 'avatar_rare_1',     emoji: '🦄', name: 'Tek Boynuzlu',   price: 150, category: 'rare' },
  { id: 'avatar_rare_2',     emoji: '🦖', name: 'Dinozor',        price: 200, category: 'rare' },
  { id: 'avatar_rare_3',     emoji: '🐙', name: 'Ahtapot',        price: 150, category: 'rare' },
  { id: 'avatar_rare_4',     emoji: '🦅', name: 'Kartal',         price: 200, category: 'rare' },
  { id: 'avatar_rare_5',     emoji: '🦈', name: 'Köpekbalığı',    price: 200, category: 'rare' },
  { id: 'avatar_rare_6',     emoji: '🦉', name: 'Baykuş',         price: 175, category: 'rare' },
  { id: 'avatar_rare_7',     emoji: '🦜', name: 'Papağan',        price: 175, category: 'rare' },
  { id: 'avatar_rare_8',     emoji: '🦩', name: 'Flamingo',       price: 200, category: 'rare' },
  { id: 'avatar_rare_9',     emoji: '🐺', name: 'Kurt',           price: 250, category: 'rare' },
  { id: 'avatar_rare_10',    emoji: '🦊', name: 'Altın Tilki',    price: 250, category: 'rare', isNew: true },
  
  // ── Epik (Epic) - 400-600 XP ───────────────────────────────────────────────
  { id: 'avatar_epic_1',     emoji: '👽', name: 'Uzaylı',        price: 400, category: 'epic' },
  { id: 'avatar_epic_2',     emoji: '🤖', name: 'Robot',          price: 450, category: 'epic' },
  { id: 'avatar_epic_3',     emoji: '🎃', name: 'Sihirli Kabak', price: 400, category: 'epic' },
  { id: 'avatar_epic_4',     emoji: '👻', name: 'Hayalet',        price: 450, category: 'epic' },
  { id: 'avatar_epic_5',     emoji: '🧙', name: 'Büyücü',         price: 500, category: 'epic' },
  { id: 'avatar_epic_6',     emoji: '🧚', name: 'Peri',           price: 500, category: 'epic' },
  { id: 'avatar_epic_7',     emoji: '🦸', name: 'Süper Kahraman', price: 550, category: 'epic' },
  { id: 'avatar_epic_8',     emoji: '🦹', name: 'Süper Kötü',     price: 550, category: 'epic' },
  { id: 'avatar_epic_9',     emoji: '🎅', name: 'Noel Baba',      price: 600, category: 'epic' },
  { id: 'avatar_epic_10',    emoji: '🧛', name: 'Vampir',         price: 500, category: 'epic', isNew: true },
  
  // ── Efsane (Legendary) - 800-1500 XP ───────────────────────────────────────
  { id: 'avatar_legendary_1', emoji: '🐉', name: 'Ejderha',       price: 800,  category: 'legendary' },
  { id: 'avatar_legendary_2', emoji: '🔥', name: 'Alev',          price: 1000, category: 'legendary' },
  { id: 'avatar_legendary_3', emoji: '⚡', name: 'Yıldırım',       price: 1000, category: 'legendary' },
  { id: 'avatar_legendary_4', emoji: '💎', name: 'Elmas',         price: 1200, category: 'legendary' },
  { id: 'avatar_legendary_5', emoji: '🌟', name: 'Yıldız',         price: 1200, category: 'legendary' },
  { id: 'avatar_legendary_6', emoji: '👑', name: 'Taç',           price: 1500, category: 'legendary' },
  { id: 'avatar_legendary_7', emoji: '🎯', name: 'Hedef',         price: 800,  category: 'legendary' },
  { id: 'avatar_legendary_8', emoji: '🏆', name: 'Kupa',          price: 1000, category: 'legendary' },
  { id: 'avatar_legendary_9', emoji: '🌈', name: 'Gökkuşağı',     price: 1500, category: 'legendary' },
  { id: 'avatar_legendary_10', emoji: '🦚', name: 'Tavus Kuşu',   price: 1200, category: 'legendary', isNew: true },
];

// Varsayılan avatar ID'leri (herkesin sahip olduğu)
export const DEFAULT_AVATAR_IDS = [
  'avatar_default_1',
  'avatar_free_1',
  'avatar_free_2',
  'avatar_free_3',
] as const;

export const ERROR_MESSAGES = {
  ROOM_NOT_FOUND: 'Oda bulunamadı.',
  ROOM_FULL: 'Oda dolu.',
  ROOM_PASSWORD_WRONG: 'Şifre yanlış.',
  GAME_ALREADY_STARTED: 'Oyun zaten başlamış.',
  NAME_ALREADY_TAKEN: 'Bu isimde bir oyuncu zaten var.',
  MIN_PLAYERS: 'Oyuna başlamak için en az 3 kişi olmalısınız.',
  MAX_PLAYERS: 'Oda dolu (maksimum 16 kişi).',
  EMPTY_NAME: 'Lütfen bir isim girin.',
  EMPTY_ROOM_CODE: 'Lütfen oda kodu girin.',
  INVALID_NAME: 'İsim 2-15 karakter olmalıdır.',
  CONNECTION_FAILED: 'İnternet bağlantınızı kontrol edin.',
  NETWORK_ERROR: 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.',
  ROOM_CLOSED: 'Oda kapatıldı.',
  KICKED_FROM_ROOM: 'Odadan atıldınız.',
  ALREADY_VOTED: 'Zaten oy verdiniz.',
  NOT_YOUR_TURN: 'Sıra sende değil.',
  NO_WORD_ENTERED: 'Lütfen bir kelime girin.',
  WORD_TOO_SHORT: 'Kelime çok kısa.',
  NETWORK_DISCONNECTED: 'Bağlantı kesildi.',
} as const;

export const TOAST_DURATION = 4000;

export const SUCCESS_MESSAGES = {
  ROOM_CREATED: 'Oda oluşturuldu!',
  JOINED_ROOM: 'Odaya katıldınız!',
  GAME_STARTED: 'Oyun başladı!',
  VOTE_SUBMITTED: 'Oyunuz kaydedildi.',
  CORRECT_GUESS: 'Doğru tahmin! Sahtekar kazandı!',
  WRONG_GUESS: 'Yanlış tahmin! Vatandaşlar kazandı!',
  IMPOSTOR_FOUND: 'Sahtekar bulundu! Vatandaşlar kazandı!',
  WRONG_VOTE: 'Yanlış kişi! Sahtekar kazandı!',
} as const;

export const GAME_STATUS_LABELS = {
  waiting: 'Bekleniyor',
  playing: 'Oynanıyor',
  voting: 'Oylama',
  finished: 'Bitti',
} as const;

export const ROLE_LABELS = {
  impostor: 'Sahtekar',
  citizen: 'Vatandaş',
} as const;

export const DIFFICULTY_INFO = {
  easy: { label: 'Kolay', desc: 'Açık ipuçları', color: 'bg-green-500' },
  medium: { label: 'Orta', desc: 'Normal ipuçları', color: 'bg-yellow-500' },
  hard: { label: 'Zor', desc: 'Kısa ipuçları', color: 'bg-red-500' },
} as const;

export const CATEGORY_ICONS: Record<string, string> = {
  'Hayvanlar': '🐾',
  'Yemekler': '🍕',
  'Meslekler': '👔',
  'Şehirler': '🏙️',
  'Eşyalar': '📦',
  'Spor': '⚽',
  'Film/Dizi': '🎬',
  'Meyveler': '🍎',
  'İçecekler': '☕',
  'Kıyafetler': '👕',
  'Ulaşım': '🚗',
  'Doğa': '🌲',
  'Teknoloji': '💻',
  'Müzik': '🎵',
  'Vücut': '🦵',
};

export const BOT_NAMES = [
  'Ahmet', 'Mehmet', 'Ali', 'Ayşe', 'Fatma', 'Emre', 'Deniz', 'Zeynep',
  'Cem', 'Leyla', 'Mert', 'Elif', 'Kaan', 'Nisa', 'Baran', 'Ada',
  'Ege', 'Yelda', 'Kuzey', 'Nil', 'Derin', 'Rüzgar', 'Bulut', 'Doruk',
  'Sude', 'Atlas', 'Pınar', 'Eren', 'İrem', 'Sarp', 'Beta', 'Mira',
] as const;

export const BOT_AVATARS = ['🤖', '🎃', '👻', '👽', '🦄', '🦖', '🐙', '🦋'] as const;

export const getRandomBotName = (excludeNames: string[] = []): string => {
  const availableNames = BOT_NAMES.filter(name => !excludeNames.includes(name));
  return availableNames[Math.floor(Math.random() * availableNames.length)];
};

export const getRandomBotAvatar = (): string => {
  const avatars = ['🤖', '🎃', '👻', '👽', '🦄', '🦖', '🐙', '🦋'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

export const ROOM_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  VOTING: 'voting',
  FINISHED: 'finished',
} as const;
