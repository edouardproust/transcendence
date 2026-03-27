import { api } from './api';
import { AdminGame, AdminStats, AdminUser } from '@/types/admin';

const mapAdminUserFromApi = (user: any): AdminUser => ({
  id: user.id,
  username: user.username,
  email: user.email ?? '',
  elo: user.elo ?? 0,
  role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
  created_at: user.createdAt ?? user.created_at ?? '',
  total_games: user.totalGames ?? user.total_games ?? 0,
});

const mapAdminGameFromApi = (game: any): AdminGame => {
  const normalizedStatus = String(game.status ?? '').toUpperCase();
  const normalizedMode = String(game.mode ?? '').toUpperCase();

  return {
    id: game.id,
    status:
      normalizedStatus === 'ONGOING'
        ? 'active'
        : normalizedStatus === 'FINISHED'
          ? 'finished'
          : normalizedStatus === 'CANCELLED'
            ? 'cancelled'
            : 'waiting',
    mode: normalizedMode === 'AI' ? 'ai' : 'online',
    time_control: game.timeControl ?? game.time_control ?? '',
    created_at: game.createdAt ?? game.created_at ?? '',
    updated_at: game.updatedAt ?? game.updated_at ?? '',
    white_username: game.whiteUsername ?? game.white_username ?? '',
    black_username: game.blackUsername ?? game.black_username ?? null,
    winner_username: game.winnerUsername ?? game.winner_username ?? null,
  };
};

const mapAdminStatsFromApi = (payload: any): AdminStats => ({
  stats: {
    total_users: payload.stats?.totalUsers ?? payload.stats?.total_users ?? 0,
    total_games: payload.stats?.totalGames ?? payload.stats?.total_games ?? 0,
    active_games: payload.stats?.activeGames ?? payload.stats?.active_games ?? 0,
    finished_games: payload.stats?.finishedGames ?? payload.stats?.finished_games ?? 0,
    games_last_24h: payload.stats?.gamesLast24h ?? payload.stats?.games_last_24h ?? 0,
    new_users_week: payload.stats?.newUsersWeek ?? payload.stats?.new_users_week ?? 0,
  },
  topPlayers: (payload.topPlayers ?? []).map((player: any) => ({
    id: player.id,
    username: player.username,
    email: player.email ?? '',
    elo: player.elo ?? 0,
    created_at: player.createdAt ?? player.created_at ?? '',
  })),
  recentActivity: (payload.recentActivity ?? []).map((activity: any) => {
    const normalizedStatus = String(activity.status ?? '').toUpperCase();
    const normalizedMode = String(activity.mode ?? '').toUpperCase();

    return {
      id: activity.id,
      status:
        normalizedStatus === 'ONGOING'
          ? 'active'
          : normalizedStatus === 'FINISHED'
            ? 'finished'
            : normalizedStatus === 'CANCELLED'
              ? 'cancelled'
              : 'waiting',
      mode: normalizedMode === 'AI' ? 'ai' : 'online',
      created_at: activity.createdAt ?? activity.created_at ?? '',
      white_username: activity.whiteUsername ?? activity.white_username ?? '',
      black_username: activity.blackUsername ?? activity.black_username ?? null,
      winner_username: activity.winnerUsername ?? activity.winner_username ?? null,
    };
  }),
});

const mapStatusFilterToApi = (status: string): string => {
  if (status === 'active') return 'ONGOING';
  return status.toUpperCase();
};

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>('/admin/stats');
    return mapAdminStatsFromApi(response.data);
  },

  async getUsers(page: number = 1, search: string = '') {
    const response = await api.get('/admin/users', {
      params: { page, limit: 20, search },
    });
    return {
      ...response.data,
      users: (response.data.users ?? []).map(mapAdminUserFromApi),
    };
  },

  async updateUser(userId: string, data: { elo?: number; role?: 'USER' | 'ADMIN' }) {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string) {
    await api.delete(`/admin/users/${userId}`);
  },

  async getGames(page: number = 1, status: string = '') {
    const response = await api.get('/admin/games', {
      params: {
        page,
        limit: 20,
        status: status ? mapStatusFilterToApi(status) : '',
      },
    });
    return {
      ...response.data,
      games: (response.data.games ?? []).map(mapAdminGameFromApi),
    };
  },

  async deleteGame(gameId: string) {
    await api.delete(`/admin/games/${gameId}`);
  },
};
