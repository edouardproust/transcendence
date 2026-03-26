import { api } from './api';
import { AuthResponse, User } from '@/types/user';

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

const mapAuthResponseFromApi = (payload: any): AuthResponse => ({
  token: payload.token,
  user: mapUserFromApi(payload.user),
});

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
