export interface AdminStats {
  stats: {
    total_users: number;
    total_games: number;
    active_games: number;
    finished_games: number;
    games_last_24h: number;
    new_users_week: number;
  };
  topPlayers: Array<{
    id: string;
    username: string;
    email: string;
    elo: number;
    created_at: string;
  }>;
  recentActivity: Array<{
    id: string;
    status: string;
    mode: string;
    created_at: string;
    white_username: string;
    black_username: string | null;
    winner_username: string | null;
  }>;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  elo: number;
  role: 'USER' | 'ADMIN';
  created_at: string;
  total_games: number;
}

export interface AdminGame {
  id: string;
  status: string;
  mode: string;
  time_control: string;
  created_at: string;
  updated_at: string;
  white_username: string;
  black_username: string | null;
  winner_username: string | null;
}
