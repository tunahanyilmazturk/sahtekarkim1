/**
 * AvatarImage — her avatar ID'sine karşılık gelen renkli SVG karakter avatarı
 * 
 * Avatarlar inline SVG olarak tanımlanmıştır; emoji görünümünden daha tutarlı
 * ve çizgi film tarzı bir görünüm sunar.
 */

interface AvatarImageProps {
  avatarId: string;
  size?: number;
  className?: string;
}

// Her avatar için renk paleti
const AVATAR_COLORS: Record<string, { bg: string; face: string; accent: string }> = {
  avatar_default_1:    { bg: '#E2E8F0', face: '#94A3B8', accent: '#64748B' },
  avatar_free_1:       { bg: '#FEF3C7', face: '#F59E0B', accent: '#D97706' },
  avatar_free_2:       { bg: '#FCE7F3', face: '#EC4899', accent: '#BE185D' },
  avatar_free_3:       { bg: '#EDE9FE', face: '#8B5CF6', accent: '#6D28D9' },
  avatar_common_1:     { bg: '#FEF3C7', face: '#92400E', accent: '#78350F' },
  avatar_common_2:     { bg: '#E0F2FE', face: '#F97316', accent: '#EA580C' },
  avatar_common_3:     { bg: '#FEF3C7', face: '#B45309', accent: '#92400E' },
  avatar_common_4:     { bg: '#DCFCE7', face: '#92400E', accent: '#78350F' },
  avatar_common_5:     { bg: '#F3F4F6', face: '#111827', accent: '#374151' },
  avatar_common_6:     { bg: '#FEF3C7', face: '#B45309', accent: '#92400E' },
  avatar_common_7:     { bg: '#FEF3C7', face: '#B45309', accent: '#92400E' },
  avatar_common_8:     { bg: '#DCFCE7', face: '#16A34A', accent: '#15803D' },
  avatar_common_9:     { bg: '#FEF3C7', face: '#92400E', accent: '#78350F' },
  avatar_common_10:    { bg: '#FDF4FF', face: '#A855F7', accent: '#9333EA' },
  avatar_common_11:    { bg: '#DCFCE7', face: '#15803D', accent: '#166534' },
  avatar_common_12:    { bg: '#FEE2E2', face: '#DC2626', accent: '#B91C1C' },
  avatar_rare_1:       { bg: '#F3E8FF', face: '#9333EA', accent: '#7C3AED' },
  avatar_rare_2:       { bg: '#DCFCE7', face: '#16A34A', accent: '#15803D' },
  avatar_rare_3:       { bg: '#E0F2FE', face: '#0284C7', accent: '#0369A1' },
  avatar_rare_4:       { bg: '#FEF3C7', face: '#92400E', accent: '#78350F' },
  avatar_rare_5:       { bg: '#E0F2FE', face: '#0284C7', accent: '#0369A1' },
  avatar_rare_6:       { bg: '#1E293B', face: '#94A3B8', accent: '#F59E0B' },
  avatar_rare_7:       { bg: '#FEF3C7', face: '#F59E0B', accent: '#D97706' },
  avatar_rare_8:       { bg: '#FDF2F8', face: '#EC4899', accent: '#DB2777' },
  avatar_rare_9:       { bg: '#F1F5F9', face: '#475569', accent: '#1E293B' },
  avatar_rare_10:      { bg: '#FEF9C3', face: '#CA8A04', accent: '#A16207' },
  avatar_epic_1:       { bg: '#F0FDF4', face: '#86EFAC', accent: '#4ADE80' },
  avatar_epic_2:       { bg: '#E0F2FE', face: '#38BDF8', accent: '#0EA5E9' },
  avatar_epic_3:       { bg: '#FEF3C7', face: '#F97316', accent: '#EA580C' },
  avatar_epic_4:       { bg: '#F8FAFC', face: '#CBD5E1', accent: '#94A3B8' },
  avatar_epic_5:       { bg: '#1E1B4B', face: '#818CF8', accent: '#6366F1' },
  avatar_epic_6:       { bg: '#FDF4FF', face: '#E879F9', accent: '#D946EF' },
  avatar_epic_7:       { bg: '#EFF6FF', face: '#3B82F6', accent: '#2563EB' },
  avatar_epic_8:       { bg: '#FFF7ED', face: '#F97316', accent: '#EA580C' },
  avatar_epic_9:       { bg: '#FEE2E2', face: '#DC2626', accent: '#B91C1C' },
  avatar_epic_10:      { bg: '#1E1B4B', face: '#818CF8', accent: '#A5B4FC' },
  avatar_legendary_1:  { bg: '#FFF1F2', face: '#F43F5E', accent: '#E11D48' },
  avatar_legendary_2:  { bg: '#FFF7ED', face: '#F97316', accent: '#EA580C' },
  avatar_legendary_3:  { bg: '#FEFCE8', face: '#EAB308', accent: '#CA8A04' },
  avatar_legendary_4:  { bg: '#EFF6FF', face: '#60A5FA', accent: '#3B82F6' },
  avatar_legendary_5:  { bg: '#FEFCE8', face: '#FACC15', accent: '#EAB308' },
  avatar_legendary_6:  { bg: '#FEFCE8', face: '#F59E0B', accent: '#D97706' },
  avatar_legendary_7:  { bg: '#FFF1F2', face: '#F43F5E', accent: '#E11D48' },
  avatar_legendary_8:  { bg: '#FEFCE8', face: '#F59E0B', accent: '#D97706' },
  avatar_legendary_9:  { bg: '#EFF6FF', face: '#818CF8', accent: '#6366F1' },
  avatar_legendary_10: { bg: '#F0FDF4', face: '#34D399', accent: '#10B981' },
};

