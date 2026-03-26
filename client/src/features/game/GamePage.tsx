import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameService } from '@/services/gameService';
import { AIGamePage } from './AIGamePage';
import { Button } from '@/components/ui/Button';

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<'online' | 'ai' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!gameId) {
      navigate('/lobby');
      return;
    }

    const loadGameMode = async () => {
      try {
        const game = await gameService.getGame(gameId);
        setGameMode(game.mode);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading game:', error);
        alert('Error al cargar la partida');
        navigate('/lobby');
      }
    };

    loadGameMode();
  }, [gameId, navigate]);

  if (isLoading) {

    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando partida...</div>
      </div>
    );
  }

  if (!gameId) {

    return null;
  }

  if (gameMode === 'ai') {

    return <AIGamePage gameId={gameId} />;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Partida no disponible
        </h1>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          El modo online todavía no está conectado en esta rama. La parte lista para usar es la
          partida contra IA.
        </p>
        <Button onClick={() => navigate('/lobby')}>Volver al lobby</Button>
      </div>
    </div>
  );
};
