export type GameStatus = 'waiting' | 'playing' | 'voting' | 'finished';
export type PlayerRole = 'impostor' | 'citizen';
export type Winner = 'impostor' | 'citizens';

export interface GameSettings {
  categories: string[];
  roundTime: number;
  totalRounds: number;
  difficulty: 'easy' | 'medium' | 'hard';
  passTurns: number;
}

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
  password?: string;
  gameSettings?: GameSettings;
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
