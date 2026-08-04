import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Room, Player, GameMode } from '../types';

const WaitingRoom = lazy(() => import('./WaitingRoom').then(m => ({ default: m.WaitingRoom })));
const BottomNav = lazy(() => import('./BottomNav').then(m => ({ default: m.BottomNav })));
const Chat = lazy(() => import('./Chat').then(m => ({ default: m.Chat })));
const PlayerDrawer = lazy(() => import('./PlayerDrawer').then(m => ({ default: m.PlayerDrawer })));
const Voting = lazy(() => import('./Voting').then(m => ({ default: m.Voting })));
const GameOver = lazy(() => import('./GameOver').then(m => ({ default: m.GameOver })));
const RoleCard = lazy(() => import('./RoleCard').then(m => ({ default: m.RoleCard })));
const ImpostorGuessModal = lazy(() => import('./ImpostorGuessModal').then(m => ({ default: m.ImpostorGuessModal })));
const RoleWordModal = lazy(() => import('./RoleWordModal').then(m => ({ default: m.RoleWordModal })));

function Loading() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-red-500" />
    </div>
  );
}

interface GameRoomProps {
  room: Room;
  playerId: string;
  me: Player;
  activePlayer: Player | undefined;
  isMyTurn: boolean;
  error: string;
  showRoleCard: boolean;
  setShowRoleCard: (v: boolean) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: string) => void;
  currentUser?: { id: string; name: string; avatar?: string } | null;
  onSendMessage: (text: string) => void;
  onStartGame: () => void;
  onStartVoting: () => void;
  onVote: (playerId: string) => void;
  onImpostorGuess: (guess: string) => void;
  onReturnToLobby: () => void;
  onKickPlayer: (playerId: string) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onSetReady: (isReady: boolean) => void;
  onExitToMenu: () => void;
}

