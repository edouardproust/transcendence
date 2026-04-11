import { useState, useEffect, useCallback } from 'react';
import { friendsService } from '@/services/friendsService';
import { Friend, FriendRequest } from '@/types/friends';

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    try {
      const data = await friendsService.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const data = await friendsService.getPendingRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([loadFriends(), loadRequests()]);
    setIsLoading(false);
  }, [loadFriends, loadRequests]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const sendRequest = async (receiverId: string) => {
    await friendsService.sendFriendRequest(receiverId);
  };

  const acceptRequest = async (requestId: string) => {
    await friendsService.acceptRequest(requestId);
    await loadRequests();
    await loadFriends();
  };

  const rejectRequest = async (requestId: string) => {
    await friendsService.rejectRequest(requestId);
    await loadRequests();
  };

  const removeFriend = async (friendId: string) => {
    await friendsService.removeFriend(friendId);
    await loadFriends();
  };

  const updateFriendStatus = (
    targetUserId: string,
    isOnline: boolean,
    lastSeen: string,
  ) => {
    setFriends((prev) =>
      prev.map((friend) =>
        friend.id === targetUserId
          ? { ...friend, is_online: isOnline, last_seen: lastSeen }
          : friend,
      ),
    );
  };

  return {
    friends,
    requests,
    isLoading,
    loadAll,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    updateFriendStatus,
    setRequests,
    setFriends,
  };
};