// Emoji kısa yolları — eski emoji avatarlar için
function getEmojiForId(avatarId: string): string {
  const map: Record<string, string> = {
    avatar_default_1: '👤', avatar_free_1: '😊', avatar_free_2: '🎭', avatar_free_3: '🎪',
    avatar_common_1: '🐶', avatar_common_2: '🐱', avatar_common_3: '🦊', avatar_common_4: '🐻',
    avatar_common_5: '🐼', avatar_common_6: '🐯', avatar_common_7: '🦁', avatar_common_8: '🐸',
    avatar_common_9: '🐵', avatar_common_10: '🦋', avatar_common_11: '🐢', avatar_common_12: '🦀',
    avatar_rare_1: '🦄', avatar_rare_2: '🦖', avatar_rare_3: '🐙', avatar_rare_4: '🦅',
    avatar_rare_5: '🦈', avatar_rare_6: '🦉', avatar_rare_7: '🦜', avatar_rare_8: '🦩',
    avatar_rare_9: '🐺', avatar_rare_10: '🦊',
    avatar_epic_1: '👽', avatar_epic_2: '🤖', avatar_epic_3: '🎃', avatar_epic_4: '👻',
    avatar_epic_5: '🧙', avatar_epic_6: '🧚', avatar_epic_7: '🦸', avatar_epic_8: '🦹',
    avatar_epic_9: '🎅', avatar_epic_10: '🧛',
    avatar_legendary_1: '🐉', avatar_legendary_2: '🔥', avatar_legendary_3: '⚡',
    avatar_legendary_4: '💎', avatar_legendary_5: '🌟', avatar_legendary_6: '👑',
    avatar_legendary_7: '🎯', avatar_legendary_8: '🏆', avatar_legendary_9: '🌈',
    avatar_legendary_10: '🦚',
  };
  return map[avatarId] ?? '👤';
}

/**
 * SVG karakterler — her karakter grubu için benzersiz çizgi film stili yüz
 */
