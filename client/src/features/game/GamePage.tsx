import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gameService } from '@/services/gameService';
import { AIGamePage } from './AIGamePage';
import { OnlineGamePage } from './OnlineGamePage';

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

  if (gameMode === 'online') {
    return <OnlineGamePage gameId={gameId} />;
  }

  if (gameMode === 'ai') {

    return <AIGamePage gameId={gameId} />;
  }

  return null;
};
