import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Share2, Users, Wifi, WifiOff, Crown, Sparkles, UserMinus, UserPlus, MessageCircle, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Player, Message } from '../types';
import { FriendList } from './FriendList';

interface WaitingRoomProps {
  roomId: string;
  players: Player[];
  myId: string;
  isHost: boolean;
  canStart: boolean;
  onStartGame: () => void;
  copied: boolean;
  onCopy: () => void;
  onKickPlayer?: (playerId: string) => void;
  onAddBot?: () => void;
  onRemoveBot?: (botId: string) => void;
  onSetReady?: (isReady: boolean) => void;
  chatMessages?: Message[];
  chatPlayerId?: string;
  chatInputRef?: React.RefObject<HTMLDivElement | null>;
  onSendMessage?: (text: string) => void;
  currentUserId?: string;
  currentUsername?: string;
}

export function WaitingRoom({
  roomId,
  players,
  myId,
  isHost,
  canStart,
  onStartGame,
  copied,
  onCopy,
  onKickPlayer,
  onAddBot,
  onRemoveBot,
  onSetReady,
  chatMessages = [],
  onSendMessage,
  currentUserId,
  currentUsername,
}: WaitingRoomProps) {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !onSendMessage) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };
  const handleShare = async () => {
    const shareData = {
      title: 'Sahtekar Kim? Oyunu',
      text: `Benimle Sahtekar Kim? oyunu oyna! Oda kodu: ${roomId}`,
      url: `${window.location.origin}?room=${roomId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        onCopy();
      }
    } else {
      onCopy();
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex-1 overflow-y-auto p-4 pb-20 space-y-4"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-[2rem] p-6 shadow-lg border border-zinc-100 space-y-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Oda Bekleniyor</span>
            <Sparkles className="w-5 h-5 text-red-500" />
          </div>
          
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-center mb-6"
          >
            <div className="text-5xl mb-3">🎭</div>
            <h2 className="text-2xl font-black text-zinc-900">SAHTEKAR <span className="text-red-500">KİM?</span></h2>
            <p className="text-zinc-500 font-medium mt-1">Arkadaşlarını davet et!</p>
          </motion.div>
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Oda Kodu</span>
              <div className="flex items-center gap-1 text-green-400">
                <Wifi className="w-3 h-3" />
                <span className="text-xs font-bold">Aktif</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.span 
                animate={{ 
                  textShadow: ["0 0 10px rgba(220,38,38,0.5)", "0 0 20px rgba(220,38,38,0.8)", "0 0 10px rgba(220,38,38,0.5)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-1 text-4xl font-black font-mono tracking-[0.3em] text-white"
              >
                {roomId}
              </motion.span>
            </div>

            <div className="flex gap-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCopy}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Kopyalandı!' : 'Kopyala'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Paylaş
              </motion.button>
            </div>
            <div className="mt-3">
              <FriendList
                currentUserId={currentUserId || myId}
                currentUsername={currentUsername || players.find(p => p.id === myId)?.name || ''}
                roomId={roomId}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Oyuncular ({players.length})
              </span>
              <span className="text-xs font-bold text-zinc-400">
                {canStart ? '✓ Hazır' : `${3 - players.length} kişi gerekli`}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <AnimatePresence>
                {players.map((player, idx) => (
                  <motion.div 
                    key={player.id}
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: idx * 0.1 + 0.5 }}
                    layout
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all",
                      player.id === myId 
                        ? "bg-red-50 border-2 border-red-200" 
                        : "bg-zinc-50 border-2 border-transparent"
                    )}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.6, type: "spring" }}
                      className="relative"
                    >
                      <span className="text-2xl">{player.avatar}</span>
                      <motion.span 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                      />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 truncate">{player.name}</span>
                        {player.id === myId && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Sen</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        {player.isHost ? (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Crown className="w-3 h-3" />
                            Host
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Wifi className="w-3 h-3" />
                            Online
                          </span>
                        )}
                        {player.isReady && !player.isHost && (
                          <span className="ml-2 text-green-500 font-bold">✓ Hazır</span>
                        )}
                      </div>
                    </div>

                    {idx === 0 && (
                      <motion.span
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xl"
                      >
                        👑
                      </motion.span>
                    )}

                    {isHost && !player.isHost && player.id !== myId && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onKickPlayer?.(player.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Oyundan at"
                      >
                        <UserMinus className="w-4 h-4" />
                      </motion.button>
                    )}

                    {isHost && player.isBot && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveBot?.(player.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="Botu kaldır"
                      >
                        <UserMinus className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isHost && players.length < 16 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddBot}
                className="w-full mt-3 py-3 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Bot Ekle
              </motion.button>
            )}
          </motion.div>

          {/* Lobi Sohbeti */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Lobi Sohbeti</span>
            </div>
            
            <div className="bg-zinc-50 rounded-xl border-2 border-zinc-200 overflow-hidden">
              {/* Mesajlar */}
              <div className="h-40 overflow-y-auto p-3 space-y-2">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-6 text-zinc-400 text-sm">
                    Lobi sohbeti için mesaj yok
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-2",
                        msg.playerId === myId ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.isSystem ? (
                        <div className="w-full text-center">
                          <span className="text-xs text-zinc-500 bg-zinc-200 px-2 py-1 rounded-full">
                            {msg.text}
                          </span>
                        </div>
                      ) : (
                        <>
                          {msg.playerId !== myId && (
                            <span className="text-lg">{msg.playerAvatar}</span>
                          )}
                          <div
                            className={cn(
                              "max-w-[70%] px-3 py-2 rounded-2xl text-sm",
                              msg.playerId === myId
                                ? "bg-red-500 text-white"
                                : "bg-white border border-zinc-200"
                            )}
                          >
                            {msg.playerId !== myId && (
                              <p className="text-xs font-bold text-zinc-600 mb-1">
                                {msg.playerName}
                              </p>
                            )}
                            <p className={msg.playerId === myId ? "text-white" : "text-zinc-800"}>
                              {msg.text}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Mesaj Yazma */}
              <form onSubmit={handleSendChat} className="p-2 border-t border-zinc-200 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Mesaj yaz..."
                  className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:border-red-500"
                  maxLength={200}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            {isHost ? (
              canStart ? (
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStartGame}
                  animate={{ 
                    boxShadow: ["0 0 0 0 rgba(220,38,38,0.4)", "0 0 0 10px rgba(220,38,38,0)"]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-full py-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-bold text-xl hover:from-red-600 hover:to-red-500 active:scale-95 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-3"
                >
                  <span className="text-2xl">🎮</span>
                  Oyunu Başlat
                </motion.button>
              ) : (
                <div className="w-full py-5 bg-zinc-100 text-zinc-500 rounded-2xl font-bold text-center flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  {`${3 - players.length} oyuncu daha gerekli...`}
                </div>
              )
            ) : (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSetReady?.(!players.find(p => p.id === myId)?.isReady)}
                className="w-full py-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-xl hover:from-green-600 hover:to-green-500 active:scale-95 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">✓</span>
                {players.find(p => p.id === myId)?.isReady ? 'Hazırım!' : 'Hazır Ol'}
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
