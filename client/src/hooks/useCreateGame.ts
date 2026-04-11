import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '@/services/gameService';
import { pushToast } from '@/components/ui/ToastProvider';
import { getApiErrorMessage } from '@/utils/apiError';

export const useCreateGame = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createGame = async (mode: 'online' | 'ai') => {
    setIsLoading(true);
    try {
      const game = await gameService.createGame({
        timeControl: '10+0',
        mode,
      });

      navigate(`/game/${game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      pushToast(getApiErrorMessage(error, 'Error al crear la partida'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createOnline: () => createGame('online'),
    createAI: () => createGame('ai'),
  };
};