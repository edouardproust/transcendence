import { Game } from '@/types/game';

export const getMatchResult = (game: Game, userId?: string): string => {
  if (game.status === 'cancelled') return 'Cancelada';
  if (game.status !== 'finished') return 'En curso';
  if (game.winnerId === userId) return 'Victoria';

  const pgnResult = getPgnResultToken(game.pgn);
  if (pgnResult === '1/2-1/2') return 'Empate';
  if (pgnResult === '1-0')
    return game.whitePlayerId === userId ? 'Victoria' : 'Derrota';
  if (pgnResult === '0-1')
    return game.blackPlayerId === userId ? 'Victoria' : 'Derrota';
  if (game.winnerId) return 'Derrota';

  return 'Empate';
};

export const getPgnResultToken = (pgn: string): string | null => {
  const tokens = pgn.trim().split(/\s+/);
  const lastToken = tokens[tokens.length - 1];
  return lastToken === '1-0' || lastToken === '0-1' || lastToken === '1/2-1/2'
    ? lastToken
    : null;
};

export const getMatchResultTone = (result: string): string => {
  if (result === 'Victoria') return 'success';
  if (result === 'Derrota') return 'danger';
  if (result === 'Empate') return 'info';
  if (result === 'Cancelada') return 'warning';
  return 'neutral';
};

export const getOpponentLabel = (game: Game): string => {
  if (game.mode === 'ai') return 'ChessAI';
  return 'Jugador';
};

export const getPlayerColorLabel = (game: Game, userId?: string): string => {
  if (game.whitePlayerId === userId) return 'Blancas';
  if (game.blackPlayerId === userId) return 'Negras';
  return '-';
};

export const calculateWinRate = (wins: number, totalGames: number): string => {
  if (totalGames === 0) return '0';
  return ((wins / totalGames) * 100).toFixed(1);
};
