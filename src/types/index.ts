export type GameMode = 'menu' | 'online_setup' | 'offline_setup' | 'room';
export type GameStatus = 'waiting' | 'playing' | 'voting' | 'finished';
export type PlayerRole = 'impostor' | 'citizen';
export type Winner = 'impostor' | 'citizens';

export interface GameSettings {
  categories: string[];
  roundTime: number;
  totalRounds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  passTurns: number;
  points: {
    citizenWin: number;
    impostorWin: number;
    correctGuess: number;
    tie: number;
  };
}

export const DEFAULT_SETTINGS: GameSettings = {
  categories: ['Hayvanlar', 'Yemekler', 'Meslekler', 'Şehirler', 'Eşyalar', 'Spor', 'Film/Dizi', 'Meyveler', 'İçecekler', 'Kıyafetler', 'Ulaşım', 'Doğa', 'Teknoloji', 'Müzik', 'Vücut'],
  roundTime: 60,
  totalRounds: 5,
  difficulty: 'medium',
  passTurns: 2,
  points: {
    citizenWin: 10,
    impostorWin: 15,
    correctGuess: 20,
    tie: 5,
  },
};

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  score: number;
  isReady: boolean;
  isBot?: boolean;
  role?: PlayerRole;
  word?: string | null;
  hint?: string | null;
}

export interface Message {
  id: string;
  playerId?: string;
  playerName?: string;
  playerAvatar?: string;
  text: string;
  isSystem: boolean;
}

export interface Room {
  id: string;
  players: Player[];
  status: GameStatus;
  chat: Message[];
  currentTurnIndex: number;
  round: number;
  votes: Record<string, string>;
  word?: string;
  hint?: string;
  category?: string;
  winner?: Winner | null;
  lastWord?: string | null;
}

export interface Word {
  word: string;
  hint: string;
  category: string;
}

export interface CreateRoomResponse {
  success: boolean;
  roomId?: string;
  player?: Player;
  message?: string;
}

export interface JoinRoomResponse {
  success: boolean;
  roomId?: string;
  player?: Player;
  message?: string;
}
