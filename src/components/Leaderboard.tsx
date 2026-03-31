import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Crown, Medal, X, Swords, Gamepad2, Target, TrendingUp, CircleDollarSign, Award, Star, Flame, Zap } from 'lucide-react';
import { supabaseService } from '../lib/supabase';
import { AvatarImage } from './AvatarImage';

interface LeaderboardProps {
  currentUserId?: string;
  onClose: () => void;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  gamesPlayed: number;
  wins: number;
  coins: number;
  avatar?: string;
  winRate: number;
}

type Category = 'wins' | 'winRate' | 'games' | 'coins';

const categoryConfig = {
  wins: { label: 'Galibiyet', icon: Trophy, color: 'from-yellow-400 to-amber-500' },
  winRate: { label: 'Başarı', icon: Target, color: 'from-blue-400 to-cyan-500' },
  games: { label: 'Oyun', icon: Gamepad2, color: 'from-purple-400 to-pink-500' },
  coins: { label: 'Coin', icon: CircleDollarSign, color: 'from-green-400 to-emerald-500' }
};

export function Leaderboard({ currentUserId, onClose }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('wins');
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

  useEffect(() => {
    const unsub = supabaseService.subscribeToUsers((users) => {
      const leaderboard = users
        .map(user => ({
          id: user.id,
          username: user.username || 'Anonim',
          gamesPlayed: user.games_played || 0,
          wins: user.wins || 0,
          coins: user.coins || 0,
          avatar: user.avatar,
          winRate: user.games_played > 0 ? Math.round((user.wins / user.games_played) * 100) : 0
        }))
        .filter(u => u.gamesPlayed > 0);
      
      setLeaders(leaderboard);
      setLoading(false);

      // Find current user's rank
      if (currentUserId) {
        const sorted = [...leaderboard].sort((a, b) => b.wins - a.wins);
        const rank = sorted.findIndex(u => u.id === currentUserId) + 1;
        setCurrentUserRank(rank > 0 ? rank : null);
      }
    });
    return () => unsub();
  }, [currentUserId]);

  const getSortedLeaders = () => {
    const sorted = [...leaders];
    switch (category) {
      case 'wins':
        return sorted.sort((a, b) => b.wins - a.wins);
      case 'winRate':
        return sorted.filter(u => u.gamesPlayed >= 5).sort((a, b) => b.winRate - a.winRate);
      case 'games':
        return sorted.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
      case 'coins':
        return sorted.sort((a, b) => b.coins - a.coins);
      default:
        return sorted;
    }
  };

  const sortedLeaders = getSortedLeaders();
  const top3 = sortedLeaders.slice(0, 3);
  const restLeaders = sortedLeaders.slice(3, 20);

  const getRankBadge = (index: number) => {
    if (index === 0) return { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-900', icon: Crown };
    if (index === 1) return { bg: 'from-zinc-300 to-zinc-400', text: 'text-zinc-700', icon: Medal };
    if (index === 2) return { bg: 'from-amber-600 to-amber-700', text: 'text-white', icon: Medal };
    return null;
  };

  const getPodiumHeight = (index: number) => {
    if (index === 0) return 'h-32';
    if (index === 1) return 'h-24';
    return 'h-20';
  };

  const getPodiumOrder = () => {
    if (top3.length < 3) return top3;
    return [top3[1], top3[0], top3[2]]; // Silver, Gold, Bronze order
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 z-[100] overflow-hidden"
      onClick={onClose}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 15, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {['🏆', '👑', '⭐', '🔥', '💎', '🎯', '🏅', '🥇', '🥈', '🥉', '💫', '✨'][i]}
          </motion.div>
        ))}
      </div>

      <div
        className="relative flex flex-col h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-4 border-b border-zinc-200/50 flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900">Liderlik Tablosu</h2>
              <p className="text-xs text-zinc-500 font-medium">En iyi oyuncular</p>
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

        {/* Category Tabs */}
        <div className="relative flex gap-2 p-4 overflow-x-auto bg-white/60 backdrop-blur-sm border-b border-zinc-200/50">
          {(Object.keys(categoryConfig) as Category[]).map((cat, index) => {
            const config = categoryConfig[cat];
            const Icon = config.icon;
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                  category === cat
                    ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                    : 'bg-white text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{config.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-4 pb-20">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-zinc-500 font-medium">Yükleniyor...</p>
              </div>
            </div>
          ) : leaders.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="font-bold text-zinc-700 mb-1">Henüz Lider Yok</h3>
                <p className="text-sm text-zinc-500">İlk sıralamaya sen girmeye başla!</p>
              </div>
            </div>
          ) : (
            <>
              {/* Podium - Top 3 */}
              {top3.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-end justify-center gap-3 mb-4">
                    {getPodiumOrder().map((player, podiumIndex) => {
                      const actualIndex = sortedLeaders.findIndex(l => l.id === player.id);
                      const rankBadge = getRankBadge(actualIndex);
                      const isSecond = podiumIndex === 0;
                      const isFirst = podiumIndex === 1;
                      const isThird = podiumIndex === 2;
                      
                      return (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: podiumIndex * 0.1, type: 'spring', stiffness: 200 }}
                          className="flex flex-col items-center"
                        >
                          {/* Avatar */}
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative mb-2"
                          >
                            <AvatarImage
                              avatarId={player.avatar || 'avatar_default_1'}
                              size={isFirst ? 72 : isSecond ? 60 : 52}
                              className={`ring-4 ${
                                isFirst ? 'ring-yellow-400' : isSecond ? 'ring-zinc-300' : 'ring-amber-600'
                              } ring-offset-2 shadow-xl`}
                            />
                            {rankBadge && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + podiumIndex * 0.1, type: 'spring' }}
                                className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${rankBadge.bg} ${rankBadge.text} rounded-full flex items-center justify-center shadow-lg`}
                              >
                                <rankBadge.icon className="w-4 h-4" />
                              </motion.div>
                            )}
                          </motion.div>

                          {/* Name */}
                          <p className={`font-bold text-sm mb-1 ${isFirst ? 'text-yellow-700' : isSecond ? 'text-zinc-700' : 'text-amber-800'}`}>
                            {player.username}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-1 text-xs font-bold mb-2">
                            {category === 'wins' && (
                              <>
                                <Trophy className="w-3 h-3" />
                                <span>{player.wins}</span>
                              </>
                            )}
                            {category === 'winRate' && (
                              <>
                                <Target className="w-3 h-3" />
                                <span>%{player.winRate}</span>
                              </>
                            )}
                            {category === 'games' && (
                              <>
                                <Gamepad2 className="w-3 h-3" />
                                <span>{player.gamesPlayed}</span>
                              </>
                            )}
                            {category === 'coins' && (
                              <>
                                <CircleDollarSign className="w-3 h-3" />
                                <span>{player.coins}</span>
                              </>
                            )}
                          </div>

                          {/* Podium Base */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            transition={{ delay: 0.3 + podiumIndex * 0.1, type: 'spring', stiffness: 150 }}
                            className={`w-20 ${getPodiumHeight(podiumIndex)} bg-gradient-to-t rounded-t-2xl flex items-start justify-center pt-2 shadow-lg ${
                              isFirst ? 'from-yellow-400 to-amber-500' : isSecond ? 'from-zinc-300 to-zinc-400' : 'from-amber-600 to-amber-700'
                            }`}
                          >
                            <span className={`text-2xl font-black ${isFirst ? 'text-yellow-900' : isSecond ? 'text-zinc-700' : 'text-white'}`}>
                              {actualIndex + 1}
                            </span>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rest of Leaders */}
              {restLeaders.length > 0 && (
                <div className="space-y-2">
                  {restLeaders.map((player, index) => {
                    const actualIndex = index + 3;
                    const isCurrentUser = player.id === currentUserId;
                    
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 shadow-md'
                            : 'bg-white border border-zinc-100 hover:shadow-md'
                        }`}
                      >
                        {/* Rank */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                          actualIndex <= 3
                            ? 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-700'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          #{actualIndex + 1}
                        </div>

                        {/* Avatar */}
                        <AvatarImage
                          avatarId={player.avatar || 'avatar_default_1'}
                          size={40}
                          className={isCurrentUser ? 'ring-2 ring-red-400' : ''}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold truncate ${isCurrentUser ? 'text-red-700' : 'text-zinc-900'}`}>
                            {player.username}
                            {isCurrentUser && <span className="ml-1 text-xs">(Sen)</span>}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                              <Gamepad2 className="w-3 h-3" />
                              <span>{player.gamesPlayed}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-red-500">
                              <Swords className="w-3 h-3" />
                              <span className="font-bold">{player.wins}</span>
                            </div>
                            {player.winRate > 0 && (
                              <div className="flex items-center gap-1 text-xs text-blue-500">
                                <Target className="w-3 h-3" />
                                <span>%{player.winRate}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Category Value */}
                        <div className="text-right">
                          {category === 'wins' && (
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              <span className="font-black text-lg text-yellow-600">{player.wins}</span>
                            </div>
                          )}
                          {category === 'winRate' && (
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="font-black text-lg text-blue-600">%{player.winRate}</span>
                            </div>
                          )}
                          {category === 'games' && (
                            <div className="flex items-center gap-1">
                              <Gamepad2 className="w-4 h-4 text-purple-500" />
                              <span className="font-black text-lg text-purple-600">{player.gamesPlayed}</span>
                            </div>
                          )}
                          {category === 'coins' && (
                            <div className="flex items-center gap-1">
                              <CircleDollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-black text-lg text-green-600">{player.coins}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Current User Rank Card */}
              {currentUserRank && currentUserRank > 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-xl shadow-red-500/30 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-black">#{currentUserRank}</span>
                      </div>
                      <div>
                        <p className="font-bold">Sıralaman</p>
                        <p className="text-xs text-white/80">Toplam {leaders.length} oyuncu arasından</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      <Star className="w-8 h-8 text-yellow-300" />
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
