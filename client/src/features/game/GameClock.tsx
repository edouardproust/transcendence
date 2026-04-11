import React from 'react';
import { useGameStore } from './gameStore';

interface GameClockProps {
  enabled?: boolean;
}

export const GameClock: React.FC<GameClockProps> = ({ enabled = true }) => {
  const { turn, status } = useGameStore();
  const timeLeft = useGameStore((state) => state.timeLeft);

  const formatTime = (seconds: number): string => {
    if (seconds === null || seconds === undefined) {
      return '--:--';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!enabled) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <h3 className="font-bold mb-3 text-lg text-gray-900 dark:text-gray-100">
          ⏱️ Tiempo
        </h3>
        <div className="p-3 rounded bg-gray-100 dark:bg-gray-700 text-center text-gray-800 dark:text-gray-100">
          ♾️ Modo sin tiempo
        </div>
      </div>
    );
  }

  const whiteTime = timeLeft?.white ?? 0;
  const blackTime = timeLeft?.black ?? 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="font-bold mb-3 text-lg text-gray-900 dark:text-gray-100">
        ⏱️ Tiempo
      </h3>

      <div className={`p-3 rounded mb-2 ${
        turn === 'w' && status === 'active'
          ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400'
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ♔ Blancas
          </span>
          <span className={`text-xl font-mono ${
            whiteTime <= 30 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {formatTime(whiteTime)}
          </span>
        </div>
      </div>

      <div className={`p-3 rounded ${
        turn === 'b' && status === 'active'
          ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400'
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ♚ Negras
          </span>
          <span className={`text-xl font-mono ${
            blackTime <= 30 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {formatTime(blackTime)}
          </span>
        </div>
      </div>

      <div className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">
        {status === 'waiting' && '⏳ Esperando inicio...'}
        {status === 'active' && `Turno: ${turn === 'w' ? 'Blancas' : 'Negras'}`}
        {status === 'finished' && '✓ Partida finalizada'}
      </div>
    </div>
  );
};