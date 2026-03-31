import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Clock, Trophy, Shuffle, Zap, Target, 
  Check, ChevronDown, ChevronUp, Settings2, Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CATEGORIES } from '../lib/words';
import { DIFFICULTY_INFO, CATEGORY_ICONS } from '../lib/constants';
import type { GameSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface RoomSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSave: (settings: GameSettings) => void;
}

export function RoomSettings({ isOpen, onClose, settings = DEFAULT_SETTINGS, onSave }: RoomSettingsProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [expandedSection, setExpandedSection] = useState<string | null>('categories');

  const toggleCategory = (category: string) => {
    setLocalSettings(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const selectAllCategories = () => {
    setLocalSettings(prev => ({
      ...prev,
      categories: Object.values(CATEGORIES)
    }));
  };

  const toggleDifficulty = (diff: 'easy' | 'medium' | 'hard') => {
    setLocalSettings(prev => ({ ...prev, difficulty: diff }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const Section = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="border border-zinc-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-red-500" />
          <span className="font-bold text-zinc-900">{title}</span>
        </div>
        {expandedSection === id ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl"
      >
        <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings2 className="w-6 h-6 text-white" />
            <h2 className="text-xl font-black text-white">Oda Ayarları</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <Section id="categories" title="Kategoriler" icon={Shuffle}>
            <div className="flex justify-end mb-2">
              <button
                onClick={selectAllCategories}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                Tümünü Seç
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(CATEGORIES).map(category => (
                <motion.button
                  key={category}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all",
                    localSettings.categories.includes(category)
                      ? "bg-red-100 text-red-700 border-2 border-red-300"
                      : "bg-zinc-100 text-zinc-600 border-2 border-transparent"
                  )}
                >
                  <span className="text-lg">{CATEGORY_ICONS[category] || '📁'}</span>
                  <span className="truncate">{category}</span>
                  {localSettings.categories.includes(category) && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </motion.button>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              {localSettings.categories.length} kategori seçildi
            </p>
          </Section>

          <Section id="time" title="Tur Süresi" icon={Clock}>
            <div className="space-y-3">
              {[30, 45, 60, 90, 120].map(time => (
                <button
                  key={time}
                  onClick={() => setLocalSettings(prev => ({ ...prev, roundTime: time }))}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                    localSettings.roundTime === time
                      ? "bg-red-100 border-2 border-red-300"
                      : "bg-zinc-100 border-2 border-transparent"
                  )}
                >
                  <span className="font-medium">{time} saniye</span>
                  {localSettings.roundTime === time && <Check className="w-5 h-5 text-red-500" />}
                </button>
              ))}
            </div>
          </Section>

          <Section id="rounds" title="Tur Sayısı" icon={Trophy}>
            <div className="space-y-3">
              {[3, 5, 7, 10].map(rounds => (
                <button
                  key={rounds}
                  onClick={() => setLocalSettings(prev => ({ ...prev, totalRounds: rounds }))}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                    localSettings.totalRounds === rounds
                      ? "bg-red-100 border-2 border-red-300"
                      : "bg-zinc-100 border-2 border-transparent"
                  )}
                >
                  <span className="font-medium">{rounds} tur</span>
                  {localSettings.totalRounds === rounds && <Check className="w-5 h-5 text-red-500" />}
                </button>
              ))}
            </div>
          </Section>

          <Section id="difficulty" title="Zorluk Seviyesi" icon={Zap}>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <motion.button
                  key={diff}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleDifficulty(diff)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                    localSettings.difficulty === diff
                      ? "bg-red-100 border-2 border-red-300"
                      : "bg-zinc-100 border-2 border-transparent"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full", DIFFICULTY_INFO[diff].color)} />
                  <span className="font-bold text-sm">{DIFFICULTY_INFO[diff].label}</span>
                  <span className="text-xs text-zinc-500">{DIFFICULTY_INFO[diff].desc}</span>
                </motion.button>
              ))}
            </div>
          </Section>

          <Section id="passes" title="Pas Hakkı" icon={Target}>
            <div className="space-y-3">
              {[1, 2, 3, 5].map(passes => (
                <button
                  key={passes}
                  onClick={() => setLocalSettings(prev => ({ ...prev, passTurns: passes }))}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl transition-all",
                    localSettings.passTurns === passes
                      ? "bg-red-100 border-2 border-red-300"
                      : "bg-zinc-100 border-2 border-transparent"
                  )}
                >
                  <span className="font-medium">{passes} pas hakkı</span>
                  {localSettings.passTurns === passes && <Check className="w-5 h-5 text-red-500" />}
                </button>
              ))}
            </div>
          </Section>
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-zinc-200 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-300 transition-colors"
          >
            İptal
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Kaydet
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export type { GameSettings } from '../types';
export { DEFAULT_SETTINGS } from '../types';
