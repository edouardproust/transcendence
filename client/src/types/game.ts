export type GameStatus = 'waiting' | 'active' | 'finished' | 'cancelled';
export type GameMode = 'online' | 'ai';
export type PlayerColor = 'white' | 'black';
export type BoardViewMode = '2d' | '3d';
export type Board2DTheme = 'classic' | 'wood' | 'ocean' | 'slate';
export type Board3DTheme = 'wood' | 'obsidian';

export interface Game {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string | null;
  creatorUsername?: string | null;
  creatorElo?: number | null;
  currentFen: string;
  pgn: string;
  status: GameStatus;
  winnerId: string | null;
  timeControl: string;
  mode: GameMode;
  createdAt: string;
  updatedAt: string;
}

export interface GameState {
  gameId: string | null;
  fen: string;
  pgn: string;
  moves: string[];
  lastMove: Move | null;
  turn: 'w' | 'b';
  status: GameStatus;
  isConnected: boolean;
  mode: GameMode;
  playerColor: PlayerColor | null;
  boardView: BoardViewMode;
  board2DTheme: Board2DTheme;
  board3DTheme: Board3DTheme;
  timeLeft: {
    white: number;
    black: number;
  } | null;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface CreateGameRequest {
  timeControl: string;
  mode: GameMode;
}
