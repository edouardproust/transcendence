import { Move } from './game';

export interface ServerToClientEvents {
  gameUpdate: (data: GameUpdateData) => void;
  gameEnd: (data: GameEndData) => void;
  error: (message: string) => void;
  playerJoined: (data: { playerId: string; color: 'white' | 'black' }) => void;
  playerDisconnected: (data: { playerId: string }) => void;
  playerReconnected: (data: { playerId: string }) => void;
  drawOffered: (data: { playerId: string }) => void;
  drawDeclined: (data: { playerId: string }) => void;
  drawAccepted: () => void;
  gameCancelled: () => void;
  chatMessage: (data: { userId: string; username: string; message: string; timestamp: string }) => void;
  userStatus: (data: { userId: string; is_online: boolean; last_seen: string }) => void;
}

export interface ClientToServerEvents {
  joinGame: (data: { gameId: string }) => void;
  makeMove: (data: { gameId: string; move: Move }) => void;
  resign: (gameId: string) => void;
  cancelGame: (gameId: string) => void;
  offerDraw: (gameId: string) => void;
  acceptDraw: (gameId: string) => void;
  declineDraw: (gameId: string) => void;
  chatMessage: (data: { gameId: string; message: string }) => void;
}

export interface GameUpdateData {
  fen: string;
  pgn: string;
  turn: 'w' | 'b';
  lastMove?: Move;
  timeLeft?: {
    white: number;
    black: number;
  };
}

export interface GameEndData {
  winnerId: string | null;
  reason: 'checkmate' | 'resignation' | 'timeout' | 'draw' | 'stalemate' | 'disconnect';
  finalFen: string;
}
