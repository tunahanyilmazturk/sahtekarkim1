import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useGame } from './hooks';
import { useOfflineGame } from './hooks/useOfflineGame';
import { useSound } from './hooks/useSound';
import { useToast } from './components/Toast';
import { supabaseService } from './lib/supabase';
import { GameRoom } from './components/GameRoom';
const Auth = lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));
const Menu = lazy(() => import('./components/Menu').then(m => ({ default: m.Menu })));
const OnlineSetup = lazy(() => import('./components/OnlineSetup').then(m => ({ default: m.OnlineSetup })));
const OfflineSetup = lazy(() => import('./components/OfflineSetup').then(m => ({ default: m.OfflineSetup })));
const OfflineRoom = lazy(() => import('./components/OfflineRoom').then(m => ({ default: m.OfflineRoom })));
const BottomNav = lazy(() => import('./components/BottomNav').then(m => ({ default: m.BottomNav })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));

function Loading() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-red-500" />
    </div>
  );
}

export default function App() {
  const [offlineGameStarted, setOfflineGameStarted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar?: string } | null>(null);

  const { playSound, enabled: soundEnabled, toggleSound } = useSound();
  const offlineGame = useOfflineGame();
  const { showToast } = useToast();
  const [showSettings, setShowSettings] = useState(false);

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
              onShowSettings={() => setShowSettings(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
              notificationCount={pendingRoomInvites.length}
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
      {mode === 'room' && room && me && (
        <GameRoom
          room={room}
          playerId={playerId || ''}
          me={me}
          activePlayer={activePlayer}
          isMyTurn={isMyTurn}
          error={error}
          showRoleCard={showRoleCard}
          setShowRoleCard={setShowRoleCard}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          playSound={playSound as (type: string) => void}
          currentUser={currentUser}
          onSendMessage={handleSendMessage}
          onStartGame={handleStartGame}
          onStartVoting={handleStartVoting}
          onVote={handleVote}
          onImpostorGuess={handleImpostorGuess}
          onReturnToLobby={handleReturnToLobby}
          onKickPlayer={kickPlayer}
          onAddBot={addBot}
          onRemoveBot={removeBot}
          onSetReady={setReady}
          onExitToMenu={() => {
            handleReturnToLobby();
            setMode('menu');
          }}
        />
      )}
      {showSettings && (
        <Suspense fallback={<Loading />}>
          <Settings
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onLogout={handleLogout}
            userName={currentUser?.name}
            userId={currentUser?.id}
            onClose={() => setShowSettings(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
