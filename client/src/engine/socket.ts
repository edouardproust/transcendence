import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socketInstance: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socketInstance?.connected) return socketInstance;

  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socketInstance.on('connect', () => {
    console.log('[SOCKET] connected:', socketInstance?.id);
  });

  socketInstance.on('disconnect', (reason) => {
    console.log('[SOCKET] disconnected:', reason);
  });

  socketInstance.on('connectError', (err) => {
    console.error('[SOCKET] connect error:', err.message);
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) return;

  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;
};

export const getSocket = () => socketInstance;