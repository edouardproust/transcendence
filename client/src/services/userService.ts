import { api } from './api';
import { UserProfile } from '@/types/user';

export const userService = {
  
  async getProfile(userId?: string): Promise<UserProfile> {
    const url = userId ? `/users/${userId}` : `/users/`;
    const response = await api.get<UserProfile>(url);
    return response.data;
  },

  async updateProfile(data: { username?: string; email?: string }): Promise<UserProfile> {
    const response = await api.patch<UserProfile>('/users/', data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ message: string; avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

};
