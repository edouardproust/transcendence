import { AdminGame, AdminStats, AdminUser } from '@/types/admin';
import { Friend, FriendRequest } from '@/types/friends';
import { Game } from '@/types/game';
import { AuthResponse, User, UserProfile } from '@/types/user';

export const normalizeGameMode = (mode: string | null | undefined): Game['mode'] =>
  String(mode || '').toLowerCase() === 'ai' ? 'ai' : 'online';

export const normalizeGameStatus = (status: string | null | undefined): Game['status'] => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'ongoing' || normalized === 'active') return 'active';
  if (normalized === 'finished') return 'finished';
  if (normalized === 'cancelled' || normalized === 'aborted') return 'cancelled';
  return 'waiting';
};

export const mapUserFromApi = (apiUser: any): User => ({
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

export const mapAuthResponseFromApi = (payload: any): AuthResponse => ({
  token: payload.token,
  user: mapUserFromApi(payload.user),
});

export const mapUserProfileFromApi = (apiUser: any): UserProfile => ({
  ...mapUserFromApi(apiUser),
  email: apiUser.email,
  totalGames: apiUser.totalGames ?? apiUser.total_games ?? 0,
  wins: apiUser.wins ?? 0,
  losses: apiUser.losses ?? 0,
  draws: apiUser.draws ?? 0,
});

export const mapFriendFromApi = (apiUser: any): Friend => ({
  id: apiUser.id,
  username: apiUser.username,
  email: apiUser.email ?? undefined,
  elo: apiUser.elo ?? 0,
  avatar_url: apiUser.avatarUrl ?? apiUser.avatar_url ?? null,
  is_online: apiUser.isOnline ?? apiUser.is_online ?? false,
  last_seen: apiUser.lastSeen ?? apiUser.last_seen ?? null,
  created_at: apiUser.createdAt ?? apiUser.created_at ?? '',
});

export const mapFriendRequestFromApi = (request: any): FriendRequest => ({
  id: request.id,
  sender_id: request.senderId ?? request.sender_id ?? '',
  username: request.username ?? request.senderUsername ?? '',
  elo: request.elo ?? request.senderElo ?? 0,
  avatar_url: request.avatarUrl ?? request.avatar_url ?? null,
  is_online: request.isOnline ?? request.is_online ?? false,
  last_seen: request.lastSeen ?? request.last_seen ?? null,
  created_at: request.createdAt ?? request.created_at ?? '',
});

export const mapAdminUserFromApi = (user: any): AdminUser => ({
  id: user.id,
  username: user.username,
  email: user.email ?? '',
  elo: user.elo ?? 0,
  role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
  created_at: user.createdAt ?? user.created_at ?? '',
  total_games: user.totalGames ?? user.total_games ?? 0,
});

export const mapAdminGameFromApi = (game: any): AdminGame => ({
  id: game.id,
  status: normalizeGameStatus(game.status),
  mode: normalizeGameMode(game.mode),
  time_control: game.timeControl ?? game.time_control ?? '',
  created_at: game.createdAt ?? game.created_at ?? '',
  updated_at: game.updatedAt ?? game.updated_at ?? '',
  white_username: game.whiteUsername ?? game.white_username ?? '',
  black_username: game.blackUsername ?? game.black_username ?? null,
  winner_username: game.winnerUsername ?? game.winner_username ?? null,
});

export const getAdminStatsPayload = (payload: any) => payload?.data ?? payload ?? {};

export const getAdminCollectionPayload = (payload: any) => payload?.data ?? payload ?? {};

export const mapPaginationFromApi = (pagination: any) => ({
  total: pagination?.total ?? 0,
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  totalPages: pagination?.totalPages ?? pagination?.total_pages ?? 1,
});

export const mapAdminStatsFromApi = (payload: any): AdminStats => {
  const normalizedPayload = getAdminStatsPayload(payload);
  const normalizedStats = normalizedPayload.stats ?? normalizedPayload;
  const normalizedTopPlayers = normalizedPayload.topPlayers ?? normalizedPayload.top_players ?? [];
  const normalizedRecentActivity =
    normalizedPayload.recentActivity ?? normalizedPayload.recent_activity ?? [];

  return {
    stats: {
      total_users:
        normalizedStats.totalUsers ??
        normalizedStats.total_users ??
        normalizedPayload.totalUsers ??
        0,
      total_games:
        normalizedStats.totalGames ??
        normalizedStats.total_games ??
        normalizedPayload.totalGames ??
        0,
      active_games:
        normalizedStats.activeGames ??
        normalizedStats.active_games ??
        normalizedPayload.activeGames ??
        0,
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
    recentActivity: normalizedRecentActivity.map((activity: any) => ({
      id: activity.id,
      status: normalizeGameStatus(activity.status),
      mode: normalizeGameMode(activity.mode),
      created_at: activity.createdAt ?? activity.created_at ?? '',
      white_username: activity.whiteUsername ?? activity.white_username ?? '',
      black_username: activity.blackUsername ?? activity.black_username ?? null,
      winner_username: activity.winnerUsername ?? activity.winner_username ?? null,
    })),
  };
};

export const mapStatusFilterToApi = (status: string): string => {
  if (status === 'active') return 'ONGOING';
  if (status === 'cancelled') return 'ABORTED';
  return status.toUpperCase();
};
