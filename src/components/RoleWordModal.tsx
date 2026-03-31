import { motion } from 'motion/react';
import { X, Skull, Shield, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import type { PlayerRole } from '../types';

interface RoleWordModalProps {
  role: PlayerRole;
  word?: string | null;
  hint?: string | null;
  onClose: () => void;
}

export function RoleWordModal({ role, word, hint, onClose }: RoleWordModalProps) {
  const isImpostor = role === 'impostor';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-6 rounded-[2.5rem] w-full max-w-sm text-center flex flex-col items-center shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-zinc-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 15 }}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-xl",
            isImpostor
              ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30"
              : "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
          )}
        >
          {isImpostor ? (
            <Skull className="w-10 h-10 text-white" />
          ) : (
            <Shield className="w-10 h-10 text-white" />
          )}
        </motion.div>

        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Rolün</p>
        <h2 className={cn(
          "text-3xl font-black mb-5",
          isImpostor ? "text-red-500" : "text-blue-500"
        )}>
          {isImpostor ? 'SAHTEKAR' : 'VATANDAŞ'}
        </h2>

        <div className={cn(
          "w-full p-5 rounded-2xl border-2",
          isImpostor
            ? "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200"
            : "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200"
        )}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Eye className={cn("w-4 h-4", isImpostor ? "text-red-500" : "text-blue-500")} />
            <p className={cn(
              "text-xs font-bold uppercase tracking-wider",
              isImpostor ? "text-red-500" : "text-blue-500"
            )}>
              {isImpostor ? 'İPUCUN' : 'GİZLİ KELİMEN'}
            </p>
          </div>
          <p className="text-2xl font-black text-zinc-900">
            {isImpostor ? hint : word}
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="mt-5 px-6 py-3 bg-zinc-100 text-zinc-700 rounded-2xl font-bold text-sm w-full"
        >
          Kapat
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
