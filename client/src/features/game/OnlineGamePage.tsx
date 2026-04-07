import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from './gameStore';
import { useGameSocket } from '@/hooks/useGameSocket';
import { getSocket } from '@/engine/socket';
import { gameService } from '@/services/gameService';
import { useAuthStore } from '@/features/auth/authStore';
import { Move } from '@/types/game';
import { GameLayout } from './shared/GameLayout';
import { GameHeader } from './shared/GameHeader';
import { Button } from '@/components/ui/Button';
import { exportGameTxt } from './utils/exportGameTxt';

interface OnlineGamePageProps {
  gameId: string;
}

export const OnlineGamePage: React.FC<OnlineGamePageProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    initGame, 
    makeMove, 
    mode,
    playerColor,
    boardView,
    board2DTheme,
    board3DTheme,
    setBoardView,
    cycleBoard2DTheme,
    cycleBoard3DTheme,
    moves,
    status, 
    endGame,
    reset 
  } = useGameStore();

  const [isLoading, setIsLoading] = useState(true);
  const [hasOpponent, setHasOpponent] = useState(false);
  const [drawOffered, setDrawOffered] = useState(false);
  const [drawOfferFrom, setDrawOfferFrom] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<
    Array<{ userId: string; username: string; message: string; timestamp: string }>
  >([]);
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Conectar socket
  useGameSocket(gameId);

  // Listener para detectar cuando se une un oponente
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handlePlayerJoined = () => {
      console.log('[OnlineGame] Opponent joined!');
      setHasOpponent(true);
    };

    const handleDrawOffered = (data: { playerId: string }) => {
      console.log('[OnlineGame] Draw offered');
      setDrawOfferFrom(data.playerId);
    };

    const handleDrawAccepted = () => {
      console.log('[OnlineGame] Draw accepted');
      endGame();
      alert('Tablas aceptadas');
    };

    const handleChatMessage = (data: {
      userId: string;
      username: string;
      message: string;
      timestamp: string;
    }) => {
      setMessages((prev) => [...prev.slice(-49), data]);
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('drawOffered', handleDrawOffered);
    socket.on('drawAccepted', handleDrawAccepted);
    socket.on('chatMessage', handleChatMessage);

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('drawOffered', handleDrawOffered);
      socket.off('drawAccepted', handleDrawAccepted);
      socket.off('chatMessage', handleChatMessage);
    };
  }, [endGame]);

  useEffect(() => {
    if (status === 'active') {
      setHasOpponent(true);
    }
  }, [status]);

  // Cargar partida
  useEffect(() => {
    const loadGame = async () => {
      try {
        const game = await gameService.getGame(gameId);

        const color = game.whitePlayerId === user?.id ? 'white' : 'black';

        if (game.blackPlayerId) {
          setHasOpponent(true);
        }

        initGame(gameId, 'online', color, game.currentFen, game.pgn, game.status);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading game:', error);
        alert('Error al cargar la partida');
        navigate('/lobby');
      }
    };

    loadGame();
  }, [gameId, user, initGame, navigate]);

  const handleMove = (move: Move): boolean => {
    const socket = getSocket();
    if (!socket || !socket.connected) {
      alert('Conexion perdida. Esperando reconexion...');
      return false;
    }

    socket.emit('makeMove', { gameId, move: {from: move.from, to: move.to, promotion: move.promotion} });
    return true;
  };

  const handleResign = async () => {
    const socket = getSocket();
    if (socket && status === 'active' && hasOpponent) {
      socket.emit('resign', gameId);
      // Give socket a short window to flush the event before unmount/disconnect.
      await sleep(150);
    }
    
    endGame();
    reset();
    navigate('/lobby');
  };

  const handleOfferDraw = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('offerDraw', gameId);
      setDrawOffered(true);
      alert('Oferta de tablas enviada al oponente');
    }
  };

  const handleAcceptDraw = () => {
    const socket = getSocket();
    if (socket && drawOfferFrom) {
      socket.emit('acceptDraw', gameId);
      endGame();
      alert('Tablas aceptadas');
      navigate('/lobby');
    }
  };

  const handleDeclineDraw = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('declineDraw', gameId);
    }
    setDrawOfferFrom(null);
  };

  const handleLeave = async () => {
    const socket = getSocket();
    if (socket) {
      if (status === 'waiting' || !hasOpponent) {
        socket.emit('cancelGame', gameId);
        await sleep(120);
      } else if (status === 'active') {
        socket.emit('resign', gameId);
        await sleep(150);
      }
    }
    
    reset();
    navigate('/lobby');
  };

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit('chatMessage', { gameId, message: text });

    setMessages((prev) => [...prev.slice(-49), {
      userId: user?.id || '',
      username: user?.username || '',
      message: text,
      timestamp: new Date().toISOString(),
    }]);

    setChatInput('');
  };

  const handleExportTxt = () => {
    exportGameTxt({
      profileName: user?.username || 'Jugador',
      mode,
      status,
      playerColor,
      moves,
    });
  };

  const board2DThemeLabels = {
    classic: 'Clasico',
    wood: 'Madera',
    ocean: 'Oceano',
    slate: 'Pizarra',
  } as const;

  const board3DThemeLabels = {
    wood: 'Madera',
    obsidian: 'Obsidiana',
  } as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando partida online...</div>
      </div>
    );
  }

  // Construir acciones del header
  const headerActions = [];

  if (status === 'active' && hasOpponent) {
    headerActions.push({
      label: drawOffered ? 'Oferta Enviada' : 'Ofrecer Tablas',
      onClick: handleOfferDraw,
      variant: 'secondary' as const,
      disabled: drawOffered,
    });
    headerActions.push({
      label: 'Rendirse',
      onClick: handleResign,
      variant: 'danger' as const,
    });
  }

  headerActions.push({
    label: boardView === '3d' ? 'Vista 2D' : 'Vista 3D',
    onClick: () => setBoardView(boardView === '3d' ? '2d' : '3d'),
    variant: 'secondary' as const,
  });

  headerActions.push({
    label:
      boardView === '2d'
        ? `Tema 2D: ${board2DThemeLabels[board2DTheme]}`
        : `Tema 3D: ${board3DThemeLabels[board3DTheme]}`,
    onClick: boardView === '2d' ? cycleBoard2DTheme : cycleBoard3DTheme,
    variant: 'secondary' as const,
  });

  headerActions.push({
    label: 'Descargar TXT',
    onClick: handleExportTxt,
    variant: 'primary' as const,
  });

  headerActions.push({
    label: status === 'waiting' ? 'Cancelar' : 'Salir',
    onClick: handleLeave,
    variant: 'secondary' as const,
  });

  const subtitle = !hasOpponent && status === 'waiting' 
    ? '⏳ Esperando oponente...' 
    : undefined;

  return (
    <GameLayout onMove={handleMove} gameFinished={status === 'finished'}>
      <GameHeader
        title="👥 Partida Online"
        subtitle={subtitle}
        actions={headerActions}
      />

      {/* Banner de oferta de tablas */}
      {drawOfferFrom && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
          <p className="font-bold text-yellow-900 mb-3">
            🤝 Tu oponente ha ofrecido tablas
          </p>
          <div className="flex gap-3">
            <Button onClick={handleAcceptDraw}>
              ✓ Aceptar Tablas
            </Button>
            <Button variant="danger" onClick={handleDeclineDraw}>
              ✗ Rechazar
            </Button>
          </div>
        </div>
      )}

      {/* Banner de espera */}
      {!hasOpponent && status === 'waiting' && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-gray-800 border border-yellow-200 rounded text-center">
          <p className="text-yellow-800 font-medium mb-2">
            ⏳ Esperando que se una un oponente...
          </p>
          <p className="text-sm text-gray-600">Comparte este link con tu oponente:</p>
          <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
            <code className="text-sm">{window.location.href}</code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('¡Link copiado!');
            }}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            📋 Copiar link
          </button>
        </div>
      )}

      <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
        <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">Chat</h3>
        <div className="h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2 mb-2 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">Sin mensajes todavía.</p>
          ) : (
            messages.map((m, idx) => (
              <div key={`${m.timestamp}-${idx}`} className="text-sm mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">{m.username}: </span>
                <span className="text-gray-800 dark:text-gray-200">{m.message}</span>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          <Button onClick={handleSendMessage}>Enviar</Button>
        </div>
      </div>
    </GameLayout>
  );
};
