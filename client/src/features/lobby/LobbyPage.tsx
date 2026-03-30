import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameService } from '@/services/gameService';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/features/auth/authStore';
import { Game } from '@/types/game';

export const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    loadActiveGames();
    
    // Recargar cada 5 segundos
    const interval = setInterval(loadActiveGames, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveGames = async () => {
    try {
      const activeGames = await gameService.getActiveGames();
      
      // Filtrar solo las partidas que:
      // 1. No son mías
      // 2. Están esperando
      // 3. No tienen jugador negro
      const availableGames = activeGames.filter(
        game => game.whitePlayerId !== user?.id && 
                game.status === 'waiting' && 
                game.blackPlayerId === null
      );
      
      setGames(availableGames);
      } catch (error) {
        console.error('Error loading games:', error);
      }
  };

  const handleCreateOnlineGame = async () => {
    setIsLoading(true);
    try {
      console.log('Creating online game...');
      const game = await gameService.createGame({
        timeControl: '10+0',
        mode: 'online',
      });
      console.log('Game created:', game);
      navigate(`/game/${game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error al crear la partida');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAIGame = async () => {
    setIsLoading(true);
    try {
      const game = await gameService.createGame({
        timeControl: '10+0',
        mode: 'ai',
      });
      navigate(`/game/${game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error al crear la partida');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  return (
  //   <div className="max-w-6xl mx-auto">
  //     <div className="flex justify-between items-center mb-8">
  //       <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Lobby</h1>
  //       <Button onClick={() => setShowModal(true)}>
  //         Nueva Partida
  //       </Button>
  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
  //         <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Partidas Disponibles</h2>
  //       </div>

  //       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
  //         <h2 className="text-2xl font-bold mb-4">Modos de Juego</h2>
  //         <div className="space-y-3">
  //           <div className="p-4 border rounded">
  //             <h3 className="font-bold mb-2">🎮 Multijugador Online</h3>
  //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
  //               Crea una partida y espera a que otro jugador se una
  //             </p>
  //             <Button 
  //               disabled
  //             >
  //               Proximamente
  //             </Button>
  //           </div>
  //           <div className="p-4 border rounded">
  //             <h3 className="font-bold mb-2">🤖 Vs Computadora (IA)</h3>
  //             <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
  //               Practica contra Stockfish (motor de ajedrez)
  //             </p>
  //             <Button 
  //               onClick={handleCreateAIGame}
  //               disabled={isLoading}
  //             >
  //               {isLoading ? 'Creando...' : 'Jugar vs IA'}
  //             </Button>
  //           </div>
  //         </div>
          
  //         <div className="mt-6 p-4 bg-blue-50 rounded dark:bg-gray-800">
  //           <h3 className="font-bold text-blue-900 mb-2 ">💡 Cómo jugar online:</h3>
  //           <ol className="text-sm text-blue-800 space-y-1">
  //             <li>1. Crea una partida online</li>
  //             {/* <li>2. Comparte el link con tu oponente</li> */}
  //             <li>2. Espera a que se una</li>
  //             <li>3. ¡A jugar!</li>
  //           </ol>
  //         </div>
  //       </div>
  //     </div>

  //     <Modal
  //       isOpen={showModal}
  //       onClose={() => setShowModal(false)}
  //       title="Nueva Partida"
  //     >
  //       <div className="space-y-4">
  //         <p className="text-gray-700 dark:text-gray-400">Selecciona el modo de juego:</p>
          
  //         <Button 
  //           onClick={handleCreateOnlineGame}
  //           disabled
  //           className="w-full"
  //         >
  //           🎮 Partida Online (Pronto)
  //         </Button>
          
  //         <Button 
  //           onClick={handleCreateAIGame} 
  //           disabled={isLoading} 
  //           className="w-full"
  //         >
  //           🤖 Vs Computadora (IA)
  //         </Button>

  //         <Button 
  //           variant="secondary" 
  //           onClick={() => setShowModal(false)}
  //           className="w-full"
  //         >
  //           Cancelar
  //         </Button>
  //       </div>
  //     </Modal>
  //   </div>
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
          {games.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No hay partidas disponibles. ¡Crea una nueva para que otros jugadores se unan!
            </p>
          ) : (
            <div className="space-y-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">Partida #{game.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Control: {game.timeControl} • Esperando oponente...
                    </p>
                  </div>
                  <Button onClick={() => handleJoinGame(game.id)}>
                    Unirse
                  </Button>
                </div>
              ))}
            </div>
          )}
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
                onClick={handleCreateOnlineGame}
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
                onClick={handleCreateAIGame}
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
              {/* <li>2. Comparte el link con tu oponente</li> */}
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
            onClick={handleCreateOnlineGame} 
            disabled={isLoading} 
            className="w-full"
          >
            🎮 Partida Online
          </Button>
          
          <Button 
            onClick={handleCreateAIGame} 
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
