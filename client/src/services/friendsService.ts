import { api } from './api';
import { Friend, FriendRequest } from '@/types/friends';
import { mapFriendFromApi, mapFriendRequestFromApi } from './mappers';

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
