import { api } from './api';
import { Friend } from '@/types/friends';
import { User, UserProfile } from '@/types/user';

const mapUserFromApi = (apiUser: any): User => ({
  id: apiUser.id,
  username: apiUser.username,
  email: apiUser.email ?? '',
  elo: apiUser.elo ?? 0,
  role: apiUser.role === 'ADMIN' ? 'ADMIN' : 'USER',
  avatar_url: apiUser.avatarUrl ?? apiUser.avatar_url ?? null,
  is_online: apiUser.isOnline ?? apiUser.is_online ?? false,
  last_seen: apiUser.lastSeen ?? apiUser.last_seen ?? null,
  created_at: apiUser.createdAt ?? apiUser.created_at ?? '',
});

const mapUserProfileFromApi = (apiUser: any): UserProfile => ({
  ...mapUserFromApi(apiUser),
  email: apiUser.email,
  totalGames: apiUser.totalGames ?? apiUser.total_games ?? 0,
  wins: apiUser.wins ?? 0,
  losses: apiUser.losses ?? 0,
  draws: apiUser.draws ?? 0,
});

const mapFriendFromApi = (apiUser: any): Friend => ({
  id: apiUser.id,
  username: apiUser.username,
  email: apiUser.email ?? undefined,
  elo: apiUser.elo ?? 0,
  avatar_url: apiUser.avatarUrl ?? apiUser.avatar_url ?? null,
  is_online: apiUser.isOnline ?? apiUser.is_online ?? false,
  last_seen: apiUser.lastSeen ?? apiUser.last_seen ?? null,
  created_at: apiUser.createdAt ?? apiUser.created_at ?? '',
});

export const userService = {
  async getProfile(userId?: string): Promise<UserProfile> {
    const url = userId ? `/users/profile/${userId}` : '/users/profile';
    const response = await api.get<UserProfile>(url);
    return mapUserProfileFromApi(response.data);
  },

  async updateProfile(data: { username?: string; email?: string }): Promise<UserProfile> {
    await api.patch('/users/profile', data);
    return userService.getProfile();
  },

  async uploadAvatar(file: File): Promise<{ message: string; avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      message: response.data?.message ?? 'Avatar actualizado',
      avatar_url: response.data?.avatarUrl ?? response.data?.avatar_url ?? '',
    };
  },

  async searchUsers(query: string): Promise<Friend[]> {
    const response = await api.get<Friend[]>('/users/search', {
      params: { query },
    });
    return response.data.map(mapFriendFromApi);
  },
};
