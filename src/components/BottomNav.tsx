import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Users, Volume2, VolumeX, Vote,
  Settings as SettingsIcon, Share2, User, Trophy, UsersRound,
  LogOut, Crown, Sparkles, Bell, Gamepad2, ChevronRight, DoorOpen
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
  notificationCount?: number;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
  show?: boolean;
  active?: boolean;
  badge?: number;
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
  notificationCount = 0,
}: BottomNavProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getNavItems = (): NavItem[] => {
    switch (mode) {
      case 'menu':
        return [
          { icon: Trophy, label: 'Liderlik', onClick: () => setShowLeaderboard(true) },
          { icon: UsersRound, label: 'Sosyal', onClick: () => setShowSocial(true), badge: notificationCount },
          { icon: User, label: 'Profil', onClick: () => setShowProfile(true) },
          { icon: SettingsIcon, label: 'Ayarlar', onClick: () => setShowSettings(true) },
        ];

      case 'online_setup':
      case 'offline_setup':
        return [
          { icon: Home, label: 'Menü', onClick: onExit || (() => {}) },
          { icon: soundEnabled ? Volume2 : VolumeX, label: 'Ses', onClick: onToggleSound },
        ];

      case 'waiting':
        return [
          { icon: Users, label: 'Oyuncular', onClick: onShowPlayers || (() => {}), show: !!onShowPlayers },
          { icon: soundEnabled ? Volume2 : VolumeX, label: 'Ses', onClick: onToggleSound },
          { icon: Share2, label: 'Paylaş', onClick: onShare || (() => {}), show: !!onShare },
          { icon: DoorOpen, label: 'Çıkış', onClick: onExit || (() => {}), variant: 'danger' },
        ];

      case 'playing':
        return [
          {
            icon: Vote,
            label: 'Oylama',
            onClick: onStartVoting || (() => {}),
            variant: isHost ? 'primary' : 'default',
            show: isHost
          },
          { icon: DoorOpen, label: 'Çıkış', onClick: onExit || (() => {}), variant: 'danger' },
        ];

      case 'voting':
        return [
          { icon: soundEnabled ? Volume2 : VolumeX, label: 'Ses', onClick: onToggleSound },
          { icon: DoorOpen, label: 'Çıkış', onClick: onExit || (() => {}), variant: 'danger' },
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

  useEffect(() => {
    setActiveIndex(0);
  }, [mode]);

  return (
    <>
      {/* Floating Bottom Navigation Bar */}
      <motion.div
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe"
      >
        <div className="mx-auto max-w-md">
          <div
            ref={containerRef}
            className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-zinc-200/60 px-1.5 py-1.5 mb-2"
          >
            {/* Sliding indicator */}
            <motion.div
              ref={indicatorRef}
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10"
              initial={false}
              animate={{
                left: `calc(${activeIndex} * (100% / ${items.length}) + 6px)`,
                width: `calc((100% - 12px) / ${items.length})`,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />

            <div className="relative flex items-center justify-around">
              {items.map((item, idx) => {
                const Icon = item.icon;
                const isActive = activeIndex === idx;
                const isPrimary = item.variant === 'primary';
                const isDanger = item.variant === 'danger';

                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, type: 'spring', stiffness: 300 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => {
                      setActiveIndex(idx);
                      item.onClick();
                    }}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl min-w-[48px] transition-colors duration-200",
                      isPrimary && "bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30",
                      isDanger && !isActive && "text-red-400",
                      isDanger && isActive && "text-red-600",
                      !isPrimary && !isDanger && isActive && "text-red-600",
                      !isPrimary && !isDanger && !isActive && "text-zinc-500",
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn(
                        "w-[22px] h-[22px] transition-transform duration-200",
                        isActive && !isPrimary && "scale-110",
                        isPrimary && "w-5 h-5",
                      )} />
                      {/* Notification badge */}
                      {item.badge && item.badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-white"
                        >
                          {item.badge > 9 ? '9+' : item.badge}
                        </motion.span>
                      )}
                      {/* Active dot indicator */}
                      {isActive && !isPrimary && (
                        <motion.span
                          layoutId="active-dot"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500"
                        />
                      )}
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold tracking-tight transition-colors",
                      isPrimary && "text-white",
                      !isPrimary && isActive && "text-red-600",
                      !isPrimary && !isActive && "text-zinc-400",
                    )}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] flex items-center justify-center"
          >
            <div className="text-center p-8 max-w-xs">
              <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <UsersRound className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-lg font-black text-zinc-800 mb-2">Giriş Yapın</h3>
              <p className="text-zinc-500 mb-6 text-sm">Sosyal özellikler için giriş yapmanız gerekiyor</p>
              <button
                onClick={() => setShowSocial(false)}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/25 active:scale-95 transition-transform"
              >
                Tamam
              </button>
            </div>
          </motion.div>
        )
      )}
    </>
  );
}