export function GameRoom({
  room,
  playerId,
  me,
  activePlayer,
  isMyTurn,
  error,
  showRoleCard,
  setShowRoleCard,
  soundEnabled,
  toggleSound,
  playSound,
  currentUser,
  onSendMessage,
  onStartGame,
  onStartVoting,
  onVote,
  onImpostorGuess,
  onReturnToLobby,
  onKickPlayer,
  onAddBot,
  onRemoveBot,
  onSetReady,
  onExitToMenu,
}: GameRoomProps) {
  const [isPlayersDrawerOpen, setIsPlayersDrawerOpen] = useState(false);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const [impostorGuess, setImpostorGuess] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'chat'>('chat');
  const [showRoleWordModal, setShowRoleWordModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevRoomStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!room) return;
    const prevStatus = prevRoomStatusRef.current;
    if (room.status === 'playing' && prevStatus !== 'playing') {
      playSound('gameStart');
    }
    if (room.status === 'voting' && prevStatus === 'playing') {
      playSound('vote');
    }
    if (room.status === 'finished' && prevStatus === 'voting') {
      if (room.winner === 'impostor') {
        playSound('impostorWin');
      } else {
        playSound('citizenWin');
      }
    }
    prevRoomStatusRef.current = room.status;
  }, [room?.status, room?.winner, playSound]);

  useEffect(() => {
    if (showRoleCard) {
      playSound('roleReveal');
      const timer = setTimeout(() => {
        setShowRoleCard(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showRoleCard, playSound]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(room?.id || '');
    setCopied(true);
    playSound('buttonClick');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessageWithSound = (text: string) => {
    onSendMessage(text);
    playSound('messageSend');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-b from-zinc-50 to-zinc-100 overflow-hidden relative">
      <header className="bg-white/80 backdrop-blur-sm border-b border-zinc-200/50 px-4 py-3 pt-safe flex items-center justify-between shrink-0 z-10">
        <div className="flex flex-col">
          <h1 className="font-black text-lg tracking-tight leading-none">SAHTEKAR <span className="text-gradient">KİM?</span></h1>
          <div className="flex items-center gap-1 mt-1 text-xs font-bold text-zinc-500">
            <span>ODA:</span>
            <span className="text-zinc-900 font-mono">{room.id}</span>
            <button onClick={copyRoomId} className="p-1 -m-1 active:scale-90 transition-transform hover:bg-zinc-100 rounded-full">
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSound}
            className="p-2.5 bg-zinc-100 rounded-full active:scale-95 transition-transform"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-zinc-700" /> : <VolumeX className="w-5 h-5 text-zinc-400" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPlayersDrawerOpen(true)}
            className="relative p-2.5 bg-zinc-100 rounded-full active:scale-95 transition-transform"
          >
            <Users className="w-5 h-5 text-zinc-700" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm"
            >
              {room.players.length}
            </motion.span>
          </motion.button>
        </div>
      </header>

      {room.status === 'playing' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "px-4 py-3 flex items-center justify-center gap-2 border-b shrink-0 shadow-sm transition-colors",
            isMyTurn ? "bg-gradient-to-r from-red-50 to-red-100/50 border-red-200 text-red-600" : "bg-white/50 border-zinc-200 text-zinc-600"
          )}
        >
          {isMyTurn ? (
            <span className="font-black text-sm tracking-wide uppercase animate-pulse">SIRA SENDE! İpucu kelimeni yaz.</span>
          ) : (
            <span className="font-bold text-sm">Sıra <span className="text-zinc-900 bg-white px-3 py-1 rounded-lg shadow-sm ml-1">{activePlayer?.avatar} {activePlayer?.name}</span></span>
          )}
        </motion.div>
      )}

      {room.status === 'playing' && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowRoleWordModal(true)}
          className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white px-4 py-3 flex justify-between items-center shrink-0 shadow-lg z-10 w-full"
        >
          <div className="flex flex-col">
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Kategori <span className="text-zinc-500">| Tur {room.round}</span></span>
            <span className="font-bold text-base">{room.category}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Rolün</span>
              <span className={cn("font-bold text-sm", me.role === 'impostor' ? "text-red-400" : "text-blue-400")}>
                {me.role === 'impostor' ? 'Sahtekar' : 'Vatandaş'}
              </span>
            </div>
            {me.role === 'impostor' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); setIsGuessModalOpen(true); }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs active:scale-95 transition-transform shadow-lg shadow-red-500/25"
              >
                Tahmin
              </motion.button>
            )}
          </div>
        </motion.button>
      )}

      {room.status === 'waiting' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <Suspense fallback={<Loading />}>
            <WaitingRoom
              roomId={room.id}
              players={room.players}
              myId={playerId || ''}
              isHost={me.isHost}
              canStart={room.players.length >= 3}
              onStartGame={onStartGame}
              copied={copied}
              onCopy={copyRoomId}
              onKickPlayer={onKickPlayer}
              onAddBot={onAddBot}
              onRemoveBot={onRemoveBot}
              onSetReady={onSetReady}
              chatMessages={room.chat}
              chatPlayerId={playerId || ''}
              chatInputRef={chatEndRef}
              onSendMessage={handleSendMessageWithSound}
              currentUserId={currentUser?.id}
              currentUsername={currentUser?.name}
            />
          </Suspense>
        </div>
      )}

      {(room.status === 'playing' || room.status === 'finished') && (
        <div className="flex-1 flex flex-col min-h-0 pb-20">
          <Suspense fallback={<Loading />}>
            <Chat
              messages={room.chat}
              playerId={playerId || ''}
              inputRef={chatEndRef}
              canChat={room.status === 'finished' || (room.status === 'playing' && isMyTurn)}
              placeholder={room.status === 'playing' ? (isMyTurn ? "İpucu kelimeni yaz..." : "Sıranı bekle...") : "Oyun bitti, sohbet edebilirsin..."}
              onSendMessage={handleSendMessageWithSound}
            />
          </Suspense>
        </div>
      )}

      <Suspense fallback={<Loading />}>
        <PlayerDrawer
          isOpen={isPlayersDrawerOpen}
          onClose={() => setIsPlayersDrawerOpen(false)}
          players={room.players}
          myId={playerId || ''}
          status={room.status}
          currentTurnIndex={room.currentTurnIndex}
          votes={room.votes}
          isHost={me.isHost}
          round={room.round}
          error={error}
          onStartGame={onStartGame}
          onStartVoting={onStartVoting}
          onReturnToLobby={onReturnToLobby}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ImpostorGuessModal
          isOpen={isGuessModalOpen}
          onClose={() => setIsGuessModalOpen(false)}
          guess={impostorGuess}
          onGuessChange={setImpostorGuess}
          onSubmit={() => onImpostorGuess(impostorGuess)}
        />
      </Suspense>

      {room.status === 'voting' && (
        <Suspense fallback={null}>
          <Voting
            players={room.players}
            myId={playerId || ''}
            votes={room.votes}
            onVote={onVote}
          />
        </Suspense>
      )}

      <AnimatePresence>
        {room.status === 'finished' && (
          <Suspense fallback={null}>
            <GameOver
              winner={room.winner}
              lastWord={room.lastWord}
              players={room.players}
              round={room.round}
              isHost={me.isHost}
              onNextRound={onStartGame}
              onReturnToLobby={onReturnToLobby}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRoleCard && me.role && (
          <Suspense fallback={null}>
            <RoleCard
              role={me.role}
              word={me.word}
              hint={me.hint}
              onClose={() => setShowRoleCard(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRoleWordModal && me.role && (
          <Suspense fallback={null}>
            <RoleWordModal
              role={me.role}
              word={me.word}
              hint={me.hint}
              onClose={() => setShowRoleWordModal(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <BottomNav
          mode={room.status === 'waiting' ? 'waiting' : room.status === 'playing' ? 'playing' : room.status === 'voting' ? 'voting' : 'finished'}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onShowPlayers={() => setIsPlayersDrawerOpen(true)}
          onShowChat={() => setActiveTab(activeTab === 'chat' ? 'game' : 'chat')}
          activeTab={activeTab}
          onStartVoting={onStartVoting}
          isHost={me.isHost}
          roomId={room.id}
          onExit={onExitToMenu}
        />
      </Suspense>
    </div>
  );
}
