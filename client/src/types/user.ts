export interface User {
  id: string;
  username: string;
  email: string;
  elo: number;
  role: 'USER' | 'ADMIN';
  avatar_url?: string | null;
  is_online?: boolean;
  last_seen?: string | null;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  elo: number;
  role?: 'USER' | 'ADMIN';
  avatar_url?: string | null;
  is_online?: boolean;
  last_seen?: string | null;
  created_at: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
}
