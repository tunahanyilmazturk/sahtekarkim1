import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Settings2, Eye, EyeOff } from 'lucide-react';
import { RoomSettings, type GameSettings, DEFAULT_SETTINGS } from './RoomSettings';
import { CATEGORIES } from '../lib/words';

export interface OnlineSettings {
  roomPassword?: string;
  gameSettings: GameSettings;
}

interface OnlineSetupProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  roomId: string;
  onRoomIdChange: (id: string) => void;
  error: string;
  isLoading?: boolean;
  onCreateRoom: (settings?: OnlineSettings) => void;
  onJoinRoom: (password?: string) => void;
  onBack: () => void;
}

export function OnlineSetup({ playerName, onPlayerNameChange, roomId, onRoomIdChange, error, isLoading, onCreateRoom, onJoinRoom, onBack }: OnlineSetupProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roomPassword, setRoomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');
  const [showJoinPassword, setShowJoinPassword] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  useEffect(() => {
    const handleJoinRoomWithCode = (e: CustomEvent) => {
      onRoomIdChange(e.detail);
      setActiveTab('join');
    };
    window.addEventListener('joinRoomWithCode', handleJoinRoomWithCode as EventListener);
    return () => window.removeEventListener('joinRoomWithCode', handleJoinRoomWithCode as EventListener);
  }, [onRoomIdChange]);

  const handleCreate = () => {
    onCreateRoom({
      roomPassword: roomPassword || undefined,
      gameSettings: settings,
    });
  };

  const handleJoin = () => {
    onJoinRoom(joinPassword);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-[100dvh] bg-white"
    >
      <div className="p-4 pt-safe flex items-center border-b border-zinc-100">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 rounded-full">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-black text-zinc-900 ml-2">Online Lobi</h2>
        <button 
          onClick={() => setSettingsOpen(true)} 
          className="ml-auto p-2 text-zinc-400 hover:text-zinc-900 rounded-full active:scale-90 transition-transform"
        >
          <Settings2 className="w-6 h-6" />
        </button>
        {isLoading && (
          <div className="w-5 h-5 border-2 border-zinc-200 border-t-red-500 rounded-full animate-spin" />
        )}
      </div>

      <RoomSettings 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        settings={settings}
        onSave={(s) => { setSettings(s); setSettingsOpen(false); }}
      />
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col max-w-md mx-auto w-full space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3"
          >
            <span className="text-lg">⚠️</span>
            {error}
          </motion.div>
        )}

        <div className="space-y-3">
          <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Oyuncu Adı</label>
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            className="w-full px-5 py-4 rounded-2xl bg-zinc-100 border-2 border-transparent focus:border-zinc-900 focus:bg-white transition-colors font-bold text-[16px] outline-none"
            placeholder="Adınızı girin..."
            maxLength={15}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">
              Oda Şifresi (isteğe bağlı)
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                className="w-full px-5 py-4 pr-12 rounded-2xl bg-zinc-100 border-2 border-transparent focus:border-zinc-900 focus:bg-white transition-colors font-bold text-[16px] outline-none"
                placeholder="Şifre belirle..."
                maxLength={10}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-red-500 text-white rounded-2xl font-bold text-lg hover:bg-red-600 active:scale-95 transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="text-xl">🎮</span>
            Yeni Oda Kur
          </motion.button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-100"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-300 text-sm font-bold uppercase tracking-widest">veya</span>
            <div className="flex-grow border-t border-zinc-100"></div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Oda Kodu ile Katıl</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={roomId}
                onChange={(e) => onRoomIdChange(e.target.value.toUpperCase())}
                className="flex-1 px-5 py-4 rounded-2xl bg-zinc-100 border-2 border-transparent focus:border-zinc-900 focus:bg-white transition-colors font-bold text-[16px] outline-none uppercase tracking-widest disabled:opacity-50"
                placeholder="KOD"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <input 
                type={showJoinPassword ? "text" : "password"}
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                className="w-full px-5 py-4 pr-12 rounded-2xl bg-zinc-100 border-2 border-transparent focus:border-zinc-900 focus:bg-white transition-colors font-bold text-[16px] outline-none"
                placeholder="Oda şifresi (varsa)"
                maxLength={10}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowJoinPassword(!showJoinPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showJoinPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={isLoading || !roomId.trim()}
              className="w-full py-4 px-6 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 active:scale-95 transition-all shadow-xl shadow-zinc-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="text-xl">🚪</span>
              Odaya Katıl
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
