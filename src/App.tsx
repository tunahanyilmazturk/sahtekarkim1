import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Copy, Check, Volume2, VolumeX, Loader2, Bell } from 'lucide-react';
import { useGame } from './hooks';
import { useOfflineGame } from './hooks/useOfflineGame';
import { useSound } from './hooks/useSound';
import { useToast } from './components/Toast';
import { cn } from './lib/utils';
import { supabaseService } from './lib/supabase';
const Auth = lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));

const Menu = lazy(() => import('./components/Menu').then(m => ({ default: m.Menu })));
const OnlineSetup = lazy(() => import('./components/OnlineSetup').then(m => ({ default: m.OnlineSetup })));
const OfflineSetup = lazy(() => import('./components/OfflineSetup').then(m => ({ default: m.OfflineSetup })));
const OfflineRoom = lazy(() => import('./components/OfflineRoom').then(m => ({ default: m.OfflineRoom })));
const WaitingRoom = lazy(() => import('./components/WaitingRoom').then(m => ({ default: m.WaitingRoom })));
const BottomNav = lazy(() => import('./components/BottomNav').then(m => ({ default: m.BottomNav })));
const Chat = lazy(() => import('./components/Chat').then(m => ({ default: m.Chat })));
const PlayerDrawer = lazy(() => import('./components/PlayerDrawer').then(m => ({ default: m.PlayerDrawer })));
const Voting = lazy(() => import('./components/Voting').then(m => ({ default: m.Voting })));
const GameOver = lazy(() => import('./components/GameOver').then(m => ({ default: m.GameOver })));
const RoleCard = lazy(() => import('./components/RoleCard').then(m => ({ default: m.RoleCard })));
const ImpostorGuessModal = lazy(() => import('./components/ImpostorGuessModal').then(m => ({ default: m.ImpostorGuessModal })));
const RoleWordModal = lazy(() => import('./components/RoleWordModal').then(m => ({ default: m.RoleWordModal })));

function Loading() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-red-500" />
    </div>
  );
}

