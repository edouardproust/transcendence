import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/features/auth/authStore';
import { useLobbyGames } from '@/hooks/useLobbyGames';
import { useCreateGame } from '@/hooks/useCreateGame';
import { GameList } from './Components/GameList';

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const { games } = useLobbyGames(user?.id);
  const { isLoading, createOnline, createAI } = useCreateGame();

  const handleJoinGame = (id: string) => {
    navigate(`/game/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Lobby</h1>
        <Button onClick={() => setShowModal(true)}>Nueva Partida</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded">
          <h2 className="text-2xl font-bold mb-4">Partidas Disponibles</h2>
          <GameList games={games} onJoin={handleJoinGame} />
        </div>

        <div className="p-6 border rounded space-y-4">
          <Button onClick={createOnline} disabled={isLoading}>
            Crear Partida Online
          </Button>

          <Button onClick={createAI} disabled={isLoading}>
            Jugar vs IA
          </Button>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Partida">
        <div className="space-y-4">
          <Button onClick={createOnline} disabled={isLoading} className="w-full">
            Online
          </Button>
          <Button onClick={createAI} disabled={isLoading} className="w-full">
            IA
          </Button>
        </div>
      </Modal>
    </div>
  );
};
