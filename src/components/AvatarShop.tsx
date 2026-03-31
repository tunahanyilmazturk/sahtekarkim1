import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ShoppingBag, CircleDollarSign, Sparkles, Lock, Check, Filter,
  ChevronDown, Info, Star, Crown, Flame, Zap
} from 'lucide-react';
import { supabaseService, type User as UserType } from '../lib/supabase';
import { AvatarImage } from './AvatarImage';
import { SHOP_AVATARS, AVATAR_CATEGORIES, DEFAULT_AVATAR_IDS, type ShopAvatar } from '../lib/constants';

interface AvatarShopProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentAvatar: string;
  onAvatarChange: (avatar: string) => void;
  onCoinsUpdate?: (coins: number) => void;
}

type CategoryFilter = 'all' | 'free' | 'common' | 'rare' | 'epic' | 'legendary' | 'owned';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all:      <Filter className="w-4 h-4" />,
  free:     <Sparkles className="w-4 h-4" />,
  common:   <Star className="w-4 h-4" />,
  rare:     <Flame className="w-4 h-4" />,
  epic:     <Crown className="w-4 h-4" />,
  legendary:<Zap className="w-4 h-4" />,
  owned:    <Check className="w-4 h-4" />,
};

export function AvatarShop({ isOpen, onClose, userId, currentAvatar, onAvatarChange, onCoinsUpdate }: AvatarShopProps) {
  const [coins, setCoins] = useState(0);
  const [ownedAvatars, setOwnedAvatars] = useState<string[]>([...DEFAULT_AVATAR_IDS]);
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Kullanıcı verisini çek
  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await supabaseService.getUser(userId);
      if (userData) {
        setCoins(userData.coins ?? 0);
        setOwnedAvatars(userData.owned_avatars ?? [...DEFAULT_AVATAR_IDS]);
        if (onCoinsUpdate) onCoinsUpdate(userData.coins ?? 0);
      }
    };
    if (isOpen) fetchUserData();
  }, [userId, isOpen, onCoinsUpdate]);

  const filteredAvatars = SHOP_AVATARS.filter(avatar => {
    if (filter === 'all') return true;
    if (filter === 'owned') return ownedAvatars.includes(avatar.id);
    return avatar.category === filter;
  });

  const handlePurchase = async (avatar: ShopAvatar) => {
    if (purchasing) return;
    setPurchasing(avatar.id);

    const result = await supabaseService.purchaseAvatar(userId, avatar.id, avatar.price);

    if (result.success) {
      setCoins(prev => prev - avatar.price);
      setOwnedAvatars(prev => [...prev, avatar.id]);
      if (onCoinsUpdate) onCoinsUpdate(coins - avatar.price);
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.message });
      setTimeout(() => setMessage(null), 3000);
    }

    setPurchasing(null);
  };

  const handleSelectAvatar = (avatar: ShopAvatar) => {
    if (!ownedAvatars.includes(avatar.id)) return;
    onAvatarChange(avatar.emoji);
    setSelectedAvatar(avatar.id);
    setTimeout(() => setSelectedAvatar(null), 1500);
  };

  const isOwned = (avatarId: string) => ownedAvatars.includes(avatarId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <span className="font-black text-zinc-900">Avatar Mağazası</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-full">
                  <CircleDollarSign className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-amber-900">{coins}</span>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 px-3 py-2 bg-zinc-50 overflow-x-auto">
              {(['all', 'free', 'common', 'rare', 'epic', 'legendary', 'owned'] as CategoryFilter[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    filter === cat
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {CATEGORY_ICONS[cat]}
                  <span className="hidden sm:inline">{cat === 'all' ? 'Tümü' : AVATAR_CATEGORIES[cat]?.label || cat}</span>
                </button>
              ))}
            </div>

            {/* Avatar Grid */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {filteredAvatars.map((avatar, index) => {
                  const owned = isOwned(avatar.id);
                  const canAfford = coins >= avatar.price;
                  const isSelected = selectedAvatar === avatar.id;
                  const catStyle = AVATAR_CATEGORIES[avatar.category];

                  return (
                    <motion.button
                      key={avatar.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => owned ? handleSelectAvatar(avatar) : handlePurchase(avatar)}
                      disabled={!owned && (!canAfford || purchasing === avatar.id)}
                      className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        owned
                          ? `${catStyle.bg} ${catStyle.border} hover:scale-105`
                          : canAfford
                            ? 'bg-zinc-50 border-zinc-200 hover:border-amber-300 hover:bg-amber-50'
                            : 'bg-zinc-100 border-zinc-200 opacity-60 cursor-not-allowed'
                      } ${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                    >
                      {/* New Badge */}
                      {avatar.isNew && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          YENİ
                        </span>
                      )}

                      {/* Selected Badge */}
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -left-1 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        >
                          ✓
                        </motion.span>
                      )}

                      {/* Avatar Image */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14">
                        <AvatarImage avatarId={avatar.id} size={56} />
                      </div>

                      {/* Name */}
                      <span className="text-[10px] font-bold text-zinc-700 truncate w-full px-1">
                        {avatar.name}
                      </span>

                      {/* Price or Owned */}
                      {owned ? (
                        <span className="text-[9px] font-bold text-green-600 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Sahip
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                          canAfford ? 'text-amber-600' : 'text-red-400'
                        }`}>
                          <CircleDollarSign className="w-2.5 h-2.5" /> {avatar.price}
                        </span>
                      )}

                      {/* Lock Icon */}
                      {!owned && !canAfford && (
                        <Lock className="absolute top-1 right-1 w-3 h-3 text-zinc-400" />
                      )}

                      {/* Loading */}
                      {purchasing === avatar.id && (
                        <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Info Footer */}
            <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Nasıl altın kazanırım?</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showInfo ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-1 text-xs text-zinc-600">
                      <p>🏆 Oyun kazan: <span className="font-bold text-green-600">+10 altın</span></p>
                      <p>🎭 Sahtekar kazan: <span className="font-bold text-purple-600">+15 altın</span></p>
                      <p>🎯 Doğru tahmin: <span className="font-bold text-blue-600">+20 altın</span></p>
                      <p>🎮 Oyun oyna: <span className="font-bold text-zinc-600">+2 altın</span></p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Toast Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                    message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
