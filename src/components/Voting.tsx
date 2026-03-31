import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vote, Clock, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Player } from '../types';

interface VotingProps {
  players: Player[];
  myId: string;
  votes: Record<string, string>;
  onVote: (playerId: string) => void;
  timeLimit?: number; // saniye cinsinden, varsayılan 60
}

const VOTE_TIME_LIMIT = 60;

export function Voting({ players, myId, votes, onVote, timeLimit = VOTE_TIME_LIMIT }: VotingProps) {
  const [localVote, setLocalVote] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [hasAutoVoted, setHasAutoVoted] = useState(false);

  const otherPlayers = players.filter((p) => p.id !== myId);
  const myVote = votes[myId] || localVote;
  const totalVotes = Object.keys(votes).length;
  const totalPlayers = players.length;

  // Zaman sayacı
  useEffect(() => {
    if (myVote) return; // Oy verdikten sonra sayacı durdur

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [myVote]);

  // Süre dolunca otomatik rastgele oy ver
  useEffect(() => {
    if (timeLeft === 0 && !myVote && !hasAutoVoted && otherPlayers.length > 0) {
      setHasAutoVoted(true);
      const randomTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
      setLocalVote(randomTarget.id);
      onVote(randomTarget.id);
    }
  }, [timeLeft, myVote, hasAutoVoted, otherPlayers, onVote]);

  // Her oyuncu için kaç oy aldığını hesapla
  const voteCounts: Record<string, number> = {};
  Object.values(votes).forEach((votedId) => {
    voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
  });

  const timerProgress = (timeLeft / timeLimit) * 100;
  const timerColor = timeLeft > 20 ? 'from-green-400 to-emerald-500' : timeLeft > 10 ? 'from-yellow-400 to-orange-400' : 'from-red-400 to-red-600';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 bg-gradient-to-b from-white to-zinc-50 flex flex-col items-center justify-start pt-safe p-6 overflow-y-auto"
    >
      {/* Icon */}
      <motion.div 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4 mt-6 shadow-2xl shadow-red-500/30"
      >
        <Vote className="w-10 h-10 text-white" />
      </motion.div>

      {/* Başlık */}
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-black text-zinc-900 mb-1 text-center"
      >
        KİM <span className="text-gradient">SAHTEKAR?</span>
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-zinc-500 font-medium mb-5 text-center text-sm"
      >
        Şüphelendiğin kişiye oy ver.
      </motion.p>

      {/* Zaman Sayacı */}
      {!myVote && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mb-5"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>Kalan süre</span>
            </div>
            <motion.span
              key={timeLeft}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className={cn(
                "text-xl font-black tabular-nums",
                timeLeft > 20 ? "text-emerald-600" : timeLeft > 10 ? "text-orange-500" : "text-red-600"
              )}
            >
              {timeLeft}s
            </motion.span>
          </div>
          <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full bg-gradient-to-r", timerColor)}
              animate={{ width: `${timerProgress}%` }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}

      {/* Oy Sayacı */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-2 mb-5 text-sm font-semibold text-zinc-500"
      >
        <Users className="w-4 h-4" />
        <span>
          <span className="text-zinc-800">{totalVotes}</span>/{totalPlayers} oy kullandı
        </span>
        {/* Oy dot'ları */}
        <div className="flex gap-1 ml-1">
          {players.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                votes[p.id] ? "bg-red-500" : "bg-zinc-300"
              )}
            />
          ))}
        </div>
      </motion.div>

      {/* Oyuncu Butonları */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <AnimatePresence mode="popLayout">
          {otherPlayers.map((p, idx) => {
            const voteCount = voteCounts[p.id] || 0;
            const isVotedByMe = myVote === p.id;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 * idx + 0.3 }}
                whileHover={!myVote ? { scale: 1.03, y: -2 } : undefined}
                whileTap={!myVote ? { scale: 0.97 } : undefined}
                onClick={() => {
                  if (!myVote) {
                    setLocalVote(p.id);
                    onVote(p.id);
                  }
                }}
                disabled={!!myVote}
                className={cn(
                  "p-4 rounded-3xl border-2 font-bold text-lg transition-all flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden",
                  isVotedByMe
                    ? "border-red-500 bg-gradient-to-br from-red-50 to-red-100 text-red-600 shadow-lg shadow-red-500/20"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:shadow-md",
                  myVote && !isVotedByMe && "opacity-50"
                )}
              >
                {/* Arka plan progress bar (oy oranı) */}
                {voteCount > 0 && (
                  <motion.div
                    className="absolute inset-0 bg-red-50 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: voteCount / Math.max(totalPlayers, 1) }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}
                <div className="relative z-10 text-4xl mb-0.5">{p.avatar}</div>
                <span className="relative z-10 truncate w-full text-center text-sm leading-tight">{p.name}</span>
                {/* Oy sayısı rozeti */}
                <AnimatePresence>
                  {voteCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="relative z-10 flex items-center gap-1 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full"
                    >
                      <Vote className="w-3 h-3" />
                      {voteCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Oy verildi bildirimi */}
      <AnimatePresence>
        {myVote && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-5 bg-white rounded-2xl w-full max-w-md flex items-center justify-center gap-3 shadow-lg border border-zinc-100"
          >
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-red-500 rounded-full animate-spin shrink-0"></div>
            <div>
              <p className="font-bold text-zinc-700 text-sm">Oyun kullanıldı!</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                {totalVotes}/{totalPlayers} oyuncu oy kullandı
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
