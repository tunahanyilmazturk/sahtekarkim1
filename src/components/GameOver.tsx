import { motion } from 'motion/react';
import { Trophy, ArrowRight, Skull, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Player, Winner } from '../types';

interface GameOverProps {
  winner: Winner | null | undefined;
  lastWord: string | null | undefined;
  players: Player[];
  round: number;
  isHost: boolean;
  onNextRound: () => void;
  onReturnToLobby: () => void;
  onWaiting?: () => void;
}

export function GameOver({ winner, lastWord, players, round, isHost, onNextRound, onReturnToLobby, onWaiting }: GameOverProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isImpostorWin = winner === 'impostor';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white w-full max-w-md rounded-[2rem] p-6 flex flex-col items-center shadow-2xl"
      >
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", damping: 15 }}
          className={cn(
            "w-24 h-24 mb-4 rounded-full flex items-center justify-center shadow-2xl",
            isImpostorWin ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30" : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
          )}
        >
          {isImpostorWin ? (
            <Skull className="w-12 h-12 text-white" />
          ) : (
            <Users className="w-12 h-12 text-white" />
          )}
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-black text-zinc-900 mb-3 text-center leading-tight"
        >
          {isImpostorWin ? (
            <>SAHTEKAR<br/><span className="text-gradient">KAZANDI!</span></>
          ) : (
            <>VATANDAŞLAR<br/><span className="text-blue-500">KAZANDI!</span></>
          )}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-500 font-medium mb-6 text-center"
        >
          Gizli Kelime: <span className="font-black text-zinc-900 uppercase text-lg">{lastWord}</span>
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-gradient-to-b from-zinc-50 to-white rounded-2xl p-4 mb-6 space-y-2 border border-zinc-100"
        >
          <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-wider text-center mb-3">Puan Durumu <span className="text-zinc-300">(Tur {round})</span></h3>
          {sortedPlayers.map((p, idx) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
              className={cn(
                "flex justify-between items-center font-bold bg-white p-3 rounded-xl shadow-sm",
                idx === 0 && "border-2 border-yellow-400/50"
              )}
            >
              <span className="flex items-center gap-2">
                {idx === 0 && <Trophy className="w-4 h-4 text-yellow-500" />}
                <span className="text-zinc-400 text-xs mr-1">{idx + 1}.</span>
                {p.avatar} {p.name}
              </span>
              <span className={cn("font-black", idx === 0 ? "text-yellow-500" : "text-zinc-900")}>
                {p.score} Puan
              </span>
            </motion.div>
          ))}
        </motion.div>

        {isHost ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col gap-3 w-full"
          >
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNextRound} 
              className="w-full py-5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-zinc-900/15"
            >
              Sonraki Tur <ArrowRight className="w-5 h-5"/>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReturnToLobby} 
              className="w-full py-4 bg-zinc-100 text-zinc-700 rounded-2xl font-bold active:scale-95 transition-all"
            >
              Lobiye Dön
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-full p-5 bg-zinc-50 rounded-2xl flex items-center justify-center gap-3 border border-zinc-100"
          >
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-red-500 rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-bold text-sm">Kurucunun yeni turu başlatması bekleniyor...</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
