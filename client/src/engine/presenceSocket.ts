import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
const PRESENCE_NAMESPACE = '/presence';

let presenceSocketInstance: Socket | null = null;

export const connectPresenceSocket = (token: string): Socket => {
  if (presenceSocketInstance) {
    if (!presenceSocketInstance.connected) {
      presenceSocketInstance.connect();
    }
    return presenceSocketInstance;
  }

  presenceSocketInstance = io(`${SOCKET_URL}${PRESENCE_NAMESPACE}`, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  presenceSocketInstance.on('connect', () => {
    console.log('[PRESENCE] connected:', presenceSocketInstance?.id);
  });

  presenceSocketInstance.on('disconnect', (reason) => {
    console.log('[PRESENCE] disconnected:', reason);
  });

  presenceSocketInstance.on('connect_error', (err) => {
    console.error('[PRESENCE] connect error:', err.message);
  });

  return presenceSocketInstance;
};

export const disconnectPresenceSocket = () => {
  if (!presenceSocketInstance) return;

  presenceSocketInstance.removeAllListeners();
  presenceSocketInstance.disconnect();
  presenceSocketInstance = null;
};

export const getPresenceSocket = () => presenceSocketInstance;