export default function App() {
  const [isPlayersDrawerOpen, setIsPlayersDrawerOpen] = useState(false);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const [impostorGuess, setImpostorGuess] = useState('');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [offlineGameStarted, setOfflineGameStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'chat'>('chat');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [showRoleWordModal, setShowRoleWordModal] = useState(false);

  const { playSound, enabled: soundEnabled, toggleSound } = useSound();
  const offlineGame = useOfflineGame();
  const prevRoomStatusRef = useRef<string | undefined>(undefined);
  const { showToast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('sahtekar_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setPlayerName(user.name);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('sahtekar_user');
      }
    }
  }, []);

  const prevFriendRequestIdsRef = useRef<Set<string>>(new Set());
  const prevRoomInviteIdsRef = useRef<Set<string>>(new Set());
 const [pendingRoomInvites, setPendingRoomInvites] = useState<Array<{id: string; room_id: string; from_username: string}>>([]);

 // Subscribe to friend requests for notifications
 useEffect(() => {
   if (!currentUser?.id) return;

   const unsub = supabaseService.subscribeToFriendRequests(currentUser.id, (requests) => {
     const pendingRequests = requests.filter(req =>
       req.to_user_id === currentUser.id && req.status === 'pending'
     );

     // Find new requests that weren't there before
     const newRequests = pendingRequests.filter(req =>
       !prevFriendRequestIdsRef.current.has(req.id)
     );

     if (newRequests.length > 0) {
       newRequests.forEach(req => {
         showToast(`🔔 ${req.from_username} sana arkadaşlık isteği gönderdi!`, 'info');
       });
       playSound('messageSend');
     }

     // Update seen request IDs
     const newSet = new Set(pendingRequests.map(r => r.id));
     prevFriendRequestIdsRef.current = newSet;
   });

   return () => unsub();
 }, [currentUser?.id, showToast, playSound]);

 // Subscribe to room invites
 useEffect(() => {
   if (!currentUser?.id) return;

   const unsub = supabaseService.subscribeToRoomInvites(currentUser.id, (invites) => {
     const pendingInvites = invites.filter(inv =>
       inv.status === 'pending'
     );

     // Find new invites that weren't there before
     const newInvites = pendingInvites.filter(inv =>
       !prevRoomInviteIdsRef.current.has(inv.id)
     );

     if (newInvites.length > 0) {
       newInvites.forEach(inv => {
         showToast(`🎮 ${inv.from_username} seni odaya davet etti! (Oda: ${inv.room_id})`, 'info');
       });
       playSound('messageSend');
     }

     setPendingRoomInvites(pendingInvites);
     const newSet = new Set(pendingInvites.map(i => i.id));
     prevRoomInviteIdsRef.current = newSet;
   });

   return () => unsub();
 }, [currentUser?.id, showToast, playSound]);

 const handleAcceptRoomInvite = async (inviteId: string, inviteRoomId: string) => {
   await supabaseService.acceptRoomInvite(inviteId);
   setRoomId(inviteRoomId);
   setMode('online_setup');
   showToast(`Odaya katılın! Oda kodu: ${inviteRoomId}`, 'info');
   setPendingRoomInvites(prev => prev.filter(inv => inv.id !== inviteId));
 };

 const handleRejectRoomInvite = async (inviteId: string) => {
   await supabaseService.rejectRoomInvite(inviteId);
   setPendingRoomInvites(prev => prev.filter(inv => inv.id !== inviteId));
 };

 const handleLogin = async (userId: string, username: string) => {
    // Supabase'den kullanıcı verisini al (avatar dahil)
    const userData = await supabaseService.getUser(userId);
    const user = { id: userId, name: username, avatar: userData?.avatar || '👤' };
    setCurrentUser(user);
    setPlayerName(username);
    setIsAuthenticated(true);
    localStorage.setItem('sahtekar_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.removeItem('sahtekar_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMode('menu');
    setOfflineGameStarted(false);
  };

  const {
    mode,
    setMode,
    playerName,
    setPlayerName,
    roomId,
    setRoomId,
    room,
    playerId,
    error,
    setError,
    showRoleCard,
    setShowRoleCard,
    isLoading,
    me,
    activePlayer,
    isMyTurn,
    canChat,
    getChatPlaceholder,
    handleCreateRoom,
    handleJoinRoom,
    handleStartGame,
    handleSendMessage,
    handleStartVoting,
    handleVote,
    handleImpostorGuess,
    handleReturnToLobby,
    kickPlayer,
    setReady,
    addBot,
    removeBot,
  } = useGame();

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(room?.id || '');
    setCopied(true);
    playSound('buttonClick');
    setTimeout(() => setCopied(false), 2000);
  };

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
      // 3 saniye sonra otomatik kapat
      const timer = setTimeout(() => {
        setShowRoleCard(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showRoleCard, playSound]);

  const handleSendMessageWithSound = (text: string) => {
    handleSendMessage(text);
    playSound('messageSend');
  };

  const renderRoom = () => {
    if (!room || !me) return null;

    const placeholder = getChatPlaceholder();

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

        {/* Sıra bilgisi - Oyun başladığında göster */}
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

        {/* Kategori ve rol bilgisi - Oyun başladığında göster */}
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

        {/* Waiting: Her zaman WaitingRoom göster */}
        {room.status === 'waiting' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <Suspense fallback={<Loading />}>
              <WaitingRoom
                roomId={room.id}
                players={room.players}
                myId={playerId || ''}
                isHost={me.isHost}
                canStart={room.players.length >= 3}
                onStartGame={handleStartGame}
                copied={copied}
                onCopy={copyRoomId}
                onKickPlayer={(playerId) => kickPlayer(playerId)}
                onAddBot={() => addBot()}
                onRemoveBot={(botId) => removeBot(botId)}
                onSetReady={(isReady) => setReady(isReady)}
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

        {/* Playing/Finished: Chat ekranı - Her zaman görünsün */}
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
            onStartGame={handleStartGame}
            onStartVoting={handleStartVoting}
            onReturnToLobby={handleReturnToLobby}
          />
        </Suspense>

        <Suspense fallback={null}>
          <ImpostorGuessModal
            isOpen={isGuessModalOpen}
            onClose={() => setIsGuessModalOpen(false)}
            guess={impostorGuess}
            onGuessChange={setImpostorGuess}
            onSubmit={() => handleImpostorGuess(impostorGuess)}
          />
        </Suspense>

        {room.status === 'voting' && (
          <Suspense fallback={null}>
            <Voting
              players={room.players}
              myId={playerId || ''}
              votes={room.votes}
              onVote={handleVote}
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
                onNextRound={handleStartGame}
                onReturnToLobby={handleReturnToLobby}
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
              onStartVoting={handleStartVoting}
              isHost={me.isHost}
              roomId={room.id}
              onExit={() => {
                handleReturnToLobby();
                setMode('menu');
              }}
            />
        </Suspense>
      </div>
    );
  };

  const handleExitToMenu = () => {
    if (room) {
      handleReturnToLobby();
    }
    setMode('menu');
  };

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<Loading />}>
        <Auth onLogin={handleLogin} onBack={() => setMode('menu')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white font-sans text-zinc-900 selection:bg-red-200">
      <Suspense fallback={<Loading />}>
        {mode === 'menu' && (
          <>
            <Menu
              onSelectMode={setMode}
              user={currentUser}
              onLogout={handleLogout}
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              pendingRoomInvites={pendingRoomInvites}
              onAcceptRoomInvite={handleAcceptRoomInvite}
              onRejectRoomInvite={handleRejectRoomInvite}
            />
            <BottomNav
              mode="menu"
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              onShowHowToPlay={() => {}}
              onShowSettings={() => showToast('Yakında!', 'info')}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </>
        )}
      </Suspense>
      <Suspense fallback={<Loading />}>
        {mode === 'online_setup' && (
          <>
            <OnlineSetup
              playerName={playerName}
              onPlayerNameChange={setPlayerName}
              roomId={roomId}
              onRoomIdChange={setRoomId}
              error={error}
              isLoading={isLoading}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onBack={() => setMode('menu')}
            />
            <BottomNav 
              mode="online_setup"
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              onExit={() => setMode('menu')}
            />
          </>
        )}
      </Suspense>
      <Suspense fallback={<Loading />}>
        {mode === 'offline_setup' && !offlineGameStarted && (
          <>
            <OfflineSetup 
              onBack={() => setMode('menu')} 
              onStartGame={(playerNames) => {
                offlineGame.createGame(playerNames);
                setOfflineGameStarted(true);
              }} 
            />
            <BottomNav 
              mode="offline_setup"
              soundEnabled={soundEnabled}
              onToggleSound={toggleSound}
              onExit={() => setMode('menu')}
            />
          </>
        )}
      </Suspense>
      <Suspense fallback={<Loading />}>
        {mode === 'offline_setup' && offlineGameStarted && (
          <OfflineRoom 
            offlineGame={offlineGame}
            playSound={playSound as (type: string) => void}
            soundEnabled={soundEnabled}
            onExit={() => { 
              offlineGame.returnToLobby();
              setOfflineGameStarted(false); 
              setMode('menu'); 
            }} 
          />
        )}
      </Suspense>
      {mode === 'room' && renderRoom()}
    </div>
  );
}
