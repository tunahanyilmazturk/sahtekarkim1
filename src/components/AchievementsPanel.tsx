import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Trophy, Coins } from 'lucide-react';
import { ACHIEVEMENTS, getAchievementProgress, type Achievement } from '../lib/achievements';
import { supabaseService } from '../lib/supabase';

interface AchievementsPanelProps {
  userId: string;
  onClose: () => void;
}

interface UserStats {
  wins: number;
  gamesPlayed: number;
  friendsCount: number;
  impostorWins: number;
  citizenWins: number;
  correctGuesses: number;
}

const CATEGORY_LABELS: Record<Achievement['category'], string> = {
  wins: 'Zafer',
  games: 'Oyun',
  social: 'Sosyal',
  special: 'Özel',
};

const CATEGORY_COLORS: Record<Achievement['category'], string> = {
  wins: 'from-amber-400 to-orange-500',
  games: 'from-blue-400 to-indigo-500',
  social: 'from-pink-400 to-rose-500',
  special: 'from-purple-400 to-violet-500',
};

export function AchievementsPanel({ userId, onClose }: AchievementsPanelProps) {
  const [stats, setStats] = useState<UserStats>({
    wins: 0, gamesPlayed: 0, friendsCount: 0,
    impostorWins: 0, citizenWins: 0, correctGuesses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await supabaseService.getUser(userId);
      if (user) {
        setStats({
          wins: user.wins || 0,
          gamesPlayed: user.games_played || 0,
          friendsCount: (user.friends || []).length,
          impostorWins: 0,
          citizenWins: 0,
          correctGuesses: 0,
        });
      }
      setLoading(false);
    })();
  }, [userId]);

  const unlockedCount = ACHIEVEMENTS.filter(a => {
    const progress = getAchievementProgress(a, stats);
    return progress >= 100;
  }).length;

  const totalReward = ACHIEVEMENTS.filter(a => getAchievementProgress(a, stats) >= 100)
    .reduce((sum, a) => sum + a.reward, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100 z-[100] overflow-hidden"
    >
      <div className="absolute inset-0 overflow-y-auto pt-safe pb-safe">
        <div className="max-w-md mx-auto min-h-full flex flex-col">

          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-zinc-200/50 px-4 py-3 pt-safe flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-zinc-900">Başarımlar</h2>
                <p className="text-xs text-zinc-500">{unlockedCount}/{ACHIEVEMENTS.length} açık · {totalReward} coin kazanıldı</p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600" />
            </motion.button>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex-1 p-4 space-y-3">
              {ACHIEVEMENTS.map((achievement, index) => {
                const progress = getAchievementProgress(achievement, stats);
                const isUnlocked = progress >= 100;

                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative rounded-2xl p-4 border transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                        isUnlocked
                          ? `bg-gradient-to-br ${CATEGORY_COLORS[achievement.category]} shadow-lg`
                          : 'bg-zinc-200 grayscale'
                      }`}>
                        {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-zinc-400" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-sm ${isUnlocked ? 'text-zinc-900' : 'text-zinc-500'}`}>
                            {achievement.title}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isUnlocked
                              ? 'bg-amber-200 text-amber-700'
                              : 'bg-zinc-200 text-zinc-500'
                          }`}>
                            {CATEGORY_LABELS[achievement.category]}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">{achievement.description}</p>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ delay: index * 0.05 + 0.2, type: 'spring', stiffness: 100 }}
                              className={`h-full rounded-full ${
                                isUnlocked
                                  ? `bg-gradient-to-r ${CATEGORY_COLORS[achievement.category]}`
                                  : 'bg-zinc-400'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500 shrink-0">{progress}%</span>
                        </div>

                        {isUnlocked && (
                          <div className="mt-1.5 flex items-center gap-1 text-xs font-bold text-amber-600">
                            <Coins className="w-3 h-3" />
                            <span>+{achievement.reward} coin</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
