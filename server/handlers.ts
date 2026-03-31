import { Server, Socket } from 'socket.io';
import type { Room, CreateRoomResponse, JoinRoomResponse, GameSettings } from './types.js';
import { createPlayer, createBot, createRoom, createSystemMessage, startNewRound, handleMessage, startVoting, submitVote, calculateVoteResults, handleImpostorGuess, returnToLobby } from './gameLogic.js';

interface CreateRoomOptions {
  roomPassword?: string;
  gameSettings?: GameSettings;
}

export function setupSocketHandlers(io: Server, rooms: Map<string, Room>): void {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('createRoom', ({ playerName, roomPassword, gameSettings }, callback: (res: CreateRoomResponse) => void) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const player = createPlayer(socket.id, playerName, true);
      const room = createRoom(roomId, player);
      
      room.password = roomPassword;
      room.gameSettings = gameSettings;
      
      rooms.set(roomId, room);
      socket.join(roomId);
      
      const response: CreateRoomResponse = { success: true, roomId, player };
      callback(response);
      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('joinRoom', ({ roomId, playerName, password }, callback: (res: JoinRoomResponse) => void) => {
      const room = rooms.get(roomId);
      
      if (!room) {
        return callback({ success: false, message: 'Oda bulunamadı.' });
      }
      if (room.password && room.password !== password) {
        return callback({ success: false, message: 'Yanlış şifre.' });
      }
      if (room.status !== 'waiting' && room.status !== 'finished') {
        return callback({ success: false, message: 'Oyun zaten başlamış.' });
      }
      if (room.players.length >= 16) {
        return callback({ success: false, message: 'Oda dolu.' });
      }
      if (room.players.some((p) => p.name === playerName)) {
        return callback({ success: false, message: 'Bu isimde bir oyuncu zaten var.' });
      }

      const player = createPlayer(socket.id, playerName, room.players.length === 0);
      room.players.push(player);
      socket.join(roomId);
      
      const response: JoinRoomResponse = { success: true, roomId, player };
      room.chat.push(createSystemMessage(`${playerName} odaya katıldı.`));
      
      callback(response);
      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('kickPlayer', ({ roomId, playerId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const host = room.players.find(p => p.id === socket.id);
      if (!host?.isHost) return;

      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return;

      const kickedPlayer = room.players[playerIndex];
      if (kickedPlayer.isHost) return;

      room.players.splice(playerIndex, 1);
      room.chat.push(createSystemMessage(`${kickedPlayer.name} oyundan atıldı.`));

      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('setReady', ({ roomId, isReady }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.isHost) return;

      player.isReady = isReady;
      room.chat.push(createSystemMessage(`${player.name} ${isReady ? 'hazır.' : 'hazır değil.'}`));

      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('addBot', ({ roomId }) => {
      console.log('addBot event received from:', socket.id, 'roomId:', roomId);
      const room = rooms.get(roomId);
      if (!room) {
        console.log('Room not found:', roomId);
        return;
      }

      const host = room.players.find(p => p.id === socket.id);
      console.log('Host check:', host?.isHost, 'socket.id:', socket.id);
      if (!host?.isHost) {
        console.log('Not host, cannot add bot');
        return;
      }
      if (room.players.length >= 16) {
        console.log('Room full');
        return;
      }

      const bot = createBot();
      room.players.push(bot);
      room.chat.push(createSystemMessage(`Bot eklendi: ${bot.name}`));
      console.log('Bot added:', bot.name);

      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('removeBot', ({ roomId, botId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const host = room.players.find(p => p.id === socket.id);
      if (!host?.isHost) return;

      const botIndex = room.players.findIndex(p => p.id === botId && p.isBot);
      if (botIndex === -1) return;

      const bot = room.players[botIndex];
      room.players.splice(botIndex, 1);
      room.chat.push(createSystemMessage(`${bot.name} kaldırıldı.`));

      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('startGame', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.players.length < 3) return;

      const nonReadyPlayers = room.players.filter(p => !p.isHost && !p.isBot && !p.isReady);
      if (nonReadyPlayers.length > 0) {
        return;
      }

      startNewRound(room);
      io.to(roomId).emit('roomUpdated', room);
      io.to(roomId).emit('gameStarted');
    });

    socket.on('sendMessage', ({ roomId, text }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.find((p) => p.id === socket.id);
      if (!player) return;

      handleMessage(room, player, text);
      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('startVoting', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      startVoting(room);
      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('submitVote', ({ roomId, votedPlayerId }) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'voting') return;

      const allVoted = submitVote(room, socket.id, votedPlayerId);
      
      if (allVoted) {
        calculateVoteResults(room);
      }
      
      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('impostorGuess', ({ roomId, guess }) => {
      const room = rooms.get(roomId);
      if (!room || room.status !== 'playing') return;

      const player = room.players.find((p) => p.id === socket.id);
      if (!player || player.role !== 'impostor') return;

      handleImpostorGuess(room, player, guess);
      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('returnToLobby', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      returnToLobby(room);
      io.to(roomId).emit('roomUpdated', room);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id);
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          room.players.splice(playerIndex, 1);
          room.chat.push(createSystemMessage(`${player.name} odadan ayrıldı.`));

          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            if (player.isHost) {
              room.players[0].isHost = true;
            }
            io.to(roomId).emit('roomUpdated', room);
          }
        }
      });
    });
  });
}
