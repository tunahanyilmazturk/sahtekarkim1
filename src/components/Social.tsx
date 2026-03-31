import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, UserMinus, X, Check, Search, Send, Bell, Gamepad2, Swords, Crown, LogIn, Clock, DoorOpen, Trophy, Target, TrendingUp, CircleDollarSign } from 'lucide-react';
import { supabaseService } from '../lib/supabase';
import { AvatarImage } from './AvatarImage';
import type { User, FriendRequest } from '../lib/supabase';

interface SocialProps {
  currentUserId: string;
  currentUsername: string;
  roomId?: string;
  currentRoomId?: string;
  onJoinRoom?: (roomId: string) => void;
  onClose: () => void;
}

export function Social({ currentUserId, currentUsername, roomId, currentRoomId, onJoinRoom, onClose }: SocialProps) {
  const [friends, setFriends] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<Record<string, { from: string; fromUsername: string; status: string }>>({});
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [searchUsername, setSearchUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'top'>('friends');
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Update online status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      supabaseService.updateUserOnlineStatus(currentUserId, true);
    }, 30000);

    supabaseService.updateUserOnlineStatus(currentUserId, true);

    return () => clearInterval(interval);
  }, [currentUserId]);

  // Subscribe to users
  useEffect(() => {
    const unsub = supabaseService.subscribeToUsers((users) => {
      const usersMap: Record<string, User> = {};
      users.forEach(user => {
        usersMap[user.id] = user;
      });
      setAllUsers(usersMap);
      
      if (usersMap[currentUserId]) {
        setFriends(usersMap[currentUserId].friends || []);
        setCurrentUser(usersMap[currentUserId]);
      }
    });

    return () => unsub();
  }, [currentUserId]);

  // Subscribe to friend requests
  useEffect(() => {
    const unsub = supabaseService.subscribeToFriendRequests(currentUserId, (requests) => {
      const myRequests: Record<string, { from: string; fromUsername: string; status: string }> = {};
      const mySent: string[] = [];
      
      requests.forEach(req => {
        if (req.to_user_id === currentUserId && req.status === 'pending') {
          myRequests[req.id] = { from: req.from_user_id, fromUsername: req.from_username, status: req.status };
        }
        if (req.from_user_id === currentUserId && req.status === 'pending') {
          mySent.push(req.to_user_id);
        }
      });
      
      setFriendRequests(myRequests);
      setSentRequests(mySent);
    });

    return () => unsub();
  }, [currentUserId]);

  const sendFriendRequest = async (targetUserId: string) => {
    await supabaseService.sendFriendRequest(currentUserId, currentUsername, targetUserId);
  };

  const acceptRequest = async (requestId: string, fromUserId: string) => {
    const userFriends = allUsers[currentUserId]?.friends || [];
    const newFriends = [...userFriends, fromUserId];
    await supabaseService.updateUserFriends(currentUserId, newFriends);

    const otherFriends = allUsers[fromUserId]?.friends || [];
    await supabaseService.updateUserFriends(fromUserId, [...otherFriends, currentUserId]);

    await supabaseService.updateFriendRequestStatus(requestId, 'accepted');
  };

  const rejectRequest = async (requestId: string) => {
    await supabaseService.updateFriendRequestStatus(requestId, 'rejected');
  };

  const cancelRequest = async (targetUserId: string) => {
    await supabaseService.cancelFriendRequest(currentUserId, targetUserId);
  };

  const removeFriend = async (friendId: string) => {
    const newFriends = friends.filter(f => f !== friendId);
    await supabaseService.updateUserFriends(currentUserId, newFriends);
    await supabaseService.updateUserFriends(friendId, (allUsers[friendId]?.friends || []).filter((f: string) => f !== currentUserId));
  };

  const sendRoomInvite = async (friendId: string) => {
    if (!currentRoomId) return;
    
    await supabaseService.sendRoomInvite(currentRoomId, currentUserId, currentUsername, friendId);
    setSentInvites(prev => new Set(prev).add(friendId));
  };

  const copyInviteLink = async (friendId: string) => {
    const link = `${window.location.origin}?invite=${currentUserId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(friendId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingRequests = Object.entries(friendRequests).filter(([, req]) => req.status === 'pending');

  const topPlayers = Object.entries(allUsers)
    .filter(([id]) => id !== currentUserId)
    .map(([id, user]) => ({
      id,
      username: user.username,
      gamesPlayed: user.games_played || 0,
      wins: user.wins || 0,
      coins: user.coins || 0
    }))
    .filter(p => p.gamesPlayed > 0)
    .sort((a, b) => b.wins - a.wins)
    .slice(0, 10);

  const availableUsers = Object.entries(allUsers)
    .filter(([id, user]) => {
      const isSelf = id === currentUserId;
      const isFriend = friends.includes(id);
      const hasUsername = user.username && user.username.trim() !== '';
      const matchesSearch = searchUsername === '' || user.username?.toLowerCase().includes(searchUsername.toLowerCase());
      
      return !isSelf && !isFriend && hasUsername && matchesSearch;
    })
    .slice(0, 10);

  const getFriendStatus = (friendId: string) => {
    const user = allUsers[friendId];
    if (user?.is_online) return { text: 'Çevrimiçi', color: 'bg-green-500' };
    if (user?.last_seen) {
      const diff = Date.now() - user.last_seen;
      if (diff < 300000) return { text: 'Az önce', color: 'bg-green-400' };
      if (diff < 3600000) return { text: `${Math.floor(diff/60000)} dk`, color: 'bg-zinc-400' };
      return { text: 'Çevrimdışı', color: 'bg-zinc-300' };
    }
    return { text: 'Çevrimdışı', color: 'bg-zinc-300' };
  };

  const onlineFriends = friends.filter(id => allUsers[id]?.is_online).length;
  const totalFriends = friends.length;

  const tabs = [
    { key: 'friends' as const, label: 'Arkadaşlar', icon: Users, count: friends.length },
    { key: 'requests' as const, label: 'Davetler', icon: Bell, count: pendingRequests.length, highlight: true },
    { key: 'top' as const, label: 'Liderlik', icon: Trophy },
    { key: 'search' as const, label: 'Keşfet', icon: Search }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 z-[100] overflow-hidden"
    >
      <div
        className="flex flex-col h-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {['👥', '🤝', '🏆', '⭐', '🎯', '🔥', '💎', '👑'][i]}
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <div className="relative p-4 border-b border-zinc-200/50 flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900">Sosyal</h2>
              <p className="text-xs text-zinc-500 font-medium">
                {onlineFriends}/{totalFriends} arkadaş çevrimiçi
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-zinc-600" />
          </motion.button>
        </div>

        {/* User Stats Card */}
        {currentUser && (
          <div className="relative px-4 py-3 bg-white/60 backdrop-blur-sm border-b border-zinc-200/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AvatarImage
                  avatarId={currentUser.avatar || 'avatar_default_1'}
                  size={48}
                  className="ring-2 ring-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900 truncate">{currentUser.username}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-xs text-zinc-600">
                    <Users className="w-3 h-3" />
                    <span className="font-semibold">{friends.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-600">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span className="font-semibold">{currentUser.wins || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-600">
                    <CircleDollarSign className="w-3 h-3 text-green-500" />
                    <span className="font-semibold">{currentUser.coins || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="relative flex border-b border-zinc-200/50 overflow-x-auto shrink-0 bg-white/60 backdrop-blur-sm">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 font-bold text-xs whitespace-nowrap px-2 flex items-center justify-center gap-1.5 relative ${
                activeTab === tab.key 
                  ? 'text-red-500' 
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? 'stroke-[2.5]' : ''}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    tab.highlight ? 'bg-red-500 text-white' : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {tab.count}
                </motion.span>
              )}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-4 pb-20">
          <AnimatePresence mode="wait">
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {friends.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h3 className="font-bold text-zinc-700 mb-1">Arkadaşın Yok</h3>
                    <p className="text-sm text-zinc-500 mb-4">Yeni arkadaşlar bulmaya başla</p>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('search')}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-red-500/30"
                    >
                      Keşfet
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {/* Online Friends Section */}
                    {friends.filter(id => allUsers[id]?.is_online).length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1">
                          Çevrimiçi
                        </p>
                        {friends.filter(id => allUsers[id]?.is_online).map(friendId => {
                          const friend = allUsers[friendId];
                          const status = getFriendStatus(friendId);
                          return (
                            <motion.div
                              key={friendId}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <AvatarImage
                                    avatarId={friend?.avatar || 'avatar_default_1'}
                                    size={40}
                                    className="ring-2 ring-green-500 ring-offset-2"
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-zinc-900">{friend?.username || 'Bilinmiyor'}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-green-600 font-medium">{status.text}</span>
                                    {friend?.wins !== undefined && friend.wins > 0 && (
                                      <span className="text-xs text-zinc-500">• {friend.wins} galibiyet</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {currentRoomId && (
                                  <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => sendRoomInvite(friendId)}
                                    disabled={sentInvites.has(friendId)}
                                    className={`p-2.5 rounded-xl ${
                                      sentInvites.has(friendId)
                                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                        : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                                    }`}
                                    title={sentInvites.has(friendId) ? 'Davet gönderildi' : 'Odaya davet et'}
                                  >
                                    {sentInvites.has(friendId) ? <Check className="w-4 h-4" /> : <DoorOpen className="w-4 h-4" />}
                                  </motion.button>
                                )}
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => removeFriend(friendId)}
                                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* Offline Friends Section */}
                    {friends.filter(id => !allUsers[id]?.is_online).length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1 mt-4">
                          Çevrimdışı
                        </p>
                        {friends.filter(id => !allUsers[id]?.is_online).map(friendId => {
                          const friend = allUsers[friendId];
                          const status = getFriendStatus(friendId);
                          return (
                            <motion.div
                              key={friendId}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-2xl border border-zinc-100/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <AvatarImage
                                    avatarId={friend?.avatar || 'avatar_default_1'}
                                    size={40}
                                    className="opacity-70"
                                  />
                                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${status.color} border-2 border-white rounded-full`} />
                                </div>
                                <div>
                                  <p className="font-bold text-zinc-700">{friend?.username || 'Bilinmiyor'}</p>
                                  <p className="text-xs text-zinc-500">{status.text}</p>
                                </div>
                              </div>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => removeFriend(friendId)}
                                className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <UserMinus className="w-4 h-4" />
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {pendingRequests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-zinc-700 mb-1">Davetin Yok</h3>
                    <p className="text-sm text-zinc-500">Bekleyen arkadaşlık isteği bulunmuyor</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map(([requestId, req], index) => (
                      <motion.div
                        key={requestId}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl border border-blue-100 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <AvatarImage
                            avatarId={allUsers[req.from]?.avatar || 'avatar_default_1'}
                            size={48}
                            className="ring-2 ring-white shadow-md"
                          />
                          <div>
                            <p className="font-bold text-zinc-900">{req.fromUsername}</p>
                            <p className="text-xs text-blue-600 font-medium">Arkadaşlık isteği gönderdi</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => acceptRequest(requestId, req.from)}
                            className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-shadow"
                          >
                            <Check className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => rejectRequest(requestId)}
                            className="p-3 bg-gradient-to-br from-red-500 to-pink-500 text-white rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-shadow"
                          >
                            <X className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Top Players Tab */}
            {activeTab === 'top' && (
              <motion.div
                key="top"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header Banner */}
                <div className="relative mb-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 opacity-90" />
                  <div className="relative p-4 text-center">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      className="inline-block mb-2"
                    >
                      <Crown className="w-8 h-8 text-yellow-900" />
                    </motion.div>
                    <h3 className="font-black text-yellow-900 text-lg">Liderlik Tablosu</h3>
                    <p className="text-xs text-yellow-800 font-medium">En iyi oyuncular</p>
                  </div>
                </div>

                {topPlayers.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-10 h-10 text-yellow-400" />
                    </div>
                    <h3 className="font-bold text-zinc-700 mb-1">Henüz Oyuncu Yok</h3>
                    <p className="text-sm text-zinc-500">İlk sıralamaya sen girmeye başla!</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {topPlayers.map((player, index) => {
                      const isFriend = friends.includes(player.id);
                      const isPending = sentRequests.includes(player.id);
                      const rankColors = [
                        'from-yellow-400 to-amber-500 text-yellow-900',
                        'from-zinc-300 to-zinc-400 text-zinc-700',
                        'from-amber-600 to-amber-700 text-white',
                      ];
                      const rankColor = rankColors[index] || 'from-zinc-200 to-zinc-300 text-zinc-600';
                      
                      return (
                        <motion.div
                          key={player.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`flex items-center justify-between p-3 rounded-2xl border ${
                            index < 3
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm'
                              : 'bg-white border-zinc-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm bg-gradient-to-br ${rankColor} shadow-sm`}>
                            #{index + 1}
                            </div>
                            <AvatarImage
                              avatarId={allUsers[player.id]?.avatar || 'avatar_default_1'}
                              size={40}
                            />
                            <div>
                              <p className="font-bold text-zinc-900">{player.username}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                  <Gamepad2 className="w-3 h-3" />
                                  <span className="font-medium">{player.gamesPlayed}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-red-500">
                                  <Swords className="w-3 h-3" />
                                  <span className="font-bold">{player.wins}</span>
                                </div>
                                {player.coins > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-green-500">
                                    <CircleDollarSign className="w-3 h-3" />
                                    <span className="font-medium">{player.coins}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {isFriend ? (
                            <span className="text-xs text-green-600 font-bold bg-green-100 px-3 py-1.5 rounded-xl">
                              Arkadaş
                            </span>
                          ) : isPending ? (
                            <span className="text-xs text-orange-500 font-bold bg-orange-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Bekliyor
                            </span>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => sendFriendRequest(player.id)}
                              className="p-2.5 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-xl shadow-lg shadow-red-500/30"
                            >
                              <UserPlus className="w-4 h-4" />
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Search Input */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    value={searchUsername}
                    onChange={e => setSearchUsername(e.target.value)}
                    placeholder="Kullanıcı ara..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-zinc-200 rounded-2xl font-bold outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-zinc-400"
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-blue-700">Toplam</span>
                    </div>
                    <p className="text-lg font-black text-blue-900">{Object.keys(allUsers).length - 1}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-3 border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-bold text-green-700">Bulunan</span>
                    </div>
                    <p className="text-lg font-black text-green-900">{availableUsers.length}</p>
                  </div>
                </div>

                {availableUsers.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h3 className="font-bold text-zinc-700 mb-1">
                      {searchUsername ? 'Sonuç Bulunamadı' : 'Kullanıcı Yok'}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {searchUsername ? 'Farklı bir arama terimi deneyin' : 'Henüz başka kayıtlı kullanıcı yok'}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {availableUsers.map(([id, user], index) => {
                      const isPending = sentRequests.includes(id);
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <AvatarImage
                              avatarId={user.avatar || 'avatar_default_1'}
                              size={40}
                            />
                            <div>
                              <p className="font-bold text-zinc-900">{user.username}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                  <Gamepad2 className="w-3 h-3" />
                                  <span className="font-medium">{user.games_played || 0} oyun</span>
                                </div>
                                {user.wins > 0 && (
                                  <div className="flex items-center gap-1 text-xs text-red-500">
                                    <Swords className="w-3 h-3" />
                                    <span className="font-bold">{user.wins}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {isPending ? (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => cancelRequest(id)}
                              className="px-4 py-2.5 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-orange-500/30"
                            >
                              <Clock className="w-4 h-4" />
                              İptal
                            </motion.button>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => sendFriendRequest(id)}
                              className="px-4 py-2.5 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-red-500/30"
                            >
                              <UserPlus className="w-4 h-4" />
                              Ekle
                            </motion.button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
