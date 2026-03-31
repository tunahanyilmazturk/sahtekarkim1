import { useState, useCallback, useEffect, useRef } from 'react';
import type { Room, GameMode, Player, Message, PlayerRole } from '../types';
import { supabaseService, getRandomAvatar, type Room as SupabaseRoom, type Player as SupabasePlayer, type Message as SupabaseMessage } from '../lib/supabase';
import { getRandomWords } from '../lib/words';
import { GAME_CONFIG, ERROR_MESSAGES, getRandomBotName, getRandomBotAvatar, POINTS } from '../lib/constants';
import { getSmartBotHint, getSmartBotVote, getRandomBotDelay } from '../lib/botAI';

export function useGame() {
  // State
  const [mode, setMode] = useState<GameMode>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for subscriptions
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const playersUnsubRef = useRef<(() => void) | null>(null);
  const messagesUnsubRef = useRef<(() => void) | null>(null);
  const votesUnsubRef = useRef<(() => void) | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Convert Supabase room to local Room type
  const convertSupabaseRoom = useCallback((sbRoom: SupabaseRoom | null, players: SupabasePlayer[], messages: SupabaseMessage[], votes: Record<string, string>): Room | null => {
    if (!sbRoom) return null;

    const convertedPlayers: Player[] = players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isHost: p.is_host,
      score: p.score,
      isReady: p.is_ready,
      isBot: p.is_bot,
      role: p.role as PlayerRole | undefined,
      word: p.word,
      hint: p.hint,
    }));

    const convertedMessages: Message[] = messages.map((m) => ({
      id: m.id || '',
      isSystem: m.is_system,
      playerId: m.player_id || undefined,
      playerName: m.player_name || undefined,
      playerAvatar: m.player_avatar || undefined,
      text: m.text,
    }));

    return {
      id: sbRoom.id,
      players: convertedPlayers,
      status: sbRoom.status,
      chat: convertedMessages,
      currentTurnIndex: sbRoom.current_turn_index,
      round: sbRoom.round,
      votes,
      word: sbRoom.word || undefined,
      hint: sbRoom.hint || undefined,
      category: sbRoom.category || undefined,
      winner: sbRoom.winner,
      lastWord: sbRoom.last_word,
    };
  }, []);

  // Setup room subscriptions
  useEffect(() => {
    if (roomId && playerId && mode === 'room' && !unsubscribeRef.current) {
      let currentPlayers: SupabasePlayer[] = [];
      let currentMessages: SupabaseMessage[] = [];
      let currentVotes: Record<string, string> = {};
      let lastStatus: string | undefined = undefined;
      let roleCardShown = false;

      const updateRoom = () => {
        supabaseService.getRoom(roomId).then((sbRoom) => {
          const converted = convertSupabaseRoom(sbRoom, currentPlayers, currentMessages, currentVotes);
          setRoom(converted);

          // Show role card when game starts AND player has a role
          if (converted?.status === 'playing' && lastStatus !== 'playing') {
            const me = converted.players.find(p => p.id === playerId);
            if (me?.role && !roleCardShown) {
              setShowRoleCard(true);
              roleCardShown = true;
            }
          }

          // If status is playing but role card not shown yet, check if role is now available
          if (converted?.status === 'playing' && !roleCardShown) {
            const me = converted.players.find(p => p.id === playerId);
            if (me?.role) {
              setShowRoleCard(true);
              roleCardShown = true;
            }
          }

          lastStatus = converted?.status;
        });
      };

      // Subscribe to room changes
      unsubscribeRef.current = supabaseService.subscribeToRoom(roomId, () => {
        updateRoom();
      });

      // Subscribe to players changes
      playersUnsubRef.current = supabaseService.subscribeToPlayers(roomId, (players) => {
        currentPlayers = players;
        updateRoom();
      });

      // Subscribe to votes changes
      votesUnsubRef.current = supabaseService.subscribeToVotes(roomId, (votes) => {
        const votesMap: Record<string, string> = {};
        votes.forEach(v => {
          votesMap[v.voter_id] = v.voted_player_id;
        });
        currentVotes = votesMap;
        updateRoom();
      });

      // Subscribe to messages changes
      messagesUnsubRef.current = supabaseService.subscribeToMessages(roomId, (messages) => {
        currentMessages = messages;
        updateRoom();
      });

      // Initial load
      updateRoom();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (playersUnsubRef.current) {
        playersUnsubRef.current();
        playersUnsubRef.current = null;
      }
      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
        messagesUnsubRef.current = null;
      }
      if (votesUnsubRef.current) {
        votesUnsubRef.current();
        votesUnsubRef.current = null;
      }
    };
  }, [roomId, playerId, mode, convertSupabaseRoom]);

  // Derived state
  const me = room?.players.find((p) => p.id === playerId);
  const activePlayer = room?.players[room?.currentTurnIndex ?? 0];
  const isMyTurn = room?.status === 'playing' && activePlayer?.id === playerId;
  const canChat = room?.status === 'waiting' || room?.status === 'finished' || (room?.status === 'playing' && isMyTurn);

  const getChatPlaceholder = useCallback(() => {
    if (!room) return '';
    if (room.status === 'playing') {
      return isMyTurn ? "İpucu kelimeni yaz..." : "Sıranı bekle...";
    }
    if (room.status === 'finished') {
      return "Oyun bitti, sohbet edebilirsin...";
    }
    return "Sohbet et...";
  }, [room, isMyTurn]);

  // Helper: Validate name
  const validateName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return ERROR_MESSAGES.EMPTY_NAME;
    if (trimmed.length < GAME_CONFIG.PLAYER_NAME_MIN_LENGTH || trimmed.length > GAME_CONFIG.PLAYER_NAME_MAX_LENGTH) {
      return ERROR_MESSAGES.INVALID_NAME;
    }
    return null;
  };

  // Room actions
  const handleCreateRoom = async (settings?: { roomPassword?: string; gameSettings?: import('../types').GameSettings }) => {
    const validationError = validateName(playerName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();

      await supabaseService.createRoom(newRoomId, settings?.roomPassword, settings?.gameSettings);
      const newPlayerId = await supabaseService.addPlayer({
        room_id: newRoomId,
        name: playerName,
        avatar: getRandomAvatar(),
        is_host: true,
        score: 0,
        is_ready: true,
      });

      if (!newPlayerId) {
        throw new Error('Player ID oluşturulamadı');
      }

      await supabaseService.addMessage({
        room_id: newRoomId,
        text: `${playerName} oda kurdu.`,
        is_system: true,
        created_at: Date.now(),
      });

      setRoomId(newRoomId);
      setPlayerId(newPlayerId);
      setMode('room');
      setError('');
      setIsLoading(false);
    } catch (err) {
      console.error('Oda oluşturma hatası:', err);
      setError('Oda oluşturulamadı');
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (password?: string) => {
    const validationError = validateName(playerName);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!roomId.trim()) {
      setError(ERROR_MESSAGES.EMPTY_ROOM_CODE);
      return;
    }

    setIsLoading(true);
    try {
      const targetRoomId = roomId.toUpperCase();
      const existingRoom = await supabaseService.getRoom(targetRoomId);

      if (!existingRoom) {
        setError('Oda bulunamadı');
        setIsLoading(false);
        return;
      }

      if (existingRoom.password && existingRoom.password !== password) {
        setError('Yanlış şifre');
        setIsLoading(false);
        return;
      }

      if (existingRoom.status !== 'waiting' && existingRoom.status !== 'finished') {
        setError('Oyun başlamış');
        setIsLoading(false);
        return;
      }

      const players = await supabaseService.getPlayers(targetRoomId);
      if (players.length >= 16) {
        setError('Oda dolu');
        setIsLoading(false);
        return;
      }

      const newPlayerId = await supabaseService.addPlayer({
        room_id: targetRoomId,
        name: playerName,
        avatar: getRandomAvatar(),
        is_host: false,
        score: 0,
        is_ready: false,
      });

      if (!newPlayerId) {
        throw new Error('Player ID oluşturulamadı');
      }

      await supabaseService.addMessage({
        room_id: targetRoomId,
        text: `${playerName} odaya katıldı.`,
        is_system: true,
        created_at: Date.now(),
      });

      setRoomId(targetRoomId);
      setPlayerId(newPlayerId);
      setMode('room');
      setError('');
      setIsLoading(false);
    } catch (err) {
      console.error('Odaya katılma hatası:', err);
      setError('Odaya katılınamadı');
      setIsLoading(false);
    }
  };

  // Game actions
  const handleStartGame = async () => {
    if (!room || room.players.length < GAME_CONFIG.MIN_PLAYERS) {
      setError(ERROR_MESSAGES.MIN_PLAYERS);
      return;
    }

    try {
      const words = getRandomWords();
      const wordObj = words[Math.floor(Math.random() * words.length)];
      const impostorIndex = Math.floor(Math.random() * room.players.length);
      const randomStartIndex = Math.floor(Math.random() * room.players.length);
      
      const nextRound = Math.max(1, (room.round || 0) + 1);

      // Sahtekara kategori ipucu (kelime değil, üst kavram)
      const categoryHints: Record<string, string> = {
        'Hayvanlar': 'Hayvan',
        'Yemekler': 'Yiyecek',
        'Meslekler': 'Meslek',
        'Şehirler': 'Bir şehir',
        'Eşyalar': 'Eşya',
        'Spor': 'Bir spor',
        'Film/Dizi': 'Film veya dizi',
        'Meyveler': 'Meyve',
        'İçecekler': 'İçecek',
        'Kıyafetler': 'Giysi',
        'Ulaşım': 'Ulaşım aracı',
        'Doğa': 'Doğal şey',
        'Teknoloji': 'Teknoloji ürünü',
        'Müzik': 'Müzik aleti',
        'Vücut': 'Vücut parçası',
      };
      const impostorHint = categoryHints[wordObj.category] || wordObj.category;

      await supabaseService.updateRoom(room.id, {
        status: 'playing',
        current_turn_index: randomStartIndex,
        round: nextRound,
        word: wordObj.word,
        hint: wordObj.hint,
        category: wordObj.category,
      });

      for (let i = 0; i < room.players.length; i++) {
        const player = room.players[i];
        await supabaseService.updatePlayer(room.id, player.id, {
          role: i === impostorIndex ? 'impostor' : 'citizen',
          word: i === impostorIndex ? null : wordObj.word,
          hint: i === impostorIndex ? impostorHint : null,
          is_ready: true,
        });
      }
    } catch (err) {
      console.error('Oyun başlatma hatası:', err);
      setError('Oyun başlatılamadı');
    }
  };

  // Message handling
  const handleSendMessage = async (text: string) => {
    if (!room || !playerId || !text.trim()) return;
    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    try {
      await supabaseService.addMessage({
        room_id: room.id,
        player_id: playerId,
        player_name: player.name,
        player_avatar: player.avatar,
        text,
        is_system: false,
        created_at: Date.now(),
      });

      // If it's playing status, advance turn
      if (room.status === 'playing' && room.players[room.currentTurnIndex]?.id === playerId) {
        const nextTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
        await supabaseService.updateRoom(room.id, { current_turn_index: nextTurnIndex });
      }
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err);
    }
  };

  // Bot automation
  useEffect(() => {
    if (botTimerRef.current) {
      clearTimeout(botTimerRef.current);
    }

    if (!room || room.status !== 'playing' || !playerId) return;

    const activePlayer = room.players[room.currentTurnIndex];
    if (!activePlayer?.isBot) return;

    // Schedule bot message
    botTimerRef.current = setTimeout(async () => {
      try {
        if (!room || room.status !== 'playing') return;

        const currentPlayer = room.players[room.currentTurnIndex];
        if (!currentPlayer?.isBot || !currentPlayer.role || !room.word) return;

        // Generate hint based on role
        const hint = getSmartBotHint(currentPlayer, room.players, room.word);

        // Send message
        await supabaseService.addMessage({
          room_id: room.id,
          player_id: currentPlayer.id,
          player_name: currentPlayer.name,
          player_avatar: currentPlayer.avatar,
          text: hint,
          is_system: false,
          created_at: Date.now(),
        });

        // Advance turn
        const nextTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
        await supabaseService.updateRoom(room.id, { current_turn_index: nextTurnIndex });
      } catch (err) {
        console.error('Bot mesaj hatası:', err);
      }
    }, getRandomBotDelay() * 5);

    return () => {
      if (botTimerRef.current) {
        clearTimeout(botTimerRef.current);
      }
    };
  }, [room?.currentTurnIndex, room?.status, room?.players, room?.word]);

  // Voting
  const handleStartVoting = async () => {
    if (!room) return;
    try {
      await supabaseService.updateRoom(room.id, { status: 'voting' });
      await supabaseService.clearVotes(room.id);
      
      // Botları akıllı AI ile otomatik oy kullanmaya başlat
      const bots = room.players.filter(p => p.isBot);
      const currentMessages = room.chat || [];
      const currentWord = room.word || '';

      for (const bot of bots) {
        // Her bot farklı bir gecikmeyle oy kullansın (2-8 sn)
        const delay = Math.random() * 6000 + 2000;
        setTimeout(async () => {
          try {
            const currentRoom = await supabaseService.getRoom(room.id);
            if (!currentRoom || currentRoom.status !== 'voting') return;
            
            const currentPlayers = await supabaseService.getPlayers(room.id);
            
            // Akıllı AI ile oy hedefini belirle
            const botAsPlayer = room.players.find(p => p.id === bot.id);
            const allPlayersConverted = room.players.filter(p => p.id !== bot.id);
            
            let targetId: string;
            if (botAsPlayer && allPlayersConverted.length > 0) {
              // getSmartBotVote ile akıllı karar ver
              const convertedMessages = currentMessages.map(m => ({
                id: m.id || '',
                isSystem: m.isSystem || false,
                playerId: m.playerId,
                playerName: m.playerName,
                playerAvatar: m.playerAvatar,
                text: m.text,
              }));
              targetId = getSmartBotVote(botAsPlayer, allPlayersConverted, convertedMessages as any, currentWord);
            } else {
              // Fallback: rastgele insan oyuncuya oy ver
              const humanTargets = currentPlayers.filter(p => !p.is_bot && p.id !== bot.id);
              if (humanTargets.length === 0) return;
              targetId = humanTargets[Math.floor(Math.random() * humanTargets.length)].id;
            }
            
            await supabaseService.submitVote(room.id, bot.id, targetId);
            
            // Tüm oyler verildi mi kontrol et
            const votes = await supabaseService.getVotes(room.id);
            if (votes.length >= currentPlayers.length) {
              await calculateVoteResults(currentPlayers, votes);
            }
          } catch (err) {
            console.error('Bot oy hatası:', err);
          }
        }, delay);
      }
    } catch (err) {
      console.error('Oylama başlatma hatası:', err);
    }
  };

  const calculateVoteResults = async (currentPlayers: SupabasePlayer[], votes: any[]) => {
    if (!room) return;
    
    try {
      const voteCounts: Record<string, number> = {};
      votes.forEach(v => {
        voteCounts[v.voted_player_id] = (voteCounts[v.voted_player_id] || 0) + 1;
      });

      let maxVotes = 0;
      let votedOutId: string | null = null;
      let tie = false;

      for (const [vid, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
          maxVotes = count;
          votedOutId = vid;
          tie = false;
        } else if (count === maxVotes) {
          tie = true;
        }
      }

      const impostor = currentPlayers.find(p => p.role === 'impostor');
      let winner: 'impostor' | 'citizens' = 'citizens';
      let message = '';

      if (tie || !votedOutId) {
        winner = 'impostor';
        message = `Berabere! Sahtekar kazandı!`;
      } else {
        const votedPlayer = currentPlayers.find(p => p.id === votedOutId);
        if (votedPlayer?.role === 'impostor') {
          winner = 'citizens';
          message = `Sahtekar bulundu! Vatandaşlar kazand��!`;
        } else {
          winner = 'impostor';
          message = `Yanlış! ${votedPlayer?.name} vatandaştı. Sahtekar kazandı!`;
        }
      }

      await supabaseService.addMessage({
        room_id: room.id,
        text: message,
        is_system: true,
        created_at: Date.now(),
      });

      // Skorları güncelle
      const pointsToAdd = winner === 'impostor' ? POINTS.IMPOSTOR_WIN : POINTS.CITIZEN_WIN;
      for (const player of currentPlayers) {
        const isWinner = (winner === 'impostor' && player.role === 'impostor') ||
                         (winner === 'citizens' && player.role !== 'impostor');
        const newScore = isWinner ? player.score + pointsToAdd : player.score;
        await supabaseService.updatePlayer(room.id, player.id, { score: newScore });
      }

      await supabaseService.updateRoom(room.id, {
        status: 'finished',
        winner,
      });
    } catch (err) {
      console.error('Oylama sonucu hesaplama hatası:', err);
    }
  };

  const handleVote = async (votedPlayerId: string) => {
    if (!room || !playerId) return;

    try {
      await supabaseService.submitVote(room.id, playerId, votedPlayerId);

      const votes = await supabaseService.getVotes(room.id);
      const players = await supabaseService.getPlayers(room.id);
      
      if (votes.length >= players.length) {
        await calculateVoteResults(players, votes);
      }
    } catch (err) {
      console.error('Oy verme hatası:', err);
    }
  };

  // Impostor guess
  const handleImpostorGuess = async (guess: string) => {
    if (!room || !playerId || !guess.trim()) return;
    const player = room.players.find(p => p.id === playerId);
    if (player?.role !== 'impostor') return;

    try {
      const isCorrect = guess.toLowerCase() === room.word?.toLowerCase();

      let winner: 'impostor' | 'citizens';
      let message: string;

      if (isCorrect) {
        winner = 'impostor';
        message = `Sahtekar kelimeyi bildi: "${room.word}" - Sahtekar kazandı!`;
      } else {
        winner = 'citizens';
        message = `Sahtekar yanlış tahmin etti: "${guess}" - Vatandaşlar kazandı!`;
      }

      await supabaseService.addMessage({
        room_id: room.id,
        text: message,
        is_system: true,
        created_at: Date.now(),
      });

      // Skorları güncelle
      const pointsToAdd = winner === 'impostor' ? POINTS.CORRECT_GUESS : POINTS.CITIZEN_WIN;
      const currentPlayers = await supabaseService.getPlayers(room.id);
      for (const p of currentPlayers) {
        const isWinner = (winner === 'impostor' && p.id === playerId) ||
                         (winner === 'citizens' && p.id !== playerId);
        const newScore = isWinner ? p.score + pointsToAdd : p.score;
        await supabaseService.updatePlayer(room.id, p.id, { score: newScore });
      }

      await supabaseService.updateRoom(room.id, {
        status: 'finished',
        winner,
      });
    } catch (err) {
      console.error('Sahtekar tahmin hatası:', err);
    }
  };

  // Return to lobby
  const handleReturnToLobby = async () => {
    if (!room) return;

    try {
      await supabaseService.updateRoom(room.id, {
        status: 'waiting',
        current_turn_index: 0,
        word: null,
        hint: null,
        category: null,
        winner: null,
      });

      await supabaseService.clearVotes(room.id);

      for (const player of room.players) {
        await supabaseService.updatePlayer(room.id, player.id, {
          is_ready: false,
          role: null,
          word: null,
          hint: null,
        });
      }
    } catch (err) {
      console.error('Lobiye dönme hatası:', err);
    }
  };

  // Player management
  const handleKickPlayer = async (targetPlayerId: string) => {
    if (!room) return;
    try {
      await supabaseService.removePlayer(room.id, targetPlayerId);
    } catch (err) {
      console.error('Oyuncu atma hatası:', err);
    }
  };

  const handleSetReady = async (isReady: boolean) => {
    if (!room || !playerId) return;
    try {
      await supabaseService.updatePlayer(room.id, playerId, { is_ready: isReady });
    } catch (err) {
      console.error('Ready durumu güncelleme hatası:', err);
    }
  };

  const handleAddBot = async () => {
    if (!room) return;
    try {
      const players = await supabaseService.getPlayers(room.id);
      if (players.length >= 16) return;

      const existingBotNames = players.filter(p => p.is_bot).map(p => p.name);
      const botName = getRandomBotName(existingBotNames);
      const botAvatar = getRandomBotAvatar();

      await supabaseService.addPlayer({
        room_id: room.id,
        name: botName,
        avatar: botAvatar,
        is_host: false,
        score: 0,
        is_ready: true,
        is_bot: true,
      });
    } catch (err) {
      console.error('Bot ekleme hatası:', err);
    }
  };

  const handleRemoveBot = async (botId: string) => {
    if (!room) return;
    try {
      await supabaseService.removePlayer(room.id, botId);
    } catch (err) {
      console.error('Bot kaldırma hatası:', err);
    }
  };

  // Return hook interface
  return {
    mode,
    setMode,
    playerName,
    setPlayerName,
    roomId,
    setRoomId,
    room,
    playerId,
    setRoom,
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
    kickPlayer: handleKickPlayer,
    setReady: handleSetReady,
    addBot: handleAddBot,
    removeBot: handleRemoveBot,
  };
}
