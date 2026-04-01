import { GameMode, GameStatus } from '@/types/game';

interface ExportGameTxtParams {
  profileName: string;
  mode: GameMode;
  status: GameStatus;
  playerColor: 'white' | 'black' | null;
  moves: string[];
}

export const exportGameTxt = (params: ExportGameTxtParams) => {
  const now = new Date();
  const timestamp = now.toISOString();
  const filenameTimestamp = timestamp.replace(/[:.]/g, '-');
  const totalMoves = params.moves.length;
  const lastMove = totalMoves > 0 ? params.moves[totalMoves - 1] : null;
  const colorText =
    params.playerColor === 'white'
      ? 'Blancas'
      : params.playerColor === 'black'
        ? 'Negras'
        : 'N/A';
  const statusText =
    params.status === 'waiting'
      ? 'Esperando'
      : params.status === 'active'
        ? 'En curso'
        : params.status === 'finished'
          ? 'Finalizada'
          : 'Cancelada';
  const modeText = params.mode === 'ai' ? 'Vs IA' : 'Online';

  const lines = [
    'Perfil',
    `Nombre: ${params.profileName}`,
    '',
    'Estadisticas de la partida',
    `Modo: ${modeText}`,
    `Estado: ${statusText}`,
    `Color: ${colorText}`,
    `Total de movimientos: ${totalMoves}`,
    `Ultimo movimiento: ${lastMove ?? 'N/A'}`,
    '',
    'Movimientos',
    params.moves.length ? params.moves.map((move, index) => `${index + 1}. ${move}`).join('\n') : '(sin movimientos)',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `partida-${filenameTimestamp}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
