import { api } from './api';
import { AuthResponse, User } from '@/types/user';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { 
      email, 
      password 
    });
    return response.data;
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', { 
      username, 
      email, 
      password 
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
