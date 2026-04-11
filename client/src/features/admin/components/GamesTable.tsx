import { AdminGame } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface GamesTableProps {
  games: AdminGame[];
  onDelete: (gameId: string) => void;
}

const getStatusBadge = (status: string, mode: string) => {
  const labels: Record<string, string> = {
    active: 'Jugando',
    finished: 'Finalizada',
    cancelled: 'Cancelada',
  };

  const tones: Record<string, 'warning' | 'success' | 'info' | 'danger'> = {
    waiting: 'warning',
    active: 'success',
    finished: 'info',
    cancelled: 'danger',
  };

  const label =
    status === 'waiting' && mode === 'ai'
      ? 'Pendiente inicio'
      : status === 'waiting'
        ? 'Abierta'
        : labels[status] || status;

  return <Badge tone={tones[status] || 'info'}>{label}</Badge>;
};

export const GamesTable: React.FC<GamesTableProps> = ({ games, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">ID</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">
                Jugadores
              </th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Modo</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Tiempo</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Estado</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Ganador</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Creada</th>
              <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {games.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-6 px-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No se encontraron partidas para este filtro.
                </td>
              </tr>
            )}
            {games.map((game) => (
              <tr
                key={game.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="py-3 px-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                  {game.id.slice(0, 8)}...
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm">
                    <div className="text-gray-900 dark:text-gray-100">
                      ♔ {game.white_username}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      ♚{' '}
                      {game.black_username ||
                        (game.mode === 'ai' ? 'ChessAI' : 'Esperando rival...')}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {game.mode === 'online' ? '👥 Online' : '🤖 IA'}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {game.time_control}
                </td>
                <td className="py-3 px-4">{getStatusBadge(game.status, game.mode)}</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                  {game.winner_username || '-'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                  {new Date(game.created_at).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <Button variant="danger" onClick={() => void onDelete(game.id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