function AvatarSVG({ avatarId, size }: { avatarId: string; size: number }) {
  const c = AVATAR_COLORS[avatarId] ?? { bg: '#E2E8F0', face: '#94A3B8', accent: '#64748B' };
  const emoji = getEmojiForId(avatarId);

  // Eğer avatarId AVATAR_COLORS'da varsa güzel SVG göster
  if (AVATAR_COLORS[avatarId]) {
    const isLegendary = avatarId.startsWith('avatar_legendary');
    const isEpic = avatarId.startsWith('avatar_epic');
    const isRare = avatarId.startsWith('avatar_rare');

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Arkaplan */}
        <circle cx="50" cy="50" r="50" fill={c.bg} />

        {/* Efsane parıltı efekti */}
        {isLegendary && (
          <>
            <circle cx="50" cy="50" r="48" fill="none" stroke={c.accent} strokeWidth="2" strokeDasharray="6 3" opacity="0.4" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={c.face} strokeWidth="1" opacity="0.3" />
          </>
        )}

        {/* Epik parlak çerçeve */}
        {isEpic && (
          <circle cx="50" cy="50" r="47" fill="none" stroke={c.accent} strokeWidth="3" opacity="0.35" />
        )}

        {/* Nadir gradient çerçeve */}
        {isRare && (
          <circle cx="50" cy="50" r="47" fill="none" stroke={c.face} strokeWidth="2" opacity="0.3" />
        )}

        {/* Emoji merkezi - büyük ve net */}
        <text
          x="50"
          y="57"
          textAnchor="middle"
          fontSize={size * 0.46}
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
        >
          {emoji}
        </text>

        {/* Efsane yıldız süsleme */}
        {isLegendary && (
          <>
            <text x="15" y="22" textAnchor="middle" fontSize="12">✨</text>
            <text x="85" y="22" textAnchor="middle" fontSize="12">✨</text>
            <text x="50" y="96" textAnchor="middle" fontSize="10">⭐</text>
          </>
        )}

        {/* Epik taç süsleme */}
        {isEpic && (
          <text x="50" y="16" textAnchor="middle" fontSize="12">👑</text>
        )}
      </svg>
    );
  }

  // Fallback: düz emoji göster
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
      <text x="50" y="62" textAnchor="middle" fontSize="48">{emoji}</text>
    </svg>
  );
}

export function AvatarImage({ avatarId, size = 40, className }: AvatarImageProps) {
  // avatarId bir emoji ise (eski format) doğrudan emoji göster
  const isEmoji = avatarId && !avatarId.startsWith('avatar_');

  if (isEmoji) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.55,
          borderRadius: '50%',
          background: '#F1F5F9',
        }}
      >
        {avatarId}
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex' }}>
      <AvatarSVG avatarId={avatarId || 'avatar_default_1'} size={size} />
    </div>
  );
}

/** Emoji'den avatar ID'sini bul (geriye dönük uyumluluk) */
export function getAvatarIdFromEmoji(emoji: string): string {
  if (!emoji || emoji.startsWith('avatar_')) return emoji;
  const entries = Object.entries({
    avatar_default_1: '👤', avatar_free_1: '😊', avatar_free_2: '🎭', avatar_free_3: '🎪',
    avatar_common_1: '🐶', avatar_common_2: '🐱', avatar_common_3: '🦊', avatar_common_4: '🐻',
    avatar_common_5: '🐼', avatar_common_6: '🐯', avatar_common_7: '🦁', avatar_common_8: '🐸',
    avatar_common_9: '🐵', avatar_common_10: '🦋', avatar_common_11: '🐢', avatar_common_12: '🦀',
    avatar_rare_1: '🦄', avatar_rare_2: '🦖', avatar_rare_3: '🐙', avatar_rare_4: '🦅',
    avatar_rare_5: '🦈', avatar_rare_6: '🦉', avatar_rare_7: '🦜', avatar_rare_8: '🦩',
    avatar_rare_9: '🐺', avatar_rare_10: '🦊',
    avatar_epic_1: '👽', avatar_epic_2: '🤖', avatar_epic_3: '🎃', avatar_epic_4: '👻',
    avatar_epic_5: '🧙', avatar_epic_6: '🧚', avatar_epic_7: '🦸', avatar_epic_8: '🦹',
    avatar_epic_9: '🎅', avatar_epic_10: '🧛',
    avatar_legendary_1: '🐉', avatar_legendary_2: '🔥', avatar_legendary_3: '⚡',
    avatar_legendary_4: '💎', avatar_legendary_5: '🌟', avatar_legendary_6: '👑',
    avatar_legendary_7: '🎯', avatar_legendary_8: '🏆', avatar_legendary_9: '🌈',
    avatar_legendary_10: '🦚',
  });
  const found = entries.find(([, v]) => v === emoji);
  return found ? found[0] : 'avatar_default_1';
}
