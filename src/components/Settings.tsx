import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2, VolumeX, LogOut, HelpCircle, X, Share2, Star,
  Heart, Code, Camera, ChevronRight, ChevronLeft, Bell, BellOff,
  Gamepad2, Trophy, CircleDollarSign, Edit3, Check, Shield,
  Info, ExternalLink, Sliders, Sparkles, Zap, Moon, Settings as SettingsIcon,
  User, Palette, BellRing, Vibrate, GitBranch, Package, Tag, Plus, Wrench, Brush
} from 'lucide-react';
import { HowToPlay } from './HowToPlay';
import { AvatarImage, getAvatarIdFromEmoji } from './AvatarImage';
import { supabaseService } from '../lib/supabase';

interface SettingsProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout: () => void;
  userName?: string;
  userId?: string;
  onClose: () => void;
}

type Section = 'main' | 'account' | 'audio' | 'notifications' | 'about' | 'changelog';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: { type: 'new' | 'improved' | 'fixed'; text: string }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.4.0',
    date: '30 Mar 2025',
    type: 'major',
    changes: [
      { type: 'improved', text: 'Settings sayfası tam ekran modern tasarıma geçirildi' },
      { type: 'improved', text: 'Değişiklik günlüğü (Changelog) eklendi' },
      { type: 'improved', text: 'Tüm bölümlere gradient ikon kutuları eklendi' },
    ]
  },
  {
    version: '1.3.0',
    date: '30 Mar 2025',
    type: 'major',
    changes: [
      { type: 'improved', text: 'Profil sayfası tam ekran modern tasarıma güncellendi' },
      { type: 'new', text: 'Profil sayfasına animasyonlu arka plan eklendi' },
      { type: 'improved', text: 'XP progress bar\'a glow efekti eklendi' },
      { type: 'improved', text: 'Arkadaş listesinde AvatarImage kullanılmaya başlandı' },
      { type: 'improved', text: 'Aksiyon butonları sticky alt çubuğa taşındı' },
    ]
  },
  {
    version: '1.2.0',
    date: '30 Mar 2025',
    type: 'major',
    changes: [
      { type: 'improved', text: 'Liderlik tablosu podium sistemiyle yeniden tasarlandı' },
      { type: 'new', text: '4 kategori eklendi: Galibiyet, Başarı %, Oyun, Coin' },
      { type: 'new', text: 'Animasyonlu podium ile ilk 3 oyuncu özel gösterim kazandı' },
      { type: 'new', text: 'Kullanıcı kendi sırasını altta görebiliyor' },
      { type: 'improved', text: 'Tam ekran tasarım ve animasyonlu arka plan eklendi' },
    ]
  },
  {
    version: '1.1.0',
    date: '30 Mar 2025',
    type: 'major',
    changes: [
      { type: 'improved', text: 'Sosyal sayfa modern UI ile yeniden tasarlandı' },
      { type: 'new', text: 'Sosyal sayfaya kullanıcı istatistik kartı eklendi' },
      { type: 'improved', text: 'Arkadaş listesi Çevrimiçi/Çevrimdışı olarak ayrıldı' },
      { type: 'improved', text: 'Tüm kullanıcı kartlarına AvatarImage eklendi' },
      { type: 'improved', text: 'Arama sayfasına hızlı istatistik kartları eklendi' },
      { type: 'improved', text: 'Tab geçişlerine animasyonlu aktif gösterge eklendi' },
    ]
  },
  {
    version: '1.0.2',
    date: '30 Mar 2025',
    type: 'minor',
    changes: [
      { type: 'improved', text: 'Ana menü premium kullanıcı kartı ve istatistiklerle güncellendi' },
      { type: 'new', text: 'Çevrimiçi oyuncu sayısı banner\'ı eklendi' },
      { type: 'improved', text: 'Hızlı oda katılımı input\'u eklendi' },
      { type: 'improved', text: 'Gradient arkaplan ve animasyonlu emoji elementler eklendi' },
    ]
  },
  {
    version: '1.0.1',
    date: '29 Mar 2025',
    type: 'minor',
    changes: [
      { type: 'new', text: '44 avatar ile Avatar Mağazası sistemi eklendi' },
      { type: 'new', text: '5 avatar kategorisi: Ücretsiz, Yaygın, Nadir, Epik, Efsane' },
      { type: 'new', text: 'SVG tabanlı AvatarImage bileşeni oluşturuldu' },
      { type: 'new', text: 'Supabase\'e avatar, owned_avatars, coins kolonları eklendi' },
      { type: 'fixed', text: 'Lucide Coins ikonu CircleDollarSign ile değiştirildi' },
    ]
  },
  {
    version: '1.0.0',
    date: '28 Mar 2025',
    type: 'major',
    changes: [
      { type: 'new', text: 'Sahtekar Kim? oyunu yayına alındı' },
      { type: 'new', text: 'Çevrimiçi ve çevrimdışı oyun modları' },
      { type: 'new', text: 'Gerçek zamanlı arkadaş sistemi' },
      { type: 'new', text: 'Sohbet, oylama ve oyun sonu ekranları' },
      { type: 'new', text: 'Kullanıcı profili ve istatistikleri' },
    ]
  }
];

