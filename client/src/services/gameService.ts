import { api } from './api';
import { Game, CreateGameRequest } from '@/types/game';

// Helper para convertir snake_case a camelCase
const mapGameFromAPI = (apiGame: any): Game => {
  return {
    id: apiGame.id,
    whitePlayerId: apiGame.white_player_id,
    blackPlayerId: apiGame.black_player_id,
    currentFen: apiGame.current_fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    pgn: apiGame.pgn || '',
    status: apiGame.status,
    winnerId: apiGame.winner_id,
    timeControl: apiGame.time_control,
    mode: apiGame.mode,
    createdAt: apiGame.created_at,
    updatedAt: apiGame.updated_at,
  };
};

export const gameService = {
  async createGame(data: CreateGameRequest): Promise<Game> {
    const response = await api.post('/games', data);
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

  async finishGame(
    gameId: string,
    data: { winnerId?: string | null; currentFen?: string; pgn?: string }
  ): Promise<Game> {
    const response = await api.post(`/games/${gameId}/finish`, data);
    return mapGameFromAPI(response.data);
  },
};
