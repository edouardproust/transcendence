import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/authStore';
import { connectPresenceSocket } from '@/engine/presenceSocket';
import { useFriends } from './useFriends';

interface UsePresenceOptions {
  onUserStatus?: (userId: string, isOnline: boolean, lastSeen: string) => void;
  friends?: { id: string }[];
}

export const usePresence = (options: UsePresenceOptions = {}) => {
  const { token } = useAuthStore();
  const { updateFriendStatus } = useFriends();

  useEffect(() => {
    if (!token) return;

    const socket = connectPresenceSocket(token);

    const handleUserStatus = (data: {
      userId: string;
      is_online: boolean;
      last_seen: string;
    }) => {
      updateFriendStatus(data.userId, data.is_online, data.last_seen);
      options.onUserStatus?.(data.userId, data.is_online, data.last_seen);
    };

    socket.on('user_status', handleUserStatus);

    return () => {
      socket.off('user_status', handleUserStatus);
    };
  }, [token, updateFriendStatus, options.onUserStatus]);
};
