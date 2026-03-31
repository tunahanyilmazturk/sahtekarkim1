import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    // In development, connect to the same host
    // The APP_URL is injected, but socket.io client defaults to window.location if not provided
    socket = io();
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });
    
    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
    });
  }
  return socket;
};
