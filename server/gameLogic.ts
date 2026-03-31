import { v4 as uuidv4 } from 'uuid';
import type { Room, Player, Message, Word } from './types.js';
import { getRandomWord } from '../src/lib/words.js';

const AVATARS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐙', '🦄', '🦖', '👽'];
const BOT_AVATARS = ['🤖', '🎃', '👻', '👽', '🦄', '🦖', '🐙', '🦋'];
const BOT_NAMES = ['Ahmet', 'Mehmet', 'Ali', 'Ayşe', 'Fatma', 'Emre', 'Deniz', 'Zeynep', 'Cem', 'Leyla', 'Mert', 'Elif', 'Kaan', 'Nisa', 'Baran', 'Ada'];

let botCounter = 0;

export function createPlayer(id: string, name: string, isHost: boolean = false, isBot: boolean = false): Player {
  return {
    id,
    name,
    avatar: isBot ? BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)] : AVATARS[Math.floor(Math.random() * AVATARS.length)],
    isHost,
    score: 0,
    isReady: isBot,
    isBot,
  };
}

export function createBot(): Player {
  botCounter++;
  const botName = BOT_NAMES[botCounter % BOT_NAMES.length] + botCounter;
  return createPlayer(`bot_${botCounter}`, botName, false, true);
}

export function createRoom(roomId: string, host: Player): Room {
  return {
    id: roomId,
    players: [host],
    status: 'waiting',
    chat: [],
    currentTurnIndex: 0,
    round: 0,
    votes: {},
  };
}

export function createSystemMessage(text: string): Message {
  return {
    id: uuidv4(),
    isSystem: true,
    text,
  };
}

export function createPlayerMessage(player: Player, text: string): Message {
  return {
    id: uuidv4(),
    isSystem: false,
    playerId: player.id,
    playerName: player.name,
    playerAvatar: player.avatar,
    text,
  };
}

export function startNewRound(room: Room): void {
  const wordObj: Word = getRandomWord();
  
  room.word = wordObj.word;
  room.hint = wordObj.hint;
  room.category = wordObj.category;
  room.status = 'playing';
  room.currentTurnIndex = 0;
  room.chat = [];
  room.votes = {};
  room.round = (room.round || 0) + 1;
  room.winner = null;
  room.lastWord = null;

  const impostorIndex = Math.floor(Math.random() * room.players.length);
  room.players.forEach((p, index) => {
    if (index === impostorIndex) {
      p.role = 'impostor';
      p.word = null;
      p.hint = room.hint;
    } else {
      p.role = 'citizen';
      p.word = room.word;
      p.hint = null;
    }
  });

  room.chat.push(createSystemMessage(
    `Tur ${room.round} başladı! Kategori: ${room.category}. İlk sıra: ${room.players[0].name}`
  ));
}

export function handleMessage(room: Room, player: Player, text: string): void {
  room.chat.push(createPlayerMessage(player, text));

  if (room.status === 'playing' && room.players[room.currentTurnIndex].id === player.id) {
    room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
  }
}

export function startVoting(room: Room): void {
  room.status = 'voting';
  room.votes = {};
  room.chat.push(createSystemMessage('Oylama başladı! Kimin sahtekar olduğunu düşünüyorsanız ona oy verin.'));
}

export function submitVote(room: Room, voterId: string, votedPlayerId: string): boolean {
  room.votes[voterId] = votedPlayerId;
  return Object.keys(room.votes).length === room.players.length;
}

export function calculateVoteResults(room: Room): void {
  const voteCounts: Record<string, number> = {};
  Object.values(room.votes).forEach((vid) => {
    voteCounts[vid] = (voteCounts[vid] || 0) + 1;
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

  room.status = 'finished';
  room.lastWord = room.word;
  const impostor = room.players.find((p) => p.role === 'impostor');

  if (tie || !votedOutId) {
    room.winner = 'impostor';
    impostor!.score += 2;
    room.chat.push(createSystemMessage(
      `Oylama berabere bitti! Sahtekar (${impostor!.name}) kazandı! Kelime: ${room.word}`
    ));
  } else {
    const votedOutPlayer = room.players.find((p) => p.id === votedOutId);
    if (votedOutPlayer?.role === 'impostor') {
      room.winner = 'citizens';
      room.players.forEach((p) => { if (p.role === 'citizen') p.score += 1; });
      room.chat.push(createSystemMessage(
        `Tebrikler! Sahtekarı (${impostor!.name}) buldunuz. Vatandaşlar kazandı! Kelime: ${room.word}`
      ));
    } else {
      room.winner = 'impostor';
      impostor!.score += 2;
      room.chat.push(createSystemMessage(
        `Yanlış kişiyi elediniz! Elenen kişi ${votedOutPlayer?.name} bir vatandaştı. Sahtekar (${impostor!.name}) kazandı! Kelime: ${room.word}`
      ));
    }
  }
}

export function handleImpostorGuess(room: Room, player: Player, guess: string): void {
  room.status = 'finished';
  room.lastWord = room.word;
  
  const isCorrect = guess.toLowerCase().trim() === room.word?.toLowerCase().trim();
  
  if (isCorrect) {
    room.winner = 'impostor';
    player.score += 2;
    room.chat.push(createSystemMessage(
      `Sahtekar (${player.name}) kelimeyi doğru tahmin etti! Sahtekar Kazandı! Kelime: ${room.word}`
    ));
  } else {
    room.winner = 'citizens';
    room.players.forEach((p) => { if (p.role === 'citizen') p.score += 1; });
    room.chat.push(createSystemMessage(
      `Sahtekar (${player.name}) kelimeyi yanlış tahmin etti! Tahmini: ${guess}. Vatandaşlar Kazandı! Kelime: ${room.word}`
    ));
  }
}

export function returnToLobby(room: Room): void {
  room.status = 'waiting';
  room.chat = [];
  room.votes = {};
  room.round = 0;
  room.winner = null;
  room.lastWord = null;
  room.players.forEach((p) => {
    p.role = undefined;
    p.word = undefined;
    p.hint = undefined;
    p.score = 0;
  });
}
