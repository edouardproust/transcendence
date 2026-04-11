import { useState, useEffect, useCallback } from 'react';
import { gameService } from '@/services/gameService';
import { Game } from '@/types/game';
import { pushToast } from '@/components/ui/ToastProvider';

export const useMatchHistory = () => {
  const [matchHistory, setMatchHistory] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMatchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const games = await gameService.getUserGames();
      setMatchHistory(games.filter((game) => game.status === 'finished').slice(0, 10));
    } catch (error) {
      console.error('Error loading match history:', error);
      pushToast('Error cargando historial de partidas', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMatchHistory();
  }, [loadMatchHistory]);

  return {
    matchHistory,
    isLoading,
    loadMatchHistory,
  };
};
