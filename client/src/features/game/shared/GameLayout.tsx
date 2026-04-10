import React from 'react';
import { Board } from '../Board';
import { GameClock } from '../GameClock';
import { MoveHistory } from '../MoveHistory';
import { Move } from '@/types/game';

interface GameLayoutProps {
  onMove: (move: Move) => boolean;
  children?: React.ReactNode; // Para banners adicionales
  gameFinished?: boolean;
  clockEnabled?: boolean;
  isThinking?: boolean;
  aiLevel?: number;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ 
  onMove, 
  children,
  gameFinished = false,
  clockEnabled = false,
  isThinking = false,
  aiLevel,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4">
      {children}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Board onMove={onMove} />
          {gameFinished && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 rounded text-center">
              <p className="text-lg font-bold text-green-800 dark:text-green-200">
                ✓ ¡Partida Finalizada!
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <GameClock enabled={clockEnabled} />
          {/* IA pensando */}
          {isThinking && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 rounded text-center">
              <p className="text-blue-800">
                🤔 La IA está pensando (Nivel {aiLevel})...
              </p>
            </div>
          )}
          <MoveHistory />
        </div>
      </div>
    </div>
  );
};
