import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe, Smartphone, HelpCircle, LogOut, User, Users, Trophy, Gamepad2,
  Sparkles, Crown, Swords, Volume2, VolumeX, DoorOpen, Check, X, Bell,
  CircleDollarSign, Zap, Flame, Target, Star, Play, TrendingUp,
  Shield, Award, Clock, UsersRound, Settings as SettingsIcon
} from 'lucide-react';
import type { GameMode } from '../types';
import { HowToPlay } from './HowToPlay';
import { AvatarImage, getAvatarIdFromEmoji } from './AvatarImage';
import { supabaseService } from '../lib/supabase';
import { cn } from '../lib/utils';

interface MenuProps {
  onSelectMode: (mode: GameMode) => void;
  user?: { id: string; name: string; avatar?: string } | null;
  onLogout?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  pendingRoomInvites?: Array<{id: string; room_id: string; from_username: string}>;
  onAcceptRoomInvite?: (inviteId: string, roomId: string) => Promise<void>;
  onRejectRoomInvite?: (inviteId: string) => Promise<void>;
}

interface UserStats {
  gamesPlayed: number;
  wins: number;
  gamesPlayedAsImpostor: number;
  impostorWins: number;
  avatar: string;
  coins: number;
}

export function Menu({
  onSelectMode, user, onLogout, soundEnabled = true, onToggleSound,
  pendingRoomInvites = [], onAcceptRoomInvite, onRejectRoomInvite
}: MenuProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [quickJoinCode, setQuickJoinCode] = useState('');
  const [stats, setStats] = useState<UserStats>({
    gamesPlayed: 0, wins: 0, gamesPlayedAsImpostor: 0, impostorWins: 0,
    avatar: '👤', coins: 0
  });
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      const fetchUserStats = async () => {
        const userData = await supabaseService.getUser(user.id);
        if (userData) {
          setStats({
            gamesPlayed: userData.games_played || 0,
            wins: userData.wins || 0,
            gamesPlayedAsImpostor: 0,
            impostorWins: 0,
            avatar: userData.avatar || '👤',
            coins: userData.coins || 0,
          });
        }
      };
      fetchUserStats();
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchOnlineCount = async () => {
      const { data: rooms } = await (await import('../lib/supabase')).supabase
        .from('rooms')
        .select('*')
        .eq('status', 'waiting');
      if (rooms) {
        setOnlineCount(rooms.length * 3);
      } else {
        setOnlineCount(0);
      }
    };
    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickJoin = () => {
    if (quickJoinCode.trim().length === 6) {
      onSelectMode('online_setup');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('joinRoomWithCode', { detail: quickJoinCode.trim().toUpperCase() }));
      }, 100);
    }
  };

  const winRate = stats.gamesPlayed > 0
    ? Math.round((stats.wins / stats.gamesPlayed) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col min-h-[100dvh] bg-gradient-to-br from-white via-zinc-50 to-white relative overflow-hidden"
    >
      {/* ─── Modern Arka Plan ──────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sol üst */}
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-8 text-8xl opacity-[0.04]"
        >🎭</motion.div>

        {/* Sağ üst */}
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 25, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-20 right-8 text-7xl opacity-[0.04]"
        >🔍</motion.div>

        {/* Orta sol */}
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 left-4 text-9xl opacity-[0.03]"
        >🤔</motion.div>

        {/* Orta sağ */}
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-1/2 right-6 text-8xl opacity-[0.04]"
        >🕵️</motion.div>

        {/* Alt sol */}
        <motion.div
          animate={{ x: [0, 25, 0], y: [0, -25, 0], rotate: [0, 12, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-48 left-6 text-7xl opacity-[0.04]"
        >😈</motion.div>

        {/* Alt sağ */}
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute bottom-44 right-8 text-8xl opacity-[0.04]"
        >👺</motion.div>

        {/* Merkez */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 text-[12rem] opacity-[0.02]"
        >🎭</motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* ─── Header ─────────────────────────────────────────────────────────────────── */}
      <div className="p-4 pt-safe relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-red-500/30">
                <span className="text-2xl">🎭</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-yellow-600" />
              </div>
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight leading-none bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent">
                SAHTEKAR
              </h1>
              <p className="text-xs text-zinc-500 font-medium">Kim?</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggleSound}
                className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600 hover:bg-zinc-200 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600 hover:bg-red-100 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Premium Kullanıcı Kartı ──────────────────────────────────────────────────────── */}
      {user && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="mx-4 mb-4 relative"
        >
          {/* Glow efekti */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-3xl opacity-15 blur-xl" />
          
          <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl p-5 text-white overflow-hidden">
            {/* Dekoratif elementler */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/10 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-full blur-3xl" />

            <div className="relative z-10 flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl">
                  <AvatarImage avatarId={getAvatarIdFromEmoji(stats.avatar)} size={64} />
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-zinc-900 rounded-full animate-pulse" />
              </div>

              {/* İsim ve İstatistikler */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-black text-lg truncate">{user.name}</h3>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-[10px] font-bold rounded-full text-zinc-900">
                    Çaylak
                  </span>
                </div>
                
                {/* Hızlı metrikler */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full">
                    <Gamepad2 className="w-3.5 h-3.5 text-zinc-300" />
                    <span className="text-xs font-bold">{stats.gamesPlayed}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-500/20 px-2 py-1 rounded-full">
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-xs font-bold text-yellow-300">{stats.wins}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-500/20 px-2 py-1 rounded-full">
                    <CircleDollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">{stats.coins}</span>
                  </div>
                </div>
              </div>

              {/* Kazanma oranı büyük */}
              <div className="text-right">
                <p className="text-3xl font-black text-red-400 leading-none">{winRate}%</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wide">Kazanma</p>
              </div>
            </div>

            {/* Alt bar */}
            <div className="relative z-10 mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>Seviye 1</span>
                <div className="flex-1 mx-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" />
                </div>
                <span>33/100 XP</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Online Banner ──────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="mx-4 mb-4 px-4 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl flex items-center justify-between border border-green-200"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-green-700">{onlineCount}+ oyuncu çevrimiçi</span>
        </div>
        <UsersRound className="w-4 h-4 text-green-600" />
      </motion.div>

      {/* ─── Oda Davetleri ──────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {pendingRoomInvites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-red-500 animate-bounce" />
              <span className="text-xs font-black text-red-500 uppercase tracking-wide">Oda Davetleri</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold">{pendingRoomInvites.length}</span>
            </div>
            <div className="space-y-2">
              {pendingRoomInvites.map(invite => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {invite.from_username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-sm text-zinc-900">{invite.from_username}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <DoorOpen className="w-3 h-3 text-green-600" />
                          <p className="text-xs text-green-700 font-bold">Odaya davet etti</p>
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Oda: {invite.room_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAcceptRoomInvite?.(invite.id, invite.room_id)}
                        className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-green-500/30 hover:bg-green-600"
                      >
                        <Check className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onRejectRoomInvite?.(invite.id)}
                        className="w-10 h-10 bg-red-100 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-200"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Ana İçerik ─────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="space-y-3"
        >
          {/* ── Hızlı Katıl ──────────────────────────────────────────────────────────────── */}
          <div className="p-4 bg-white rounded-2xl border-2 border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-zinc-500" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Hızlı Katıl</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickJoinCode}
                onChange={(e) => setQuickJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="Oda kodu..."
                className="flex-1 px-4 py-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center tracking-widest text-sm outline-none focus:border-red-400 focus:bg-white transition-all"
                maxLength={6}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleQuickJoin}
                disabled={quickJoinCode.length !== 6}
                className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700 transition-all"
              >
                <Play className="w-4 h-4" />
                Katıl
              </motion.button>
            </div>
          </div>

          {/* ── Oyun Modları ──────────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectMode('online_setup')}
              className="relative group overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-orange-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 flex flex-col items-center justify-center gap-2 text-white">
                <Globe className="w-6 h-6" />
                <span className="font-black text-base">Online Oyna</span>
                <span className="text-[10px] text-white/80">Dünya çapında oyna</span>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectMode('offline_setup')}
              className="relative group overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200" />
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 flex flex-col items-center justify-center gap-2 text-zinc-900">
                <Smartphone className="w-6 h-6" />
                <span className="font-black text-base">Aynı Cihaz</span>
                <span className="text-[10px] text-zinc-500">Arkadaşlarla</span>
              </div>
            </motion.button>
          </div>

          {/* ── İstatistik Kartları ──────────────────────────────────────────────────────────────── */}
          {user && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Trophy className="w-4 h-4" />, label: 'Galibiyet', value: stats.wins,        bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200' },
                { icon: <Target className="w-4 h-4" />, label: 'Oran',     value: `${winRate}%`,   bg: 'from-green-50 to-emerald-50', border: 'border-green-200' },
                { icon: <Flame className="w-4 h-4" />,  label: 'Mağlubiyet', value: stats.gamesPlayed - stats.wins, bg: 'from-red-50 to-orange-50', border: 'border-red-200' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-gradient-to-br ${s.bg} rounded-2xl p-3 text-center border ${s.border} shadow-sm`}
                >
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <p className="text-xl font-black text-zinc-900">{s.value}</p>
                  <p className="text-[10px] text-zinc-500 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Nasıl Oynanır ──────────────────────────────────────────────────────────────── */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHowToPlay(true)}
            className="w-full py-3 bg-zinc-50 rounded-xl font-bold text-zinc-600 flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Nasıl Oynanır?
          </motion.button>
        </motion.div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 py-3 text-center"
      >
        <p className="text-[10px] text-zinc-400">v1.0.0 • Sahtekar Kim? • Tunahan Yılmaztürk</p>
      </motion.div>

      <AnimatePresence>
        {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
