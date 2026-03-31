import { useEffect, useCallback } from 'react';
import { getSocket } from '../lib/socket';
import type { Room, CreateRoomResponse, JoinRoomResponse } from '../types';
import type { GameSettings } from '../types';

interface CreateRoomOptions {
  roomPassword?: string;
  gameSettings?: GameSettings;
}

export function useSocket(room: Room | null, onRoomUpdate: (room: Room) => void, onGameStart: () => void) {
  const socket = getSocket();

  useEffect(() => {
    socket.on('roomUpdated', onRoomUpdate);
    socket.on('gameStarted', onGameStart);

    return () => {
      socket.off('roomUpdated', onRoomUpdate);
      socket.off('gameStarted', onGameStart);
    };
  }, [socket, onRoomUpdate, onGameStart]);

  const createRoom = useCallback((playerName: string, options?: CreateRoomOptions): Promise<CreateRoomResponse> => {
    return new Promise((resolve) => {
      socket.emit('createRoom', { playerName, ...options }, (res: CreateRoomResponse) => {
        resolve(res);
      });
    });
  }, [socket]);

  const joinRoom = useCallback((roomId: string, playerName: string, password?: string): Promise<JoinRoomResponse> => {
    return new Promise((resolve) => {
      socket.emit('joinRoom', { roomId, playerName, password }, (res: JoinRoomResponse) => {
        resolve(res);
      });
    });
  }, [socket]);

  const kickPlayer = useCallback((roomId: string, playerId: string) => {
    socket.emit('kickPlayer', { roomId, playerId });
  }, [socket]);

  const setReady = useCallback((roomId: string, isReady: boolean) => {
    socket.emit('setReady', { roomId, isReady });
  }, [socket]);

  const addBot = useCallback((roomId: string) => {
    console.log('addBot called, roomId:', roomId, 'socket.id:', socket.id);
    socket.emit('addBot', { roomId });
  }, [socket]);

  const removeBot = useCallback((roomId: string, botId: string) => {
    socket.emit('removeBot', { roomId, botId });
  }, [socket]);

  const startGame = useCallback((roomId: string) => {
    socket.emit('startGame', { roomId });
  }, [socket]);

  const sendMessage = useCallback((roomId: string, text: string) => {
    socket.emit('sendMessage', { roomId, text });
  }, [socket]);

  const startVoting = useCallback((roomId: string) => {
    socket.emit('startVoting', { roomId });
  }, [socket]);

  const submitVote = useCallback((roomId: string, votedPlayerId: string) => {
    socket.emit('submitVote', { roomId, votedPlayerId });
  }, [socket]);

  const impostorGuess = useCallback((roomId: string, guess: string) => {
    socket.emit('impostorGuess', { roomId, guess });
  }, [socket]);

  const returnToLobby = useCallback((roomId: string) => {
    socket.emit('returnToLobby', { roomId });
  }, [socket]);

  return {
    socket,
    createRoom,
    joinRoom,
    startGame,
    sendMessage,
    startVoting,
    submitVote,
    impostorGuess,
    returnToLobby,
    kickPlayer,
    setReady,
    addBot,
    removeBot,
  };
}
