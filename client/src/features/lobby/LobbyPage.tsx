import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Lobby</h1>
        <Button onClick={() => setShowModal(true)}>
          Nueva Partida
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Partidas Disponibles</h2>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Modos de Juego</h2>
          <div className="space-y-3">
            <div className="p-4 border rounded">
              <h3 className="font-bold mb-2">🎮 Multijugador Online</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Crea una partida y espera a que otro jugador se una
              </p>
              <Button 
                disabled={isLoading}
              >
                {isLoading ? 'Creando...' : 'Crear Partida Online'}
              </Button>
            </div>
            <div className="p-4 border rounded">
              <h3 className="font-bold mb-2">🤖 Vs Computadora (IA)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Practica contra Stockfish (motor de ajedrez)
              </p>
              <Button 
                disabled={isLoading}
              >
                {isLoading ? 'Creando...' : 'Jugar vs IA'}
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded dark:bg-gray-800">
            <h3 className="font-bold text-blue-900 mb-2 ">💡 Cómo jugar online:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Crea una partida online</li>
              <li>2. Espera a que se una</li>
              <li>3. ¡A jugar!</li>
            </ol>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Partida"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-400">Selecciona el modo de juego:</p>
          
          <Button 
            disabled={isLoading} 
            className="w-full"
          >
            🎮 Partida Online
          </Button>
          
          <Button 
            disabled={isLoading} 
            className="w-full"
          >
            🤖 Vs Computadora (IA)
          </Button>

          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
};
