import { Game } from '@/types/game';
import { Button } from '@/components/ui/Button';

export const GameList: React.FC<{
  games: Game[];
  onJoin: (id: string) => void;
}> = ({ games, onJoin }) => {
  if (games.length === 0) {
    return <p>No hay partidas disponibles.</p>;
  }

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <div key={game.id} className="flex justify-between items-center p-3 border rounded">
          <div>
            <p>
              Creador: {game.creatorUsername || 'Jugador'} • ELO: {game.creatorElo ?? 'N/A'}
            </p>
            <p className="text-sm">Partida #{game.id.slice(0, 8)}</p>
            <p className="text-sm">Control: {game.timeControl}</p>
          </div>
          <Button onClick={() => onJoin(game.id)}>Unirse</Button>
        </div>
      ))}
    </div>
  );
};
