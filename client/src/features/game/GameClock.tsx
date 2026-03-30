import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from './gameStore';

interface GameClockProps {
  enabled?: boolean;
}

interface ClockMs {
  white: number;
  black: number;
}

const toMs = (seconds: number): number => Math.max(0, seconds) * 1000;
const toDisplaySeconds = (milliseconds: number): number => {
  if (milliseconds <= 0) return 0;
  return Math.ceil(milliseconds / 1000);
};

export const GameClock: React.FC<GameClockProps> = ({ enabled = true }) => {
  const { gameId, turn, status } = useGameStore();
  const endGame = useGameStore((state) => state.endGame);
  const timeLeftStore = useGameStore((state) => state.timeLeft);

  const [displayMs, setDisplayMs] = useState<ClockMs>({
    white: toMs(timeLeftStore.white),
    black: toMs(timeLeftStore.black),
  });

  const lastUpdateRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutTriggeredRef = useRef(false);

  // Reiniciar reloj al cambiar de partida
  useEffect(() => {
    setDisplayMs({
      white: toMs(timeLeftStore.white),
      black: toMs(timeLeftStore.black),
    });
    timeoutTriggeredRef.current = false;
    lastUpdateRef.current = Date.now();
  }, [gameId, timeLeftStore.white, timeLeftStore.black]);

  // Contador de tiempo en milisegundos para no perder jugadas rapidas
  useEffect(() => {
    if (!enabled || status !== 'active') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Limpiar intervalo anterior si existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    lastUpdateRef.current = Date.now();
    timeoutTriggeredRef.current = false;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      setDisplayMs((prev) => {
        const sideToDecrement: 'white' | 'black' = turn === 'w' ? 'white' : 'black';
        const current = prev[sideToDecrement];
        if (current <= 0) return prev;

        const next = Math.max(0, current - elapsedMs);
        if (next === current) return prev;

        if (next === 0 && !timeoutTriggeredRef.current) {
          timeoutTriggeredRef.current = true;
          window.setTimeout(() => {
            endGame();
          }, 0);
        }

        return {
          ...prev,
          [sideToDecrement]: next,
        };
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, turn, status, endGame]);

  const formatTime = (seconds: number): string => {
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

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="font-bold mb-3 text-lg text-gray-900 dark:text-gray-100">
        ⏱️ Tiempo
      </h3>

      {/* Reloj de blancas */}
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
            displayMs.white <= 30000 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {formatTime(toDisplaySeconds(displayMs.white))}
          </span>
        </div>
      </div>

      {/* Reloj de negras */}
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
            displayMs.black <= 30000 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-gray-100'
          }`}>
            {formatTime(toDisplaySeconds(displayMs.black))}
          </span>
        </div>
      </div>

      {/* Estado */}
      <div className="mt-3 text-sm text-center text-gray-600 dark:text-gray-400">
        {status === 'waiting' && '⏳ Esperando inicio...'}
        {status === 'active' && `Turno: ${turn === 'w' ? 'Blancas' : 'Negras'}`}
        {status === 'finished' && '✓ Partida finalizada'}
      </div>
    </div>
  );
};
