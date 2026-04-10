import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@/types/socket';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
if (!SOCKET_URL) {
  throw new Error('VITE_SOCKET_URL is not defined in environment variables');
}

let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const connectSocket = (token: string): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (socketInstance) {
    socketInstance.auth = { token };

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    return socketInstance;
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socketInstance.on('connect_error', (err) => {
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

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => socketInstance;
