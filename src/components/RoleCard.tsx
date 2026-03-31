import { motion } from 'motion/react';
import { Users, Skull, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import type { PlayerRole } from '../types';

interface RoleCardProps {
  role: PlayerRole;
  word?: string | null;
  hint?: string | null;
  onClose?: () => void;
}

export function RoleCard({ role, word, hint, onClose }: RoleCardProps) {
  const isImpostor = role === 'impostor';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 cursor-pointer"
    >
      <motion.div 
        initial={{ scale: 0.5, y: 50, rotate: -10 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        exit={{ scale: 1.2, opacity: 0 }}
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
          {isImpostor ? (
            <Skull className="w-14 h-14 text-white" />
          ) : (
            <Shield className="w-14 h-14 text-white" />
          )}
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
            "text-4xl font-black mb-8",
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
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-zinc-400 font-medium mt-8 flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Devam etmek için ekrana dokun
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
