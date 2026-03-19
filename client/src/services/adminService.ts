import { api } from './api';
import { AdminStats } from '@/types/admin'

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>('/admin/stats');
    return response.data;
  },

  async getUsers(page: number = 1, search: string = '') {
    const response = await api.get('/admin/users', {
      params: { page, limit: 20, search },
    });
    return response.data;
  },

  async updateUser(userId: string, data: { elo?: number; role?: 'user' | 'admin' }) {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string) {
    await api.delete(`/admin/users/${userId}`);
  },

  async getGames(page: number = 1, status: string = '') {
    const response = await api.get('/admin/games', {
      params: { page, limit: 20, status },
    });
    return response.data;
  },

  async deleteGame(gameId: string) {
    await api.delete(`/admin/games/${gameId}`);
  },
};