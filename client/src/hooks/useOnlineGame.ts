import { useEffect, useState } from 'react';
import { gameService } from '@/services/gameService';
import { pushToast } from '@/components/ui/ToastProvider';
import { getApiErrorMessage } from '@/utils/apiError';
import { useGameStore } from '@/features/game/gameStore';

export const useOnlineGame = (gameId: string, userId?: string) => {
  const { initGame } = useGameStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasOpponent, setHasOpponent] = useState(false);

  useEffect(() => {
    const loadGame = async () => {
      try {
        const game = await gameService.getGame(gameId);

        const color = game.whitePlayerId === userId ? 'white' : 'black';

        if (game.blackPlayerId) setHasOpponent(true);

        initGame(gameId, 'online', color, game.currentFen, game.pgn, game.status);
        setIsLoading(false);
      } catch (error) {
        pushToast(getApiErrorMessage(error, 'Error al cargar la partida'), 'error');
      }
    };

    loadGame();
  }, [gameId, userId]);

  return { isLoading, hasOpponent, setHasOpponent };
};
