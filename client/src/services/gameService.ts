import { api } from './api';
import { Game, CreateGameRequest, PlayerColor } from '@/types/game';
import { normalizeGameMode, normalizeGameStatus } from './mappers';

const DEFAULT_INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
type ApiGameMode = 'ONLINE' | 'AI';

interface FinishGameRequest {
  winnerId?: string | null;
  currentFen: string;
  pgn: string;
}

const serializeGameMode = (mode: CreateGameRequest['mode']): ApiGameMode =>
  mode === 'ai' ? 'AI' : 'ONLINE';

// Helper para convertir snake_case a camelCase
const mapGameFromAPI = (apiGame: any): Game => {
  return {
    id: apiGame.id,
    whitePlayerId: apiGame.whitePlayerId ?? apiGame.whiteId ?? apiGame.white_player_id,
    blackPlayerId: apiGame.blackPlayerId ?? apiGame.blackId ?? apiGame.black_player_id ?? null,
    creatorUsername:
      apiGame.creatorUsername ??
      apiGame.creator_username ??
      apiGame.white?.username ??
      null,
    creatorElo:
      apiGame.creatorElo ??
      apiGame.creator_elo ??
      apiGame.white?.elo ??
      null,
    currentFen: apiGame.currentFen ?? apiGame.current_fen ?? DEFAULT_INITIAL_FEN,
    pgn: apiGame.pgn || '',
    status: normalizeGameStatus(apiGame.status),
    winnerId: apiGame.winnerId ?? apiGame.winner_id ?? null,
    timeControl: apiGame.timeControl ?? apiGame.time_control ?? '10+0',
    mode: normalizeGameMode(apiGame.mode),
    createdAt: apiGame.createdAt ?? apiGame.created_at ?? '',
    updatedAt:
      apiGame.updatedAt ?? apiGame.updated_at ?? apiGame.createdAt ?? apiGame.created_at ?? '',
  };
};

export const gameService = {
  async createGame(data: CreateGameRequest): Promise<Game> {
    const response = await api.post('/games', {
      ...data,
      mode: serializeGameMode(data.mode),
    });
    return mapGameFromAPI(response.data);
  },

  async getGame(gameId: string): Promise<Game> {
    const response = await api.get(`/games/${gameId}`);
    return mapGameFromAPI(response.data);
  },

  async getActiveGames(): Promise<Game[]> {
    const response = await api.get('/games/active');
    return response.data.map(mapGameFromAPI);
  },

  async getUserGames(): Promise<Game[]> {
    const response = await api.get('/games/user');
    return response.data.map(mapGameFromAPI);
  },

  async startGame(gameId: string, data?: { playerColor?: PlayerColor }): Promise<Game> {
    const response = await api.post(`/games/${gameId}/start`, data ?? {});
    return mapGameFromAPI(response.data);
  },

  async finishGame(gameId: string, data: FinishGameRequest): Promise<Game> {
    const response = await api.post(`/games/${gameId}/finish`, data);
    return mapGameFromAPI(response.data);
  },
};
