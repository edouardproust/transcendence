import { api } from './api';
import { UserProfile } from '@/types/user';

export const userService = {
  async getProfile(userId?: string): Promise<UserProfile> {
    const url = userId ? `/users/${userId}` : `/users/${getUserIdFromToken()}`;
    const response = await api.get<UserProfile>(url);
    return response.data;
  },

  async updateProfile(data: { username?: string; email?: string }): Promise<UserProfile> {
    const userId = getUserIdFromToken();
    const response = await api.patch<UserProfile>(`/users/${userId}`, data);
    return response.data;
  },

  async uploadAvatar(file: File): Promise<{ message: string; avatar_url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    const userId = getUserIdFromToken();

    const response = await api.patch(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
};

function getUserIdFromToken(): string {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('No user data found');
  }
  const user = JSON.parse(userStr);
  return user.id;
}
