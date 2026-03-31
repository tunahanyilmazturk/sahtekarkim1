import { useState, useCallback, useRef, useEffect } from 'react';
import type { Player, Message, PlayerRole, Winner } from '../types';
import { getRandomWord } from '../lib/words';
import { GAME_CONFIG, POINTS } from '../lib/constants';
import { v4 as uuidv4 } from 'uuid';
import { getSmartBotVote, getSmartBotHint, getRandomBotDelay, getRandomVotingDelay } from '../lib/botAI';

export type OfflinePhase = 
  | 'setup'           // Oyuncu ekleme
  | 'role_distribution'  // Her oyuncuya sırayla rol gösteriliyor
  | 'playing'         // Oyun oynanıyor
  | 'voting'          // Oylama
  | 'finished';       // Oyun bitti

interface OfflineGameState {
  phase: OfflinePhase;
  players: Player[];
  currentTurnIndex: number;
  round: number;
  word: string;
  hint: string;
  category: string;
  messages: Message[];
  votes: Record<string, string>;
  winner: Winner | null;
  currentPlayerIndex: number;  // Rol gösterimi için hangi oyuncu
  revealedPlayers: string[];  // Hangi oyuncular rolleri gördü
}

export function useOfflineGame() {
  const [gameState, setGameState] = useState<OfflineGameState | null>(null);

  const setGameStateDirectly = useCallback((updater: (prev: OfflineGameState | null) => OfflineGameState | null) => {
    setGameState(updater);
  }, []);
  const [showRoleCard, setShowRoleCard] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const createGame = useCallback((playerNames: { name: string; isBot: boolean }[]) => {
    const players: Player[] = playerNames.map((p, index) => ({
      id: uuidv4(),
      name: p.name,
      avatar: p.isBot 
        ? ['🤖', '🎃', '👻', '👽', '🦄', '🦖', '🐙', '🦋'][index % 8]
        : ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁'][index % 8],
      isHost: index === 0,
      score: 0,
      isReady: false,
      isBot: p.isBot,
    }));

    setGameState({
      phase: 'setup',
      players,
      currentTurnIndex: 0,
      round: 0,
      word: '',
      hint: '',
      category: '',
      messages: [],
      votes: {},
      winner: null,
      currentPlayerIndex: 0,
      revealedPlayers: [],
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.players.length < GAME_CONFIG.MIN_PLAYERS) return prev;

      const wordObj = getRandomWord();
      const impostorIndex = Math.floor(Math.random() * prev.players.length);

      const updatedPlayers = prev.players.map((p, index) => ({
        ...p,
        role: index === impostorIndex ? 'impostor' as PlayerRole : 'citizen' as PlayerRole,
        word: index === impostorIndex ? null : wordObj.word,
        hint: index === impostorIndex ? wordObj.hint : null,
      }));

      return {
        ...prev,
        phase: 'role_distribution',
        players: updatedPlayers,
        round: prev.round + 1,
        word: wordObj.word,
        hint: wordObj.hint,
        category: wordObj.category,
        messages: [{
          id: uuidv4(),
          isSystem: true,
          text: `Tur ${prev.round + 1} başladı! Kategori: ${wordObj.category}`,
        }],
        currentTurnIndex: 0,
        votes: {},
        winner: null,
        currentPlayerIndex: 0,
        revealedPlayers: [],
      };
    });

    setShowRoleCard(true);
  }, []);

  const nextReveal = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.phase !== 'role_distribution') return prev;

      const nextIndex = prev.currentPlayerIndex + 1;

      if (nextIndex >= prev.players.length) {
        return {
          ...prev,
          phase: 'playing',
          currentPlayerIndex: 0,
        };
      }

      return {
        ...prev,
        currentPlayerIndex: nextIndex,
      };
    });
  }, []);

  const nextTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.phase !== 'playing') return prev;
      const nextIndex = (prev.currentTurnIndex + 1) % prev.players.length;
      return {
        ...prev,
        currentTurnIndex: nextIndex,
      };
    });
  }, []);

  const sendMessage = useCallback((text: string) => {
    setGameState(prev => {
      if (!prev || !text.trim() || prev.phase !== 'playing') return prev;

      const currentPlayer = prev.players[prev.currentTurnIndex];
      const newMessage: Message = {
        id: uuidv4(),
        isSystem: false,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        playerAvatar: currentPlayer.avatar,
        text: text.trim(),
      };

      return {
        ...prev,
        messages: [...prev.messages, newMessage],
      };
    });

    nextTurn();
  }, [nextTurn]);

  const startVoting = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'voting',
        votes: {},
        messages: [...prev.messages, {
          id: uuidv4(),
          isSystem: true,
          text: 'Oylama başladı! Sahtekarı bulun.',
        }],
      };
    });
  }, []);

  const submitVote = useCallback((votedPlayerId?: string) => {
    setGameState(prev => {
      if (!prev || prev.phase !== 'voting') return prev;

      const currentVoter = prev.players[prev.currentPlayerIndex];
      
      let targetId = votedPlayerId;
      if (!targetId && currentVoter.isBot) {
        targetId = getSmartBotVote(currentVoter, prev.players, prev.messages, prev.word);
      }
      
      if (!targetId) return prev;
      
      const newVotes = { ...prev.votes, [currentVoter.id]: targetId };
      const nextPlayerIndex = prev.currentPlayerIndex + 1;

      if (nextPlayerIndex >= prev.players.length) {
        const voteCounts: Record<string, number> = {};
        Object.values(newVotes).forEach(votedId => {
          voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
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

        const impostor = prev.players.find(p => p.role === 'impostor');
        let winner: Winner;
        let endMessage: string;

        if (tie || !votedOutId) {
          winner = 'impostor';
          endMessage = `Berabere! Sahtekar (${impostor!.name}) kazandı! +${POINTS.TIE_IMPOSTOR} puan`;
        } else {
          const votedOut = prev.players.find(p => p.id === votedOutId);
          if (votedOut?.role === 'impostor') {
            winner = 'citizens';
            const citizenPoints = POINTS.CITIZEN_WIN;
            endMessage = `Sahtekar (${impostor!.name}) bulundu! Vatandaşlar kazandı! +${citizenPoints} puan`;
          } else {
            winner = 'impostor';
            endMessage = `Yanlış! ${votedOut?.name} vatandaştı. Sahtekar (${impostor!.name}) kazandı! +${POINTS.IMPOSTOR_WIN} puan`;
          }
        }

        return {
          ...prev,
          phase: 'finished',
          votes: newVotes,
          winner,
          messages: [...prev.messages, {
            id: uuidv4(),
            isSystem: true,
            text: endMessage,
          }],
          currentPlayerIndex: 0,
        };
      }

      return {
        ...prev,
        votes: newVotes,
        currentPlayerIndex: nextPlayerIndex,
      };
    });
  }, []);

  const impostorGuess = useCallback((guess: string) => {
    setGameState(prev => {
      if (!prev || prev.phase !== 'playing') return prev;

      const impostor = prev.players.find(p => p.role === 'impostor');
      if (!impostor) return prev;

      const isCorrect = guess.toLowerCase().trim() === prev.word.toLowerCase().trim();
      let winner: Winner;
      let endMessage: string;

      if (isCorrect) {
        winner = 'impostor';
        endMessage = `Doğru tahmin! Sahtekar (${impostor.name}) kazandı! +${POINTS.IMPOSTOR_WIN} puan`;
      } else {
        winner = 'citizens';
        endMessage = `Yanlış tahmin! Vatandaşlar kazandı! +${POINTS.CITIZEN_WIN} puan`;
      }

      return {
        ...prev,
        phase: 'finished',
        winner,
        messages: [...prev.messages, {
          id: uuidv4(),
          isSystem: true,
          text: endMessage,
        }],
      };
    });
  }, []);

  const returnToLobby = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        phase: 'setup' as OfflinePhase,
        players: prev.players.map(p => ({
          ...p,
          role: undefined,
          word: undefined,
          hint: undefined,
          // Skoru sıfırlama - birikimli skor korunuyor
        })),
        currentTurnIndex: 0,
        round: 0,
        word: '',
        hint: '',
        category: '',
        messages: [],
        votes: {},
        winner: null,
        currentPlayerIndex: 0,
        revealedPlayers: [],
      };
    });
  }, []);

  const nextRound = useCallback(() => {
    startGame();
  }, [startGame]);

  // Bot AI: Otomatik ipucu verme (oyun sırasında)
  useEffect(() => {
    if (!gameState || gameState.phase !== 'playing') return;
    if (!gameState.players?.length) return;
    
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer || !currentPlayer.isBot) return;
    if (!gameState.word) return;

    const timeout = setTimeout(() => {
      const hint = getSmartBotHint(currentPlayer, gameState.players, gameState.word);
      setGameStateDirectly(prev => {
        if (!prev || prev.phase !== 'playing') return prev;
        
        const newMessage: Message = {
          id: uuidv4(),
          isSystem: false,
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          playerAvatar: currentPlayer.avatar,
          text: hint,
        };

        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          currentTurnIndex: (prev.currentTurnIndex + 1) % prev.players.length,
        };
      });
    }, getRandomBotDelay());

    return () => clearTimeout(timeout);
  }, [gameState?.currentTurnIndex, gameState?.phase, setGameStateDirectly]);

  // Bot AI: Otomatik oy verme (oylama sırasında)
  useEffect(() => {
    if (!gameState || gameState.phase !== 'voting') return;
    if (!gameState.players?.length) return;
    
    const currentVoter = gameState.players[gameState.currentPlayerIndex];
    if (!currentVoter || !currentVoter.isBot) return;

    const timeout = setTimeout(() => {
      submitVote();
    }, getRandomVotingDelay());

    return () => clearTimeout(timeout);
  }, [gameState?.currentPlayerIndex, gameState?.phase, submitVote]);

  return {
    gameState,
    setGameState: setGameStateDirectly,
    showRoleCard,
    setShowRoleCard,
    chatEndRef,
    createGame,
    startGame,
    nextReveal,
    sendMessage,
    startVoting,
    submitVote,
    impostorGuess,
    returnToLobby,
    nextRound,
  };
}
