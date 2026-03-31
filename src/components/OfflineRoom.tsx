import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, MessageCircle, Vote, Sparkles, Crown, Zap, X, LogOut } from 'lucide-react';
import type { Player, Message } from '../types';
import type { useOfflineGame } from '../hooks/useOfflineGame';
import { RoleDisplayCard, PassDeviceScreen, GameOverScreen } from './RoleReveal';
import { Voting } from './Voting';
type OfflineGameReturn = ReturnType<typeof useOfflineGame>;

interface OfflineRoomProps {
  offlineGame: OfflineGameReturn;
  playSound?: (type: string) => void;
  soundEnabled?: boolean;
  onExit: () => void;
}

export function OfflineRoom({ offlineGame, playSound, soundEnabled = true, onExit }: OfflineRoomProps) {
  const {
    gameState,
    setGameState,
    chatEndRef,
    sendMessage,
    startVoting,
    submitVote,
    impostorGuess,
    nextRound,
  } = offlineGame;

  const [chatInput, setChatInput] = useState('');
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const [impostorGuessInput, setImpostorGuessInput] = useState('');
  const [showPassDevice, setShowPassDevice] = useState(false);
  const [showRoleDisplay, setShowRoleDisplay] = useState(false);

  if (!gameState) return null;

  const { phase, players, currentTurnIndex, round, word, category, messages, votes, winner, currentPlayerIndex } = gameState;

  useEffect(() => {
    if (phase === 'role_distribution' && !showPassDevice && !showRoleDisplay) {
      setShowPassDevice(true);
    }
  }, [phase, showPassDevice, showRoleDisplay]);

  const currentPlayer = players[currentTurnIndex];
  const currentRevealPlayer = players[currentPlayerIndex];
  const me = players[0];
  const isMyTurn = true;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    if (soundEnabled && playSound) playSound('messageSend');
    setChatInput('');
  };

  const handleVote = (votedPlayerId: string) => {
    submitVote(votedPlayerId);
    if (soundEnabled && playSound) playSound('vote');
  };

  const handleImpostorGuess = () => {
    impostorGuess(impostorGuessInput);
    setImpostorGuessInput('');
    setIsGuessModalOpen(false);
  };

  const handleConfirmPassDevice = () => {
    setShowPassDevice(false);
    setShowRoleDisplay(true);
  };

  const handleNextReveal = () => {
    setShowRoleDisplay(false);

    if (currentPlayerIndex >= players.length - 1) {
      setGameState(prev => {
        if (!prev) return prev;
        return { ...prev, phase: 'playing', currentPlayerIndex: 0, currentTurnIndex: 0 };
      });
    } else {
      setGameState(prev => {
        if (!prev) return prev;
        return { ...prev, currentPlayerIndex: prev.currentPlayerIndex + 1 };
      });
      setShowPassDevice(true);
    }
  };

  if (phase === 'setup') {
    return (
      <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 items-center justify-center p-6">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30"
          >
            <span className="text-5xl">🎮</span>
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-zinc-900">Oyun Hazır!</h2>
            <p className="text-zinc-500 mt-2">{players.length} oyuncu hazır</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={offlineGame.startGame}
            className="py-5 px-10 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/30"
          >
            Oyunu Başlat
          </motion.button>
        </div>
      </div>
    );
  }

  if (showPassDevice && phase === 'role_distribution') {
    return (
      <PassDeviceScreen
        currentPlayer={currentRevealPlayer}
        onConfirm={handleConfirmPassDevice}
      />
    );
  }

  if (showRoleDisplay && phase === 'role_distribution') {
    return (
      <RoleDisplayCard
        role={currentRevealPlayer.role!}
        word={currentRevealPlayer.word}
        hint={currentRevealPlayer.hint}
        onClose={handleNextReveal}
        isLastPlayer={currentPlayerIndex >= players.length - 1}
      />
    );
  }

  if (phase === 'voting') {
    const voter = players[currentPlayerIndex];
    return (
      <Voting
        players={players}
        myId={voter?.id}
        votes={votes}
        onVote={handleVote}
      />
    );
  }

  if (phase === 'finished') {
    return (
      <GameOverScreen
        winner={winner}
        lastWord={word}
        players={players}
        round={round}
        onNextRound={nextRound}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-zinc-50 to-zinc-100 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-5"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
          >
            {['💬', '🎭', '🎯', '🏆', '⭐', '🔥'][i]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <header className="relative bg-white/90 backdrop-blur-sm border-b border-zinc-200/50 px-4 py-3 flex items-center justify-between shrink-0 pt-safe">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600" />
          </motion.button>
          <div>
            <h1 className="font-black text-lg leading-none bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              SAHTEKAR KİM?
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-500">Tur {round}</span>
              <span className="text-xs text-zinc-300">•</span>
              <span className="text-xs font-semibold text-zinc-700">{category}</span>
            </div>
          </div>
        </div>
        <div className="flex -space-x-2">
          {players.map((p: Player, i: number) => (
            <motion.div
              key={p.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 shadow-sm ${
                currentPlayer?.id === p.id
                  ? 'border-red-400 bg-red-50 ring-2 ring-red-200'
                  : 'border-zinc-200 bg-white'
              }`}
            >
              {p.avatar}
            </motion.div>
          ))}
        </div>
      </header>

      {/* Current Turn Indicator */}
      <div className={`relative px-4 py-4 text-center shrink-0 ${
        currentPlayer?.id === players[0]?.id
          ? 'bg-gradient-to-r from-red-500 to-orange-500'
          : 'bg-white border-b border-zinc-200'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPlayer?.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-center gap-3"
          >
            {currentPlayer?.id === players[0]?.id ? (
              <>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
                <span className="font-black text-white text-sm uppercase tracking-wider">
                  SIRA SENDE! İpucu kelimeni yaz
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl">{currentPlayer?.avatar}</span>
                <span className="font-bold text-zinc-700 text-sm">
                  Sıra: <span className="text-zinc-900">{currentPlayer?.name}</span>
                </span>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Role Card */}
      <div className={`relative px-4 py-4 flex justify-between items-center shrink-0 ${
        me.role === 'impostor'
          ? 'bg-gradient-to-r from-red-500 to-pink-500'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            me.role === 'impostor' ? 'bg-white/20' : 'bg-white/20'
          }`}>
            {me.role === 'impostor' ? (
              <Crown className="w-6 h-6 text-white" />
            ) : (
              <Users className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Rolün</span>
            <p className="font-black text-white text-lg">
              {me.role === 'impostor' ? 'Sahtekar' : 'Vatandaş'}
            </p>
          </div>
        </div>
        {me.role === 'impostor' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsGuessModalOpen(true)}
            className="bg-white text-red-500 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Tahmin Et
          </motion.button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-zinc-50 to-zinc-100">
        {messages.map((msg: Message, idx: number) => {
          if (msg.isSystem) {
            return (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <div className="bg-zinc-200/70 text-zinc-600 px-4 py-2 rounded-full text-xs font-bold">
                  {msg.text}
                </div>
              </motion.div>
            );
          }
          return (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex flex-col items-end"
            >
              <span className="text-[11px] font-bold text-zinc-400 mr-2 mb-1">{msg.playerName}</span>
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                {msg.text}
              </div>
            </motion.div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="relative p-4 bg-white/80 backdrop-blur-sm border-t border-zinc-200/50 shrink-0 pb-safe">
        <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={isMyTurn ? "İpucu kelimeni yaz..." : "Sıranı bekle..."}
            disabled={!isMyTurn}
            className="flex-1 px-5 py-4 rounded-2xl bg-zinc-100 border-2 border-transparent focus:bg-white focus:border-purple-400 font-medium outline-none disabled:opacity-50 transition-all text-[16px]"
          />
          <motion.button
            type="submit"
            disabled={!chatInput.trim() || !isMyTurn}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              chatInput.trim() && isMyTurn
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-purple-500/30'
                : 'bg-zinc-200 text-zinc-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>

      {/* Start Voting Button */}
      <div className="relative p-4 bg-white border-t border-zinc-100">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={startVoting}
          className="w-full py-4 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2"
        >
          <Vote className="w-5 h-5" />
          Oylamayı Başlat
        </motion.button>
      </div>

      {/* Impostor Guess Modal */}
      <AnimatePresence>
        {isGuessModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-black text-xl">Kelimeyi Tahmin Et</h3>
                <p className="text-sm text-zinc-500 mt-1">Doğru bilirsen kazanırsın!</p>
              </div>
              <input
                type="text"
                value={impostorGuessInput}
                onChange={(e) => setImpostorGuessInput(e.target.value)}
                placeholder="Tahminin..."
                className="w-full px-5 py-4 rounded-2xl bg-zinc-100 border-2 border-transparent focus:border-red-400 outline-none mb-4 font-bold text-lg"
                autoFocus
              />
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleImpostorGuess}
                  disabled={!impostorGuessInput.trim()}
                  className="flex-1 py-3.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold disabled:opacity-50 shadow-lg shadow-red-500/30"
                >
                  Tahmin Et
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsGuessModalOpen(false)}
                  className="px-6 py-3.5 bg-zinc-100 text-zinc-600 rounded-2xl font-bold"
                >
                  İptal
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
