import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Trophy, Swords, Target, X, Crown, Users,
  LogOut, Check, Share2, Flame, Zap,
  TrendingUp, Award, Clock, BarChart2, ShoppingBag, CircleDollarSign, Edit3, Sparkles, Star
} from 'lucide-react';
import { supabaseService, type User as UserType } from '../lib/supabase';
import { AvatarShop } from './AvatarShop';
import { AvatarImage, getAvatarIdFromEmoji } from './AvatarImage';
import { SHOP_AVATARS, DEFAULT_AVATAR_IDS } from '../lib/constants';

interface ProfileProps {
  user: { id: string; name: string };
  onClose: () => void;
  onLogout: () => void;
}

interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  gamesPlayedAsImpostor: number;
  impostorWins: number;
  friends: string[];
  createdAt: number;
  avatar: string;
  ownedAvatars: string[];
  coins: number;
}

interface Rank {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  minXP: number;
  maxXP: number;
}

const RANKS: Rank[] = [
  { name: 'Çaylak',   icon: '🌱', color: 'text-green-600',  bgColor: 'bg-green-50',   minXP: 0,    maxXP: 99   },
  { name: 'Acemi',    icon: '⚔️',  color: 'text-blue-600',   bgColor: 'bg-blue-50',    minXP: 100,  maxXP: 299  },
  { name: 'Usta',     icon: '🛡️',  color: 'text-purple-600', bgColor: 'bg-purple-50',  minXP: 300,  maxXP: 699  },
  { name: 'Uzman',    icon: '🔥',  color: 'text-orange-600', bgColor: 'bg-orange-50',  minXP: 700,  maxXP: 1499 },
  { name: 'Efsane',   icon: '👑',  color: 'text-yellow-600', bgColor: 'bg-yellow-50',  minXP: 1500, maxXP: 2999 },
  { name: 'Tanrısal', icon: '💎',  color: 'text-cyan-600',   bgColor: 'bg-cyan-50',    minXP: 3000, maxXP: Infinity },
];

function getXP(stats: Pick<UserStats, 'wins' | 'impostorWins' | 'gamesPlayed'>): number {
  return stats.wins * 10 + stats.impostorWins * 15 + stats.gamesPlayed * 2;
}

function getRank(xp: number): Rank {
  return RANKS.slice().reverse().find(r => xp >= r.minXP) ?? RANKS[0];
}

