import { api } from './api';
import { Friend, FriendRequest } from '@/types/friends';

const mapFriendFromApi = (user: any): Friend => ({
  id: user.id,
  username: user.username,
  email: user.email ?? undefined,
  elo: user.elo ?? 0,
  avatar_url: user.avatarUrl ?? user.avatar_url ?? null,
  is_online: user.isOnline ?? user.is_online ?? false,
  last_seen: user.lastSeen ?? user.last_seen ?? null,
  created_at: user.createdAt ?? user.created_at ?? '',
});

const mapFriendRequestFromApi = (request: any): FriendRequest => ({
  id: request.id,
  sender_id: request.senderId ?? request.sender_id ?? '',
  username: request.username ?? request.senderUsername ?? '',
  elo: request.elo ?? request.senderElo ?? 0,
  avatar_url: request.avatarUrl ?? request.avatar_url ?? null,
  is_online: request.isOnline ?? request.is_online ?? false,
  last_seen: request.lastSeen ?? request.last_seen ?? null,
  created_at: request.createdAt ?? request.created_at ?? '',
});

export const friendsService = {
  async sendFriendRequest(receiverId: string): Promise<void> {
    await api.post('/friends/request', { receiverId });
  },

  async getPendingRequests(): Promise<FriendRequest[]> {
    const response = await api.get<FriendRequest[]>('/friends/requests');
    return response.data.map(mapFriendRequestFromApi);
  },

  async acceptRequest(requestId: string): Promise<void> {
    await api.post(`/friends/accept/${requestId}`);
  },

  async rejectRequest(requestId: string): Promise<void> {
    await api.delete(`/friends/reject/${requestId}`);
  },

  async getFriends(): Promise<Friend[]> {
    const response = await api.get<Friend[]>('/friends');
    return response.data.map(mapFriendFromApi);
  },

  async removeFriend(friendId: string): Promise<void> {
    await api.delete(`/friends/${friendId}`);
  },
};
