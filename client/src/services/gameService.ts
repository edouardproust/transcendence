import { api } from './api';
import { Game, CreateGameRequest } from '@/types/game';

const DEFAULT_INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
type ApiGameMode = 'ONLINE' | 'AI';

const normalizeGameMode = (mode: string | null | undefined): Game['mode'] =>
  String(mode || '').toLowerCase() === 'ai' ? 'ai' : 'online';

const serializeGameMode = (mode: CreateGameRequest['mode']): ApiGameMode =>
  mode === 'ai' ? 'AI' : 'ONLINE';

const normalizeGameStatus = (status: string | null | undefined): Game['status'] => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'ongoing') return 'active';
  if (normalized === 'finished') return 'finished';
  if (normalized === 'cancelled' || normalized === 'aborted') return 'cancelled';
  return 'waiting';
};

// Helper para convertir snake_case a camelCase
const mapGameFromAPI = (apiGame: any): Game => {
  return {
    id: apiGame.id,
    whitePlayerId: apiGame.whitePlayerId ?? apiGame.whiteId ?? apiGame.white_player_id,
    blackPlayerId: apiGame.blackPlayerId ?? apiGame.blackId ?? apiGame.black_player_id ?? null,
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

  async startGame(gameId: string): Promise<Game> {
    const response = await api.post(`/games/${gameId}/start`);
    return mapGameFromAPI(response.data);
  },
};
