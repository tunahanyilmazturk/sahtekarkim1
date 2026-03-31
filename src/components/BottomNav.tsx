import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Users, Volume2, VolumeX, Vote, MessageCircle, 
  HelpCircle, Settings as SettingsIcon, Share2, User, Trophy, UsersRound
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Leaderboard } from './Leaderboard';
import { Profile } from './Profile';
import { Settings } from './Settings';
import { Social } from './Social';

type NavMode = 'menu' | 'online_setup' | 'offline_setup' | 'waiting' | 'playing' | 'voting' | 'finished';

interface BottomNavProps {
  mode: NavMode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onShowPlayers?: () => void;
  onShowHowToPlay?: () => void;
  onShowSettings?: () => void;
  onShowChat?: () => void;
  onShowGame?: () => void;
  onExit?: () => void;
  onShare?: () => void;
  onShowProfile?: () => void;
  onShowLeaderboard?: () => void;
  isHost?: boolean;
  onStartVoting?: () => void;
  activeTab?: 'game' | 'chat';
  currentUser?: { id: string; name: string; avatar?: string } | null;
  onLogout?: () => void;
  roomId?: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  show?: boolean;
  active?: boolean;
}

export function BottomNav({ 
  mode, 
  soundEnabled, 
  onToggleSound,
  onShowPlayers,
  onShowHowToPlay,
  onShowSettings,
  onShowChat,
  onShowGame,
  onExit,
  onShare,
  onShowProfile,
  onShowLeaderboard,
  isHost,
  onStartVoting,
  activeTab,
  currentUser,
  onLogout,
  roomId,
}: BottomNavProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

  const getNavItems = (): NavItem[] => {
    switch (mode) {
      case 'menu':
        return [
          { icon: Trophy, label: 'Lider', onClick: () => setShowLeaderboard(true) },
          { icon: UsersRound, label: 'Sosyal', onClick: () => { console.log('Sosyal clicked, currentUser:', currentUser); setShowSocial(true); } },
          { icon: User, label: 'Profil', onClick: () => setShowProfile(true) },
          { icon: SettingsIcon, label: 'Ayarlar', onClick: () => setShowSettings(true) },
        ];

      case 'online_setup':
      case 'offline_setup':
        return [
          { icon: Home, label: 'Ana', onClick: onExit || (() => {}) },
          { icon: soundEnabled ? Volume2 : VolumeX, label: 'Ses', onClick: onToggleSound },
        ];

      case 'waiting':
        return [
          { icon: Users, label: 'Oyuncular', onClick: onShowPlayers || (() => {}), show: !!onShowPlayers },
          { icon: soundEnabled ? Volume2 : VolumeX, label: 'Ses', onClick: onToggleSound },
          { icon: Share2, label: 'Paylaş', onClick: onShare || (() => {}), show: !!onShare },
          { icon: Home, label: 'Çık', onClick: onExit || (() => {}), variant: 'danger' },
        ];

      case 'playing':
        return [
          {
            icon: Vote,
            label: 'Oyla',
            onClick: onStartVoting || (() => {}),
            variant: isHost ? 'primary' : 'default',
            show: isHost
          },
          { icon: Home, label: 'Çık', onClick: onExit || (() => {}), variant: 'danger' },
        ];

      case 'voting':
        return [
          { icon: soundEnabled ? Volume2 : VolumeX, label: 'Ses', onClick: onToggleSound },
          { icon: Home, label: 'Çık', onClick: onExit || (() => {}), variant: 'danger' },
        ];

      case 'finished':
        return [
          { icon: soundEnabled ? Volume2 : VolumeX, label: 'Ses', onClick: onToggleSound },
          { icon: Home, label: 'Menü', onClick: onExit || (() => {}), variant: 'primary' },
        ];

      default:
        return [];
    }
  };

  const items = getNavItems().filter(item => item.show !== false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200/50 px-2 py-1 pb-safe z-50"
      >
        <div className="flex items-center justify-around">
          {items.map((item, idx) => {
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[52px] transition-all",
                  item.active && "bg-red-100 text-red-600",
                  item.variant === 'primary' && "bg-red-500 text-white",
                  item.variant === 'danger' && "text-red-500",
                  !item.variant && !item.active && "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                <Icon className={cn("w-5 h-5", item.variant === 'primary' && "w-5 h-5")} />
                <span className={cn("text-[9px] font-bold", (item.variant === 'primary' || item.active) && "text-white")}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Modals - Outside main container to avoid positioning issues */}
      <AnimatePresence>
        {showLeaderboard && (
          <Leaderboard currentUserId={currentUser?.id} onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfile && currentUser && (
          <Profile 
            user={currentUser} 
            onClose={() => setShowProfile(false)} 
            onLogout={onLogout || (() => {})}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <Settings
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
            onLogout={onLogout || (() => {})}
            userName={currentUser?.name}
            userId={currentUser?.id}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

      {showSocial && (
        currentUser ? (
          <Social 
            currentUserId={currentUser.id}
            currentUsername={currentUser.name}
            roomId={roomId}
            onClose={() => setShowSocial(false)}
          />
        ) : (
          <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
            <div className="text-center p-8">
              <UsersRound className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-700 mb-2">Giriş Yapın</h3>
              <p className="text-zinc-500 mb-4">Sosyal özellikler için giriş yapmanız gerekiyor</p>
              <button
                onClick={() => setShowSocial(false)}
                className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold"
              >
                Tamam
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
}
