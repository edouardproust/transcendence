import { useEffect, useRef, useState } from 'react';
import { gameService } from '@/services/gameService';
import { Game } from '@/types/game';

export const useLobbyGames = (userId?: string) => {
  const [games, setGames] = useState<Game[]>([]);
  const requestVersionRef = useRef(0);
  const isMountedRef = useRef(true);

  const loadActiveGames = async () => {
    const requestVersion = ++requestVersionRef.current;

    try {
      const activeGames = await gameService.getActiveGames();

      if (!isMountedRef.current || requestVersion !== requestVersionRef.current) return;

      const availableGames = activeGames.filter(
        (game) =>
          game.whitePlayerId !== userId &&
          game.status === 'waiting' &&
          game.blackPlayerId === null
      );

      setGames(availableGames);
    } catch (error) {
      if (!isMountedRef.current || requestVersion !== requestVersionRef.current) return;
      console.error('Error loading games:', error);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    void loadActiveGames();

    const interval = window.setInterval(loadActiveGames, 2000);

    const handleWindowFocus = () => loadActiveGames();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadActiveGames();
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);

  return { games, reload: loadActiveGames };
};