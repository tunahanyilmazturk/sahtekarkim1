import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ImpostorGuessModalProps {
  isOpen: boolean;
  onClose: () => void;
  guess: string;
  onGuessChange: (guess: string) => void;
  onSubmit: () => void;
}

export function ImpostorGuessModal({ isOpen, onClose, guess, onGuessChange, onSubmit }: ImpostorGuessModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-xl text-zinc-900">Kelimeyi Tahmin Et</h3>
                <button onClick={onClose} className="p-1 bg-zinc-100 rounded-full">
                  <X className="w-5 h-5 text-zinc-600" />
                </button>
              </div>
              <p className="text-sm text-zinc-500 mb-6 font-medium leading-relaxed">
                Eğer kelimeyi doğru bilirsen oyunu anında kazanırsın. Yanlış bilirsen kaybedersin!
              </p>
              <form onSubmit={handleSubmit}>
                <input 
                  type="text"
                  value={guess}
                  onChange={(e) => onGuessChange(e.target.value)}
                  placeholder="Tahmininiz..."
                  className="w-full px-5 py-4 rounded-2xl bg-zinc-100 border-2 border-transparent focus:border-red-500 focus:bg-white outline-none text-[16px] font-bold mb-4 transition-colors"
                  autoFocus
                />
                <button 
                  type="submit" 
                  disabled={!guess.trim()} 
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-lg disabled:opacity-50 active:scale-95 transition-transform"
                >
                  Tahmin Et
                </button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