function getLevelProgress(xp: number): { current: number; max: number; percent: number } {
  const rank = getRank(xp);
  if (rank.maxXP === Infinity) return { current: xp - rank.minXP, max: 999, percent: 100 };
  const current = xp - rank.minXP;
  const max     = rank.maxXP - rank.minXP;
  return { current, max, percent: Math.min(100, Math.round((current / max) * 100)) };
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

function getAchievements(stats: UserStats): Achievement[] {
  return [
    { id: 'first_win',      icon: '🏆', title: 'İlk Zafer',      desc: 'İlk oyununu kazan',           unlocked: stats.wins >= 1,            rarity: 'common'   },
    { id: 'ten_wins',       icon: '🌟', title: 'On Zafer',        desc: '10 oyun kazan',               unlocked: stats.wins >= 10,           rarity: 'rare'     },
    { id: 'fifty_wins',     icon: '👑', title: 'Elli Zafer',      desc: '50 oyun kazan',               unlocked: stats.wins >= 50,           rarity: 'epic'     },
    { id: 'impostor_first', icon: '🎭', title: 'Sahtekar',        desc: 'Sahtekar olarak ilk zaferi',  unlocked: stats.impostorWins >= 1,    rarity: 'common'   },
    { id: 'impostor_master',icon: '🕵️', title: 'Usta Sahtekar',   desc: 'Sahtekar olarak 10 kez kazan',unlocked: stats.impostorWins >= 10,   rarity: 'epic'     },
    { id: 'veteran',        icon: '🎖️', title: 'Veteran',         desc: '25 oyun oyna',                unlocked: stats.gamesPlayed >= 25,    rarity: 'rare'     },
    { id: 'legend',         icon: '💎', title: 'Efsane',          desc: '100 oyun oyna',               unlocked: stats.gamesPlayed >= 100,   rarity: 'legendary'},
    { id: 'social',         icon: '🤝', title: 'Sosyal Kelebek', desc: '5 arkadaş edin',               unlocked: stats.friends.length >= 5,  rarity: 'rare'     },
    { id: 'collector',      icon: '🎨', title: 'Koleksiyoncu',    desc: '10 avatar satın al',          unlocked: stats.ownedAvatars.length >= 10, rarity: 'rare' },
    { id: 'rich',           icon: '💰', title: 'Zengin',          desc: '500 altın biriktir',          unlocked: stats.coins >= 500,         rarity: 'epic'     },
  ];
}

const RARITY_STYLES: Record<string, { border: string; bg: string; label: string; labelColor: string }> = {
  common:    { border: 'border-zinc-200',   bg: 'bg-zinc-50',   label: 'Yaygın', labelColor: 'text-zinc-500'   },
  rare:      { border: 'border-blue-200',   bg: 'bg-blue-50',   label: 'Nadir',  labelColor: 'text-blue-600'   },
  epic:      { border: 'border-purple-200', bg: 'bg-purple-50', label: 'Epik',   labelColor: 'text-purple-600' },
  legendary: { border: 'border-yellow-300', bg: 'bg-yellow-50', label: 'Efsane', labelColor: 'text-yellow-600' },
};

type Tab = 'stats' | 'achievements' | 'friends';

export function Profile({ user, onClose, onLogout }: ProfileProps) {
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0, wins: 0, losses: 0,
    gamesPlayedAsImpostor: 0, impostorWins: 0,
    friends: [], createdAt: Date.now(),
    avatar: '👤', ownedAvatars: [...DEFAULT_AVATAR_IDS], coins: 0,
  });
  const [allUsers, setAllUsers] = useState<Record<string, UserType>>({});
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [showShop, setShowShop] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await supabaseService.getUser(user.id);
      if (userData) {
        const gamesPlayed = userData.games_played ?? 0;
        const wins        = userData.wins ?? 0;
        setStats({
          gamesPlayed,
          wins,
          losses: Math.max(0, gamesPlayed - wins),
          gamesPlayedAsImpostor: 0,
          impostorWins: 0,
          friends: userData.friends ?? [],
          createdAt: userData.created_at ?? Date.now(),
          avatar: userData.avatar ?? '👤',
          ownedAvatars: userData.owned_avatars ?? [...DEFAULT_AVATAR_IDS],
          coins: userData.coins ?? 0,
        });
      }
    };
    fetchUser();
  }, [user.id]);

  useEffect(() => {
    const unsub = supabaseService.subscribeToUsers(users => {
      const map: Record<string, UserType> = {};
      users.forEach(u => { map[u.id] = u; });
      setAllUsers(map);
    });
    return () => unsub();
  }, []);

  const handleAvatarChange = async (newEmoji: string) => {
    await supabaseService.updateUserAvatar(user.id, newEmoji);
    setStats(prev => ({ ...prev, avatar: newEmoji }));
  };

  const handleCoinsUpdate = (newCoins: number) => {
    setStats(prev => ({ ...prev, coins: newCoins }));
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?user=${user.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const xp            = getXP(stats);
  const rank          = getRank(xp);
  const levelProgress = getLevelProgress(xp);
  const winRate       = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const impostorWinRate = stats.gamesPlayedAsImpostor > 0
    ? Math.round((stats.impostorWins / stats.gamesPlayedAsImpostor) * 100)
    : 0;
  const achievements   = getAchievements(stats);
  const unlockedCount  = achievements.filter(a => a.unlocked).length;
  const memberDays     = Math.floor((Date.now() - stats.createdAt) / (1000 * 60 * 60 * 24));
  const ownedCount     = stats.ownedAvatars.length;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'stats',        label: 'İstatistik', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'achievements', label: 'Rozetler',   icon: <Award className="w-4 h-4" /> },
    { id: 'friends',      label: 'Arkadaşlar', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 z-[100] overflow-hidden"
        onClick={onClose}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-5xl opacity-5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                rotate: [0, 20, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {['⭐', '🎮', '🏆', '👑', '💎', '🔥', '✨', '🎯', '🌟', '💫', '⚡', '🎪', '🎭', '🎨', '🎬'][i]}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex flex-col h-full bg-white"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-4 border-b border-zinc-200/50 flex items-center justify-between bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-zinc-900">Profilim</h2>
                <p className="text-xs text-zinc-500 font-medium">{rank.name}</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-zinc-600" />
            </motion.button>
          </div>

          <div className="relative flex-1 overflow-y-auto">
            {/* Profile Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 mx-4 mt-4 rounded-3xl p-6 text-white overflow-hidden shadow-2xl"
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/5" />

              <div className="relative z-10 space-y-4">
                {/* Avatar & Name Section */}
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShop(true)}
                    className="relative group cursor-pointer"
                  >
                    <div className="relative">
                      <AvatarImage
                        avatarId={getAvatarIdFromEmoji(stats.avatar)}
                        size={80}
                        className="rounded-3xl border-4 border-white/20 shadow-xl"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Edit3 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 border-4 border-zinc-900 rounded-full shadow-lg" />
                  </motion.button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-2xl font-black truncate">{user.name}</h3>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${rank.bgColor} ${rank.color} text-sm font-bold mt-2`}>
                          <span className="text-lg">{rank.icon}</span>
                          <span>{rank.name}</span>
                          {rank.icon === '💎' && <Sparkles className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-white">{xp.toLocaleString()} XP</span>
                    <span className="text-zinc-300">{levelProgress.percent}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress.percent}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                      className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full shadow-lg shadow-orange-500/50"
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10">
                  {[
                    { value: stats.gamesPlayed, label: 'Oyun', icon: '🎮' },
                    { value: stats.wins, label: 'Galibiyet', icon: '🏆' },
                    { value: `${winRate}%`, label: 'Oran', icon: '📊' },
                    { value: stats.coins, label: 'Coin', icon: '🪙' }
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="text-center"
                    >
                      <div className="text-xl mb-0.5">{stat.icon}</div>
                      <p className="text-lg font-black text-white">{stat.value}</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Avatar Shop Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShop(true)}
              className="mx-4 mt-4 w-[calc(100%-2rem)] py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-amber-500/40"
            >
              <ShoppingBag className="w-4 h-4" />
              Avatar Mağazası
              <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">{ownedCount} avatar</span>
            </motion.button>

            {/* Tabs */}
            <div className="flex gap-2 mx-4 mt-4 p-1 bg-zinc-100 rounded-xl">
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-zinc-900 shadow-md'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="px-4 pt-3 pb-4 space-y-3"
              >
                {/* Stats Tab */}
                {activeTab === 'stats' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: Trophy, label: 'Galibiyet', value: stats.wins, color: 'from-yellow-400 to-amber-500', bg: 'bg-yellow-50' },
                        { icon: Target, label: 'Başarı %', value: `${winRate}%`, color: 'from-green-400 to-emerald-500', bg: 'bg-green-50' },
                        { icon: Swords, label: 'Sahtekar', value: stats.gamesPlayedAsImpostor, color: 'from-red-400 to-pink-500', bg: 'bg-red-50' },
                        { icon: Crown, label: 'Sahtekar %', value: `${impostorWinRate}%`, color: 'from-purple-400 to-blue-500', bg: 'bg-purple-50' }
                      ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`${s.bg} rounded-2xl p-4 text-center hover:shadow-md transition-shadow`}
                          >
                            <div className={`flex justify-center mb-2 text-2xl`}>
                              <Icon className={`w-6 h-6 bg-gradient-to-br ${s.color} bg-clip-text text-transparent`} />
                            </div>
                            <p className="text-2xl font-black text-zinc-900">{s.value}</p>
                            <p className="text-xs text-zinc-600 font-medium mt-1">{s.label}</p>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Detailed Stats */}
                    <div className="bg-zinc-50 rounded-2xl divide-y divide-zinc-200 overflow-hidden">
                      {[
                        { icon: ShoppingBag, label: 'Avatar Koleksiyonu', value: `${ownedCount} avatar`, color: 'text-amber-500' },
                        { icon: CircleDollarSign, label: 'Coin', value: `${stats.coins} 🪙`, color: 'text-amber-500' },
                        { icon: TrendingUp, label: 'Toplam Galibiyet', value: stats.wins, color: 'text-green-500' },
                        { icon: Flame, label: 'Toplam Mağlubiyet', value: stats.losses, color: 'text-orange-500' },
                        { icon: Zap, label: 'Toplam XP', value: `${xp.toLocaleString()} XP`, color: 'text-yellow-500' },
                        { icon: Clock, label: 'Üyelik Süresi', value: `${memberDays} gün`, color: 'text-blue-500' },
                        { icon: Users, label: 'Arkadaş Sayısı', value: stats.friends.length, color: 'text-purple-500' }
                      ].map((row, i) => {
                        const Icon = row.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center justify-between px-4 py-3.5 hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-white ${row.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-medium text-zinc-700">{row.label}</span>
                            </div>
                            <span className="font-bold text-zinc-900">{row.value}</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Win/Loss Chart */}
                    {stats.gamesPlayed > 0 && (
                      <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-zinc-800">Galibiyet / Mağlubiyet</span>
                          <span className="text-xs font-bold text-zinc-500">{stats.wins}W – {stats.losses}L</span>
                        </div>
                        <div className="h-3 bg-white rounded-full overflow-hidden flex shadow-sm">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${winRate}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                            className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs font-bold">
                          <span className="text-green-600">Galibiyet %{winRate}</span>
                          <span className="text-red-500">Mağlubiyet %{100 - winRate}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                  <>
                    <div className="bg-zinc-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-zinc-800">Rozetler</span>
                        <span className="text-xs font-bold text-zinc-500">
                          {unlockedCount}/{achievements.length} ({Math.round((unlockedCount / achievements.length) * 100)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-white rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-full shadow-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {achievements.map((ach, i) => {
                        const style = RARITY_STYLES[ach.rarity];
                        return (
                          <motion.div
                            key={ach.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className={`relative rounded-2xl border-2 p-4 flex flex-col items-center text-center gap-2 transition-all hover:shadow-md ${
                              ach.unlocked
                                ? `${style.bg} ${style.border}`
                                : 'bg-zinc-100 border-zinc-300 opacity-50 grayscale'
                            }`}
                          >
                            {ach.unlocked && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="absolute top-2 right-2"
                              >
                                <Check className="w-4 h-4 text-green-500 bg-white rounded-full p-0.5" />
                              </motion.span>
                            )}
                            <span className="text-3xl">{ach.icon}</span>
                            <p className="text-sm font-black text-zinc-900 leading-tight">{ach.title}</p>
                            <p className="text-xs text-zinc-600 leading-tight h-8">{ach.desc}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${style.labelColor}`}>
                              {style.label}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Friends Tab */}
                {activeTab === 'friends' && (
                  <>
                    {stats.friends.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-4 py-16 text-center"
                      >
                        <div className="text-6xl mb-2">🤝</div>
                        <div>
                          <p className="font-bold text-zinc-800 mb-1">Henüz Arkadaşın Yok</p>
                          <p className="text-sm text-zinc-500">Sosyal sekmesinden yeni arkadaşlar ekleyebilirsin.</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-2">
                        {stats.friends.map((friendId, i) => {
                          const friend = allUsers[friendId];
                          const isOnline = friend?.is_online ?? false;
                          return (
                            <motion.div
                              key={friendId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all ${
                                isOnline
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-zinc-50 border border-zinc-200'
                              }`}
                            >
                              <div className="relative">
                                <AvatarImage
                                  avatarId={getAvatarIdFromEmoji(friend?.avatar || '👤')}
                                  size={40}
                                />
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${
                                  isOnline ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-zinc-400'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-zinc-900 truncate">
                                  {friend?.username ?? 'Bilinmiyor'}
                                </p>
                                <p className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-zinc-500'}`}>
                                  {isOnline ? '🟢 Çevrimiçi' : '⚫ Çevrimdışı'}
                                </p>
                              </div>
                              {friend?.wins && (
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-xs">
                                    <Trophy className="w-3 h-3 text-yellow-500" />
                                    <span className="font-bold text-zinc-900">{friend.wins}</span>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="sticky bottom-0 px-4 py-3 space-y-2 bg-white border-t border-zinc-200/50">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={copyProfileLink}
                className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${
                  copied
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copied ? 'Kopyalandı!' : 'Profili Paylaş'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onLogout}
                className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Avatar Shop Modal */}
      <AvatarShop
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        userId={user.id}
        currentAvatar={stats.avatar}
        onAvatarChange={handleAvatarChange}
        onCoinsUpdate={handleCoinsUpdate}
      />
    </>
  );
}
