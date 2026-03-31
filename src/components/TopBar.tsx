import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '../lib/utils';

export function TopBar({ 
  title, 
  showBack, 
  onBack,
  soundEnabled,
  onToggleSound,
  rightAction,
}: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  rightAction?: React.ReactNode;
}) {
  return (
    <motion.header 
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-sm border-b border-zinc-200/50 px-4 py-3 pt-safe flex items-center justify-between shrink-0 z-10"
    >
      <div className="flex items-center gap-2">
        {showBack && onBack && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 rounded-full"
          >
            ←
          </motion.button>
        )}
        <h1 className="font-black text-lg tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {rightAction}
        {onToggleSound && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleSound}
            className="p-2 bg-zinc-100 rounded-full"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-zinc-700" /> : <VolumeX className="w-5 h-5 text-zinc-400" />}
          </motion.button>
        )}
      </div>
    </motion.header>
  );
}
