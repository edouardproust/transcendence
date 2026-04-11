import { api } from './api';
import { AuthResponse, User } from '@/types/user';
import { mapAuthResponseFromApi, mapUserFromApi } from './mappers';

export const authService = {
  async login(emailOrUsername: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', { 
      emailOrUsername, 
      password 
    });
    return mapAuthResponseFromApi(response.data);
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', { 
      username, 
      email, 
      password 
    });
    return mapAuthResponseFromApi(response.data);
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return mapUserFromApi(response.data);
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
