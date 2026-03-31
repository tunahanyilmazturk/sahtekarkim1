import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Check, Play, Vote } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Player, GameStatus } from '../types';

interface PlayerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  myId: string;
  status: GameStatus;
  currentTurnIndex: number;
  votes: Record<string, string>;
  isHost: boolean;
  round: number;
  error?: string;
  onStartGame: () => void;
  onStartVoting: () => void;
  onReturnToLobby: () => void;
}

export function PlayerDrawer({
  isOpen,
  onClose,
  players,
  myId,
  status,
  currentTurnIndex,
  votes,
  isHost,
  round,
  error,
  onStartGame,
  onStartVoting,
  onReturnToLobby,
}: PlayerDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-40 backdrop-blur-md" 
            onClick={onClose} 
          />
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] z-50 flex flex-col max-h-[85dvh] overflow-hidden shadow-2xl"
          >
            <div className="p-5 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-white">
              <h2 className="font-black text-xl text-zinc-900">Oyuncular ({players.length})</h2>
              <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full active:scale-90 transition-transform hover:bg-zinc-200">
                <X className="w-5 h-5 text-zinc-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50">
              {players.map((p, idx) => (
                <motion.div 
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all",
                    status === 'playing' && currentTurnIndex === idx 
                      ? "bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 shadow-sm" 
                      : "bg-white border border-zinc-100",
                    p.id === myId ? "font-bold" : "font-medium text-zinc-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-2xl">{p.avatar}</span>
                      {status === 'playing' && currentTurnIndex === idx && (
                        <motion.span 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[16px] flex items-center gap-2">
                        {p.name} 
                        {p.id === myId && <span className="text-zinc-400 text-sm">(Sen)</span>}
                        {p.isHost && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      </span>
                      <span className="text-xs font-bold text-zinc-400 uppercase">{p.score} Puan</span>
                    </div>
                  </div>
                  {status === 'playing' && currentTurnIndex === idx && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">Sıra</span>
                  )}
                  {status === 'voting' && votes[p.id] && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </motion.div>
              ))}
            </div>
            
            {isHost && (
              <div className="p-4 bg-white border-t border-zinc-100 space-y-3 shrink-0 pb-safe">
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-xl"
                  >
                    {error}
                  </motion.p>
                )}
                
                {status === 'waiting' && (
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartGame}
                    className="w-full py-5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-zinc-800 hover:to-zinc-700 active:scale-95 transition-all shadow-lg shadow-zinc-900/15"
                  >
                    <Play className="w-5 h-5" />
                    {round > 0 ? 'Yeni Turu Başlat' : 'Oyunu Başlat'}
                  </motion.button>
                )}
                {status === 'playing' && (
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onStartVoting}
                    className="w-full py-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-500 active:scale-95 transition-all shadow-lg shadow-red-500/25"
                  >
                    <Vote className="w-5 h-5" />
                    Oylamayı Başlat
                  </motion.button>
                )}
                {status === 'finished' && (
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onReturnToLobby}
                    className="w-full py-5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-zinc-800 hover:to-zinc-700 active:scale-95 transition-all shadow-lg shadow-zinc-900/15"
                  >
                    Lobiye Dön ve Puanları Sıfırla
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
