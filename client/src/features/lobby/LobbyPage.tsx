import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
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

  const gameModeCards = [
    {
      key: 'online',
      icon: '🎮',
      title: 'Multijugador Online',
      description: 'Crea una sala pública y espera a que otro jugador se una.',
      helper: 'Ideal para partidas rápidas con emparejamiento manual desde el lobby.',
      buttonLabel: isLoading ? 'Creando...' : 'Crear Partida Online',
      onClick: createOnline,
    },
    {
      key: 'ai',
      icon: '🤖',
      title: 'Vs Computadora (IA)',
      description: 'Practica contra Stockfish con dificultad, color y tablero personalizables.',
      helper: 'Tus preferencias se conservan entre partidas para empezar más rápido.',
      buttonLabel: isLoading ? 'Creando...' : 'Jugar vs IA',
      onClick: createAI,
    },
  ];

  const quickTips = [
    '1. Crea una partida online.',
    '2. Espera a que aparezca otro jugador.',
    '3. Cuando se una, la partida comienza automáticamente.',
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Lobby</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Elige cómo quieres jugar o únete a una partida disponible.
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>➕ Nueva Partida</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Partidas Disponibles"
            subtitle="Salas abiertas esperando a un rival."
          />
          <CardBody>
            <GameList games={games} onJoin={handleJoinGame} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Modos de Juego"
            subtitle="Accesos rápidos para empezar una partida nueva."
          />
          <CardBody className="space-y-4">
            {gameModeCards.map((mode) => (
              <div
                key={mode.key}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm dark:bg-gray-800">
                    {mode.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {mode.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {mode.description}
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {mode.helper}
                    </p>
                  </div>
                </div>
                <Button onClick={mode.onClick} disabled={isLoading} className="mt-4 w-full">
                  {mode.buttonLabel}
                </Button>
              </div>
            ))}

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
              <h3 className="font-bold text-blue-900 dark:text-blue-200">
                💡 Cómo jugar online
              </h3>
              <div className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                {quickTips.map((tip) => (
                  <p key={tip}>{tip}</p>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Partida">
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Selecciona el modo de juego. Cada opción mantiene el mismo flujo actual, pero con una
            presentación más clara.
          </p>

          <div className="grid gap-3">
            {gameModeCards.map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={mode.onClick}
                disabled={isLoading}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-blue-700 dark:hover:bg-gray-800"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{mode.icon}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {mode.title}
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button variant="secondary" onClick={() => setShowModal(false)} className="w-full">
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
};
