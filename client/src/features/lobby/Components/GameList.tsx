import { Game } from '@/types/game';
import { Button } from '@/components/ui/Button';

export const GameList: React.FC<{
  games: Game[];
  onJoin: (id: string) => void;
}> = ({ games, onJoin }) => {
  if (games.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
        No hay partidas disponibles ahora mismo. Puedes crear una nueva y aparecerá aquí para otros jugadores.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <div
          key={game.id}
          className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Creador: {game.creatorUsername || 'Jugador'} • ELO: {game.creatorElo ?? 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Partida #{game.id.slice(0, 8)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control: {game.timeControl} • Esperando oponente...
            </p>
          </div>
          <Button onClick={() => onJoin(game.id)}>Unirse</Button>
        </div>
      ))}
    </div>
  );
};