interface UserData {
  avatar: string;
  coins: number;
  gamesPlayed: number;
  wins: number;
}

export function Settings({ soundEnabled, onToggleSound, onLogout, userName, userId, onClose }: SettingsProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [section, setSection] = useState<Section>('main');
  const [notifications, setNotifications] = useState(true);
  const [vibration, setVibration]   = useState(true);
  const [darkMode, setDarkMode]     = useState(false);
  const [autoReady, setAutoReady]   = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [editingName, setEditingName]   = useState(false);
  const [newName, setNewName]           = useState(userName || '');
  const [nameSaved, setNameSaved]       = useState(false);
  const [userData, setUserData]         = useState<UserData>({ avatar: '👤', coins: 0, gamesPlayed: 0, wins: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('settings_notifications');
    if (saved !== null) setNotifications(JSON.parse(saved));
    const savedVib = localStorage.getItem('settings_vibration');
    if (savedVib !== null) setVibration(JSON.parse(savedVib));
    const savedDark = localStorage.getItem('settings_darkMode');
    if (savedDark !== null) setDarkMode(JSON.parse(savedDark));
    const savedAuto = localStorage.getItem('settings_autoReady');
    if (savedAuto !== null) setAutoReady(JSON.parse(savedAuto));
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabaseService.getUser(userId).then(u => {
      if (u) {
        setUserData({
          avatar: u.avatar || '👤',
          coins: u.coins || 0,
          gamesPlayed: u.games_played || 0,
          wins: u.wins || 0,
        });
      }
    });
  }, [userId]);

  const toggle = (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(!val);
    localStorage.setItem(`settings_${key}`, JSON.stringify(!val));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const handleSaveName = () => {
    if (!newName.trim() || newName.trim() === userName) { setEditingName(false); return; }
    setNameSaved(true);
    setEditingName(false);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const winRate = userData.gamesPlayed > 0
    ? Math.round((userData.wins / userData.gamesPlayed) * 100)
    : 0;

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <motion.button
      onClick={onChange}
      className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${
        value ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-zinc-300'
      }`}
    >
      <motion.div
        animate={{ x: value ? 28 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-5 h-5 rounded-full shadow-md ${
          value ? 'bg-white' : 'bg-white'
        }`}
      />
    </motion.button>
  );

  const SectionHeader = ({ title, onBack }: { title: string; onBack?: () => void }) => (
    <div className="relative p-4 border-b border-zinc-200/50 flex items-center gap-3 bg-white/80 backdrop-blur-sm">
      {onBack && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-600" />
        </motion.button>
      )}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-zinc-500 to-zinc-600 rounded-xl flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900">{title}</h2>
          <p className="text-xs text-zinc-500 font-medium">Ayarlar</p>
        </div>
      </div>
      <div className="flex-1" />
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition-colors"
      >
        <X className="w-5 h-5 text-zinc-600" />
      </motion.button>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100 z-[100] overflow-hidden"
        onClick={onClose}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-5xl opacity-5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 15, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {['⚙️', '🔧', '🎛️', '🔔', '🔊', '🎨', '✨', '🌟', '💫', '⚡'][i]}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex flex-col h-full bg-white"
          onClick={e => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">

            {/* MAIN SECTION */}
            {section === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col flex-1 min-h-0"
              >
                <SectionHeader title="Ayarlar" />

                <div className="flex-1 overflow-y-auto pb-6">
                  {/* Premium User Card */}
                  {userName && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mx-4 mt-4 relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl opacity-20 blur-2xl" />
                      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl p-5 text-white overflow-hidden shadow-2xl">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-500/10 rounded-full" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/10 rounded-full" />
                        
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="w-20 h-20 rounded-3xl overflow-hidden border-3 border-white/20 shadow-xl">
                            <AvatarImage avatarId={getAvatarIdFromEmoji(userData.avatar)} size={80} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-black text-xl truncate">{userName}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-3 py-1 bg-white/10 text-xs font-bold rounded-full">Çaylak</span>
                              <span className="text-xs text-zinc-400">67 XP</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-3xl font-black text-red-400 leading-none">{winRate}%</p>
                            <p className="text-[10px] text-zinc-500 uppercase mt-1 font-bold">Oran</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Settings */}
                  <div className="mx-4 mt-4 grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={onToggleSound}
                      className={`p-4 rounded-2xl flex items-center gap-3 transition-all ${
                        soundEnabled ? 'bg-green-50 border-2 border-green-200' : 'bg-zinc-50 border-2 border-zinc-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        soundEnabled ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg' : 'bg-zinc-200 text-zinc-400'
                      }`}>
                        {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-zinc-500 font-medium">Ses</p>
                        <p className="text-sm font-bold text-zinc-900">{soundEnabled ? 'Açık' : 'Kapalı'}</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggle('notifications', notifications, setNotifications)}
                      className={`p-4 rounded-2xl flex items-center gap-3 transition-all ${
                        notifications ? 'bg-blue-50 border-2 border-blue-200' : 'bg-zinc-50 border-2 border-zinc-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        notifications ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg' : 'bg-zinc-200 text-zinc-400'
                      }`}>
                        {notifications ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-zinc-500 font-medium">Bildirim</p>
                        <p className="text-sm font-bold text-zinc-900">{notifications ? 'Açık' : 'Kapalı'}</p>
                      </div>
                    </motion.button>
                  </div>

                  {/* Settings Groups */}
                  <div className="px-4 mt-6 space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase px-2 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" /> Hesap
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSection('account')}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-zinc-900">Hesap Ayarları</p>
                        <p className="text-xs text-zinc-500 mt-0.5">İsim ve profil bilgileri</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </motion.button>
                  </div>

                  <div className="px-4 mt-4 space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase px-2 mb-3 flex items-center gap-2">
                      <Sliders className="w-4 h-4" /> Tercihler
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSection('audio')}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-zinc-900">Ses Ayarları</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{soundEnabled ? 'Ses açık' : 'Ses kapalı'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSection('notifications')}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-zinc-900">Bildirimler</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{notifications ? 'Açık' : 'Kapalı'}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </motion.button>
                  </div>

                  <div className="px-4 mt-4 space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase px-2 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Diğer
                    </p>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowHowToPlay(true)}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-zinc-900">Nasıl Oynanır?</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Kuralları öğren</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-zinc-400" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSection('about')}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-zinc-500 to-zinc-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-zinc-900">Hakkında</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Uygulama bilgileri</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.open('https://play.google.com/store', '_blank')}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Star className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-zinc-900">Değerlendir</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Geri bildirim</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-zinc-400" />
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleShare}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                        shareSuccess ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                      }`}>
                        {shareSuccess ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-zinc-900">{shareSuccess ? 'Kopyalandı!' : 'Paylaş'}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Arkadaşlara öner</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSection('changelog')}
                      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <GitBranch className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-zinc-900">Değişiklik Günlüğü</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Güncellemeler ve yenilikler</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                          v{CHANGELOG[0].version}
                        </span>
                        <ChevronRight className="w-5 h-5 text-zinc-400" />
                      </div>
                    </motion.button>
                  </div>

                  <div className="px-4 mt-4 mb-4">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={onLogout}
                      className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Hesaptan Çık
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ACCOUNT SECTION */}
            {section === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <SectionHeader title="Hesap Ayarları" onBack={() => setSection('main')} />
                <div className="overflow-y-auto p-4 space-y-4">

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                    <p className="text-xs font-bold text-purple-600 mb-3 flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> Kullanıcı Adı
                    </p>
                    {editingName ? (
                      <div className="flex gap-2">
                        <input 
                          value={newName} 
                          onChange={e => setNewName(e.target.value)} 
                          className="flex-1 border-2 border-purple-200 focus:border-purple-500 rounded-xl px-4 py-3 text-sm font-bold outline-none bg-white" 
                          maxLength={15} 
                          autoFocus 
                        />
                        <button 
                          onClick={handleSaveName} 
                          className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-lg">
                            {userName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-lg text-zinc-900">{nameSaved ? newName : userName}</span>
                            {nameSaved && <Check className="w-4 h-4 text-green-500 ml-2 inline" />}
                          </div>
                        </div>
                        <button 
                          onClick={() => setEditingName(true)} 
                          className="p-2 text-zinc-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Oyun', value: userData.gamesPlayed, icon: Gamepad2, color: 'from-purple-500 to-pink-500' },
                      { label: 'Galibiyet', value: userData.wins, icon: Trophy, color: 'from-yellow-500 to-amber-500' },
                    ].map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-zinc-50 rounded-2xl p-4 text-center"
                        >
                          <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className="text-2xl font-black text-zinc-900">{s.value}</p>
                          <p className="text-xs text-zinc-500 font-medium mt-1">{s.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onLogout}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-red-500/30"
                  >
                    <LogOut className="w-5 h-5" />
                    Hesaptan Çık
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* AUDIO SECTION */}
            {section === 'audio' && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <SectionHeader title="Ses Ayarları" onBack={() => setSection('main')} />
                <div className="overflow-y-auto p-4 space-y-3">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                          soundEnabled ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-zinc-200'
                        }`}>
                          {soundEnabled ? <Volume2 className="w-7 h-7 text-white" /> : <VolumeX className="w-7 h-7 text-zinc-400" />}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-zinc-900">Oyun Sesleri</p>
                          <p className="text-sm text-zinc-500">Tüm ses efektleri</p>
                        </div>
                      </div>
                      <Toggle value={soundEnabled} onChange={onToggleSound} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* NOTIFICATIONS SECTION */}
            {section === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <SectionHeader title="Bildirimler" onBack={() => setSection('main')} />
                <div className="overflow-y-auto p-4 space-y-3">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                          notifications ? 'bg-gradient-to-br from-blue-400 to-cyan-500' : 'bg-zinc-200'
                        }`}>
                          {notifications ? <Bell className="w-7 h-7 text-white" /> : <BellOff className="w-7 h-7 text-zinc-400" />}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-zinc-900">Arkadaş İstekleri</p>
                          <p className="text-sm text-zinc-500">Bildirimler</p>
                        </div>
                      </div>
                      <Toggle value={notifications} onChange={() => toggle('notifications', notifications, setNotifications)} />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                          autoReady ? 'bg-gradient-to-br from-orange-400 to-amber-500' : 'bg-zinc-200'
                        }`}>
                          <Zap className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-zinc-900">Otomatik Hazır</p>
                          <p className="text-sm text-zinc-500">Oyun tercihler</p>
                        </div>
                      </div>
                      <Toggle value={autoReady} onChange={() => toggle('autoReady', autoReady, setAutoReady)} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ABOUT SECTION */}
            {section === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <SectionHeader title="Hakkında" onBack={() => setSection('main')} />
                <div className="overflow-y-auto p-4 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-3xl p-6 text-center shadow-2xl"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                      className="text-6xl mb-3"
                    >
                      🎭
                    </motion.div>
                    <p className="font-black text-2xl text-white">Sahtekar Kim?</p>
                    <p className="text-sm text-white/90 mt-2">Kelime Tahmin & Blöf Oyunu</p>
                    <span className="inline-block mt-3 px-4 py-1.5 bg-white/20 text-white text-sm font-bold rounded-full backdrop-blur-sm">
                      v1.0.0
                    </span>
                  </motion.div>

                  <div className="bg-zinc-50 rounded-2xl p-5 text-center">
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Arkadaşlarınızla eğlenceli bir kelime tahmin ve blöf oyunu. Kimin sahtekar olduğunu bulmaya çalışın!
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                    <p className="text-xs font-bold text-purple-600 uppercase mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4" /> Geliştirici
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                        T
                      </div>
                      <div>
                        <p className="font-bold text-lg text-zinc-900">Tunahan Yılmaztürk</p>
                        <p className="text-sm text-zinc-500">Full Stack Developer</p>
                      </div>
                    </div>
                    <motion.a
                      href="https://instagram.com/tunahanyilmazturk"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileTap={{ scale: 0.97 }}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Camera className="w-5 h-5" />
                      @tunahanyilmazturk
                    </motion.a>
                  </div>

                  <p className="text-xs text-center text-zinc-400 flex items-center justify-center gap-1 py-2">
                    <Heart className="w-4 h-4 text-red-400" /> ile yapıldı
                  </p>
                </div>
              </motion.div>
            )}

            {/* CHANGELOG SECTION */}
            {section === 'changelog' && (
              <motion.div
                key="changelog"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <SectionHeader title="Değişiklik Günlüğü" onBack={() => setSection('main')} />
                <div className="overflow-y-auto p-4 space-y-4">
                  {CHANGELOG.map((entry, index) => {
                    const getTypeColor = (type: string) => {
                      switch (type) {
                        case 'major': return 'from-red-500 to-orange-500';
                        case 'minor': return 'from-blue-500 to-cyan-500';
                        case 'patch': return 'from-green-500 to-emerald-500';
                        default: return 'from-zinc-500 to-zinc-600';
                      }
                    };

                    const getChangeIcon = (type: string) => {
                      switch (type) {
                        case 'new': return <Plus className="w-4 h-4" />;
                        case 'improved': return <Brush className="w-4 h-4" />;
                        case 'fixed': return <Wrench className="w-4 h-4" />;
                        default: return <Package className="w-4 h-4" />;
                      }
                    };

                    const getChangeColor = (type: string) => {
                      switch (type) {
                        case 'new': return 'text-green-600 bg-green-50';
                        case 'improved': return 'text-blue-600 bg-blue-50';
                        case 'fixed': return 'text-orange-600 bg-orange-50';
                        default: return 'text-zinc-600 bg-zinc-50';
                      }
                    };

                    const getChangeLabel = (type: string) => {
                      switch (type) {
                        case 'new': return 'Yeni';
                        case 'improved': return 'İyileştirme';
                        case 'fixed': return 'Düzeltme';
                        default: return 'Diğer';
                      }
                    };

                    return (
                      <motion.div
                        key={entry.version}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-zinc-50 rounded-2xl overflow-hidden"
                      >
                        {/* Version Header */}
                        <div className={`bg-gradient-to-r ${getTypeColor(entry.type)} px-4 py-3 flex items-center justify-between`}>
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-white" />
                            <div>
                              <p className="font-black text-white text-lg">v{entry.version}</p>
                              <p className="text-xs text-white/80">{entry.date}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            entry.type === 'major' ? 'bg-white/20 text-white' :
                            entry.type === 'minor' ? 'bg-white/20 text-white' :
                            'bg-white/20 text-white'
                          }`}>
                            {entry.type === 'major' ? 'Büyük Güncelleme' : entry.type === 'minor' ? 'Küçük Güncelleme' : 'Yama'}
                          </span>
                        </div>

                        {/* Changes List */}
                        <div className="p-4 space-y-2">
                          {entry.changes.map((change, changeIndex) => (
                            <motion.div
                              key={changeIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 + changeIndex * 0.02 }}
                              className="flex items-start gap-3 p-3 bg-white rounded-xl"
                            >
                              <div className={`p-2 rounded-lg ${getChangeColor(change.type)} flex-shrink-0`}>
                                {getChangeIcon(change.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getChangeColor(change.type)}`}>
                                    {getChangeLabel(change.type)}
                                  </span>
                                </div>
                                <p className="text-sm text-zinc-700">{change.text}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Footer */}
                  <div className="text-center py-4">
                    <p className="text-xs text-zinc-400 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Daha fazla yenilik için takipte kalın!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </motion.div>

      {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
    </>
  );
}
