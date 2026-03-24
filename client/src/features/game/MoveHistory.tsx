import React from 'react';
import { useGameStore } from './gameStore';

export const MoveHistory: React.FC = () => {
  const { moves } = useGameStore();

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
     <h3 className="font-bold mb-3 text-lg text-gray-900 dark:text-gray-100">Historial de Movimientos</h3>
      {moves.length === 0 ? (
        <p className="text-gray-500 text-sm">No hay movimientos aún</p>
      ) : (
        <div className="space-y-1">
          {moves.map((move, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 w-8">{Math.floor(index / 2) + 1}.</span>
              <span className={index % 2 === 0 ? 'font-medium' : ''}>
                {move}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
