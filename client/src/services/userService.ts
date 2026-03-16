import { api } from './api';
import { UserProfile } from '@/types/user';

export const userService = {
  async getProfile(userId?: string): Promise<UserProfile> {
    const url = userId ? `/users/profile/${userId}` : '/users/profile';
    const response = await api.get<UserProfile>(url);
    return response.data;
  },

  async updateProfile(data: { username?: string; email?: string }): Promise<UserProfile> {
    const response = await api.put<UserProfile>('/users/profile', data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ message: string; avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

};
