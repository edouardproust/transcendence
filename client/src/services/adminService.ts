import { api } from './api';
import {
  AdminGame,
  AdminGameSortField,
  AdminStats,
  AdminUser,
  AdminUserSortField,
  SortOrder,
} from '@/types/admin';

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
          : normalizedStatus === 'CANCELLED' || normalizedStatus === 'ABORTED'
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

const getAdminStatsPayload = (payload: any) => payload?.data ?? payload ?? {};
const getAdminCollectionPayload = (payload: any) => payload?.data ?? payload ?? {};

const mapPaginationFromApi = (pagination: any) => ({
  total: pagination?.total ?? 0,
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  totalPages: pagination?.totalPages ?? pagination?.total_pages ?? 1,
});

const mapAdminStatsFromApi = (payload: any): AdminStats => {
  const normalizedPayload = getAdminStatsPayload(payload);
  const normalizedStats = normalizedPayload.stats ?? normalizedPayload;
  const normalizedTopPlayers = normalizedPayload.topPlayers ?? normalizedPayload.top_players ?? [];
  const normalizedRecentActivity =
    normalizedPayload.recentActivity ?? normalizedPayload.recent_activity ?? [];

  return {
    stats: {
      total_users:
        normalizedStats.totalUsers ?? normalizedStats.total_users ?? normalizedPayload.totalUsers ?? 0,
      total_games:
        normalizedStats.totalGames ?? normalizedStats.total_games ?? normalizedPayload.totalGames ?? 0,
      active_games:
        normalizedStats.activeGames ?? normalizedStats.active_games ?? normalizedPayload.activeGames ?? 0,
      finished_games:
        normalizedStats.finishedGames ??
        normalizedStats.finished_games ??
        normalizedPayload.finishedGames ??
        0,
      games_last_24h:
        normalizedStats.gamesLast24h ??
        normalizedStats.games_last_24h ??
        normalizedPayload.gamesLast24h ??
        0,
      new_users_week:
        normalizedStats.newUsersWeek ??
        normalizedStats.new_users_week ??
        normalizedPayload.newUsersWeek ??
        0,
    },
    topPlayers: normalizedTopPlayers.map((player: any) => ({
      id: player.id,
      username: player.username,
      email: player.email ?? '',
      elo: player.elo ?? 0,
      created_at: player.createdAt ?? player.created_at ?? '',
    })),
    recentActivity: normalizedRecentActivity.map((activity: any) => {
      const normalizedStatus = String(activity.status ?? '').toUpperCase();
      const normalizedMode = String(activity.mode ?? '').toUpperCase();

      return {
        id: activity.id,
        status:
          normalizedStatus === 'ONGOING'
            ? 'active'
            : normalizedStatus === 'FINISHED'
              ? 'finished'
              : normalizedStatus === 'CANCELLED' || normalizedStatus === 'ABORTED'
                ? 'cancelled'
                : 'waiting',
        mode: normalizedMode === 'AI' ? 'ai' : 'online',
        created_at: activity.createdAt ?? activity.created_at ?? '',
        white_username: activity.whiteUsername ?? activity.white_username ?? '',
        black_username: activity.blackUsername ?? activity.black_username ?? null,
        winner_username: activity.winnerUsername ?? activity.winner_username ?? null,
      };
    }),
  };
};

const mapStatusFilterToApi = (status: string): string => {
  if (status === 'active') return 'ONGOING';
  if (status === 'cancelled') return 'ABORTED';
  return status.toUpperCase();
};

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>('/admin/stats');
    return mapAdminStatsFromApi(response.data);
  },

  async getUsers(
    page: number = 1,
    search: string = '',
    sortBy: AdminUserSortField = 'createdAt',
    sortOrder: SortOrder = 'desc'
  ) {
    const normalizedSearch = search.trim();
    const response = await api.get('/admin/users', {
      params: {
        page,
        limit: 20,
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
        sortBy,
        sortOrder,
      },
    });
    const payload = getAdminCollectionPayload(response.data);

    return {
      ...payload,
      users: (payload.users ?? payload.data?.users ?? []).map(mapAdminUserFromApi),
      pagination: mapPaginationFromApi(payload.pagination),
    };
  },

  async updateUser(userId: string, data: { elo?: number; role?: 'USER' | 'ADMIN' }) {
    const response = await api.patch(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string) {
    await api.delete(`/admin/users/${userId}`);
  },

  async getGames(
    page: number = 1,
    status: string = '',
    sortBy: AdminGameSortField = 'createdAt',
    sortOrder: SortOrder = 'desc'
  ) {
    const normalizedStatus = status.trim();
    const response = await api.get('/admin/games', {
      params: {
        page,
        limit: 20,
        ...(normalizedStatus ? { status: mapStatusFilterToApi(normalizedStatus) } : {}),
        sortBy,
        sortOrder,
      },
    });
    const payload = getAdminCollectionPayload(response.data);

    return {
      ...payload,
      games: (payload.games ?? payload.data?.games ?? []).map(mapAdminGameFromApi),
      pagination: mapPaginationFromApi(payload.pagination),
    };
  },

  async deleteGame(gameId: string) {
    await api.delete(`/admin/games/${gameId}`);
  },
};
