import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Plus, Trash2, Smartphone, Settings2, Users, ChevronLeft } from 'lucide-react';
import { GAME_CONFIG } from '../lib/constants';
import { RoomSettings, type GameSettings } from './RoomSettings';
import { CATEGORIES } from '../lib/words';

interface OfflineSetupProps {
  onBack: () => void;
  onStartGame: (playerNames: { name: string; isBot: boolean }[]) => void;
}

const AVAILABLE_AVATARS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦋', '🐙', '🦄', '🦖'];

export function OfflineSetup({ onBack, onStartGame }: OfflineSetupProps) {
  const [players, setPlayers] = useState<{ id: string; name: string; avatar: string }[]>([
    { id: '1', name: '', avatar: '🐶' },
    { id: '2', name: '', avatar: '🐱' },
    { id: '3', name: '', avatar: '🦊' },
  ]);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    categories: Object.values(CATEGORIES),
    roundTime: 60,
    totalRounds: 5,
    difficulty: 'medium',
    passTurns: 2,
    points: { citizenWin: 10, impostorWin: 15, correctGuess: 20, tie: 5 },
  });

  const addPlayer = () => {
    if (players.length >= GAME_CONFIG.MAX_PLAYERS) return;
    const newId = Math.random().toString(36).substring(7);
    const avatar = AVAILABLE_AVATARS[players.length % AVAILABLE_AVATARS.length];
    setPlayers([...players, { id: newId, name: '', avatar }]);
  };

  const removePlayer = (id: string) => {
    if (players.length <= GAME_CONFIG.MIN_PLAYERS) return;
    setPlayers(players.filter(p => p.id !== id));
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  const cycleAvatar = (id: string) => {
    setPlayers(players.map(p => {
      if (p.id !== id) return p;
      const currentIdx = AVAILABLE_AVATARS.indexOf(p.avatar);
      const nextIdx = (currentIdx + 1) % AVAILABLE_AVATARS.length;
      return { ...p, avatar: AVAILABLE_AVATARS[nextIdx] };
    }));
  };

  const handleStart = () => {
    setError('');
    const validPlayers = players.filter(p => p.name.trim().length >= 2);

    if (validPlayers.length < GAME_CONFIG.MIN_PLAYERS) {
      setError(`En az ${GAME_CONFIG.MIN_PLAYERS} oyuncu gereklidir`);
      return;
    }

    const playerNames = validPlayers.map(p => ({
      name: p.name.trim(),
      isBot: false,
    }));
    onStartGame(playerNames);
  };

  const clearAll = () => {
    setPlayers([
      { id: '1', name: '', avatar: '🐶' },
      { id: '2', name: '', avatar: '🐱' },
      { id: '3', name: '', avatar: '🦊' },
    ]);
    setError('');
  };

  const validCount = players.filter(p => p.name.trim().length >= 2).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-[100dvh] bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 2 }}
          >
            {['🎮', '🎲', '🃏', '🎯', '🏆', '🎪', '🎭', '🎬'][i]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative p-4 pt-safe border-b border-zinc-200/50 flex items-center justify-between bg-white/80 backdrop-blur-sm">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-600" />
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900">Aynı Cihazda</h2>
            <p className="text-xs text-zinc-500 font-medium">{players.length}/{GAME_CONFIG.MAX_PLAYERS} oyuncu</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSettingsOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <Settings2 className="w-5 h-5 text-zinc-600" />
        </motion.button>
      </div>

      <RoomSettings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={(s) => { setSettings(s); setSettingsOpen(false); }}
      />

      {/* Scrollable Content */}
      <div className="relative flex-1 overflow-y-auto p-4 space-y-5" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3"
            >
              <span className="text-xl">⚠️</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Settings Quick Preview */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Tur Süresi', value: `${settings.roundTime}s`, icon: '⏱️' },
            { label: 'Tur Sayısı', value: settings.totalRounds, icon: '🔄' },
            { label: 'Zorluk', value: settings.difficulty === 'easy' ? 'Kolay' : settings.difficulty === 'medium' ? 'Orta' : 'Zor', icon: '⚡' }
          ].map((s, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSettingsOpen(true)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-3 text-center border border-zinc-100 hover:shadow-md transition-shadow"
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <p className="text-sm font-black text-zinc-900">{s.value}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">{s.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Players Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Users className="w-4 h-4 text-zinc-500" />
            <h3 className="font-bold text-zinc-700 uppercase text-xs tracking-wider">
              Oyuncular ({validCount}/{players.length})
            </h3>
            {validCount >= GAME_CONFIG.MIN_PLAYERS && (
              <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Hazır</span>
            )}
          </div>

          <div className="space-y-2">
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                  player.name.trim().length >= 2
                    ? 'bg-white border-green-200 shadow-sm'
                    : 'bg-white border-zinc-200'
                }`}
              >
                {/* Avatar (clickable to cycle) */}
                <motion.button
                  whileTap={{ scale: 0.9, rotate: 10 }}
                  onClick={() => cycleAvatar(player.id)}
                  className="text-3xl w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 active:scale-90 transition-all"
                  title="Avatar değiştir"
                >
                  {player.avatar}
                </motion.button>

                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayerName(player.id, e.target.value)}
                  placeholder={`Oyuncu ${index + 1}`}
                  maxLength={GAME_CONFIG.PLAYER_NAME_MAX_LENGTH}
                  className="flex-1 px-3 py-2.5 rounded-xl border-2 font-bold outline-none transition-all text-sm bg-zinc-50 border-transparent focus:border-purple-400 focus:bg-white"
                />

                {players.length > GAME_CONFIG.MIN_PLAYERS && (
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removePlayer(player.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add Player Button */}
          {players.length < GAME_CONFIG.MAX_PLAYERS && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={addPlayer}
              className="w-full py-3.5 border-2 border-dashed border-purple-300 text-purple-500 font-bold rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Oyuncu Ekle
            </motion.button>
          )}

          {players.length > 3 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={clearAll}
              className="w-full py-3 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              Sıfırla
            </motion.button>
          )}
        </div>

        {/* How to Play Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100"
        >
          <h4 className="font-bold text-indigo-700 mb-3 flex items-center gap-2 text-sm">
            <span className="text-xl">💡</span> Nasıl Oynanır?
          </h4>
          <div className="space-y-2">
            {[
              'Her oyuncu sırayla kelimesini görür',
              'Kelimeyi görüp cihazı bir sonraki kişiye ver',
              'Sahtekarı bulmak için ipuçlarını tartışın',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-indigo-600">
                <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Start Button */}
      <div className="relative p-4 border-t border-zinc-200/50 bg-white/80 backdrop-blur-sm pb-safe">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-xl transition-all ${
            validCount >= GAME_CONFIG.MIN_PLAYERS
              ? 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white shadow-orange-500/30'
              : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
          }`}
        >
          <Play className="w-5 h-5" />
          Oyunu Başlat
          {validCount >= GAME_CONFIG.MIN_PLAYERS && (
            <span className="text-sm bg-white/20 px-2.5 py-0.5 rounded-full">{validCount} oyuncu</span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
