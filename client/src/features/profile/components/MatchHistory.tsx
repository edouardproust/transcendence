import { Badge } from '@/components/ui/Badge';
import { Game } from '@/types/game';

interface MatchHistoryProps {
  games: Game[];
  currentUserId?: string;
  isLoading: boolean;
}

const getPgnResultToken = (pgn: string) => {
  const tokens = pgn.trim().split(/\s+/);
  const lastToken = tokens[tokens.length - 1];
  return lastToken === '1-0' || lastToken === '0-1' || lastToken === '1/2-1/2'
    ? lastToken
    : null;
};

const getMatchResult = (game: Game, userId?: string) => {
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

const getMatchResultTone = (result: string) => {
  if (result === 'Victoria') return 'success';
  if (result === 'Derrota') return 'danger';
  if (result === 'Empate') return 'info';
  if (result === 'Cancelada') return 'warning';
  return 'neutral';
};

const getOpponentLabel = (game: Game) => {
  if (game.mode === 'ai') return 'ChessAI';
  return 'Jugador';
};

const getPlayerColorLabel = (game: Game, userId?: string) => {
  if (game.whitePlayerId === userId) return 'Blancas';
  if (game.blackPlayerId === userId) return 'Negras';
  return '-';
};

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  games,
  currentUserId,
  isLoading,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">📜 Historial de Partidas</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Ultimas {games.length} partidas finalizadas
        </span>
      </div>

      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400">Cargando historial...</p>
      ) : games.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          Aun no hay partidas finalizadas para mostrar.
        </p>
      ) : (
        <div className="space-y-3">
          {games.map((game) => {
            const matchResult = getMatchResult(game, currentUserId);

            return (
              <div
                key={game.id}
                className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      vs {getOpponentLabel(game)}
                    </span>
                    <Badge tone={getMatchResultTone(matchResult)}>{matchResult}</Badge>
                    <Badge tone={game.mode === 'ai' ? 'warning' : 'info'}>
                      {game.mode === 'ai' ? 'IA' : 'Online'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {getPlayerColorLabel(game, currentUserId)} • {game.timeControl} •{' '}
                    {new Date(game.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {game.id.slice(0, 8)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
