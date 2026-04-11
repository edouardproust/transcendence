import { api } from './api';
import { Friend } from '@/types/friends';
import { UserProfile } from '@/types/user';
import { mapFriendFromApi, mapUserProfileFromApi } from './mappers';

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
