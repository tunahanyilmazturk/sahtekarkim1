import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import type { Player, PlayerRole, Winner } from '../types';

export function RoleRevealCard({ 
  player, 
  onNext 
}: { 
  player: Player; 
  onNext: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6"
    >
      <motion.div 
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm text-center flex flex-col items-center shadow-2xl"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-6xl mb-4"
        >
          {player.avatar}
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-black text-zinc-900 mb-6"
        >
          {player.name}, sıra sende!
        </motion.h2>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/25 mb-4"
        >
          Rolümü Göster
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-2xl font-bold"
        >
          {player.isHost ? 'Herkes gördü - Oyunu Başlat' : 'Cihazı bir sonraki kişiye ver'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function RoleDisplayCard({ 
  role, 
  word, 
  hint,
  onClose,
  isLastPlayer,
}: { 
  role: PlayerRole;
  word?: string | null;
  hint?: string | null;
  onClose: () => void;
  isLastPlayer: boolean;
}) {
  const isImpostor = role === 'impostor';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6"
    >
      <motion.div 
        initial={{ scale: 0.5, y: 50, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm text-center flex flex-col items-center shadow-2xl"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", damping: 15 }}
          className={cn(
            "w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-2xl",
            isImpostor 
              ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30" 
              : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
          )}
        >
          <span className="text-5xl">{isImpostor ? '🎭' : '🛡️'}</span>
        </motion.div>
        
        <motion.h3 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2"
        >
          Rolün
        </motion.h3>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "text-4xl font-black mb-6",
            isImpostor ? "text-gradient" : "text-blue-500"
          )}
        >
          {isImpostor ? 'SAHTEKAR' : 'VATANDAŞ'}
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={cn(
            "w-full p-6 rounded-3xl border-2",
            isImpostor 
              ? "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200" 
              : "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
          )}
        >
          <p className={cn(
            "text-sm font-bold mb-2 uppercase tracking-wider",
            isImpostor ? "text-red-500" : "text-blue-500"
          )}>
            {isImpostor ? 'İPUCU' : 'GİZLİ KELİME'}
          </p>
          <motion.p 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
            className="text-3xl font-black text-zinc-900"
          >
            {isImpostor ? hint : word}
          </motion.p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="mt-8 w-full py-4 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl font-bold"
        >
          {isLastPlayer ? 'Oyunu Başlat' : 'Tamam - Bir Sonraki Kişiye Ver'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function PassDeviceScreen({ 
  currentPlayer, 
  onConfirm 
}: { 
  currentPlayer: Player; 
  onConfirm: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6"
    >
      <motion.div 
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm text-center flex flex-col items-center shadow-2xl"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          📱
        </motion.div>
        
        <h2 className="text-2xl font-black text-zinc-900 mb-2">
          Cihazı Ver
        </h2>
        
        <p className="text-zinc-500 mb-6">
          <span className="font-bold text-zinc-900">{currentPlayer.name}</span> kelimeyi görmek için
        </p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
          className="w-full py-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-500/25"
        >
          Görüntüle
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function GameOverScreen({ winner, lastWord, players, round, onNextRound, onExit }: {
  winner: Winner | null;
  lastWord?: string;
  players: Player[];
  round: number;
  onNextRound: () => void;
  onExit: () => void;
}) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isImpostorWin = winner === 'impostor';

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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
          <span className="text-5xl">{isImpostorWin ? '🎭' : '🛡️'}</span>
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
          {lastWord && <span>Gizli kelime: <span className="font-black text-zinc-900">{lastWord}</span></span>}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full space-y-2 mb-6 max-h-48 overflow-y-auto"
        >
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl",
                index === 0 ? "bg-yellow-50" : "bg-zinc-50"
              )}
            >
              <span className={cn(
                "font-black w-6",
                index === 0 ? "text-yellow-500" : "text-zinc-400"
              )}>
                {index + 1}
              </span>
              <span className="text-2xl">{player.avatar}</span>
              <span className="flex-1 font-bold text-zinc-900">{player.name}</span>
              <span className="font-black text-zinc-900">{player.score}</span>
            </div>
          ))}
        </motion.div>

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNextRound}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold mb-3 shadow-lg shadow-red-500/25"
        >
          Yeni Tur
        </motion.button>

        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExit}
          className="w-full py-3 bg-zinc-100 text-zinc-600 rounded-2xl font-bold"
        >
          Menüye Dön
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
