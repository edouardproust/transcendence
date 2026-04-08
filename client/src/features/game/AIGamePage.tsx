import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from './gameStore';
import { StockfishEngine } from '@/engine/stockfish';
import { gameService } from '@/services/gameService';
import { Move, PlayerColor } from '@/types/game';
import { GameLayout } from './shared/GameLayout';
import { GameHeader } from './shared/GameHeader';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/authStore';
import { exportGameTxt } from './utils/exportGameTxt';

interface AIGamePageProps {
  gameId: string;
}

const FILES = 'abcdefgh';
const RANKS = '12345678';
const PROMOTION_OPTIONS: Array<'q' | 'r' | 'b' | 'n'> = ['q', 'r', 'b', 'n'];

const normalizePlayerColor = (value: string | null | undefined): PlayerColor =>
  value === 'black' ? 'black' : 'white';

export const AIGamePage: React.FC<AIGamePageProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    initGame,
    makeMove,
    mode,
    playerColor,
    fen,
    turn,
    boardView,
    board2DTheme,
    board3DTheme,
    setBoardView,
    cycleBoard2DTheme,
    cycleBoard3DTheme,
    moves,
    status,
    endGame,
    reset,
  } = useGameStore();

  const [isLoading, setIsLoading] = useState(true);
  const [stockfish, setStockfish] = useState<StockfishEngine | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiLevel, setAiLevel] = useState<number>(10);
  const [selectedPlayerColor, setSelectedPlayerColor] = useState<PlayerColor>('white');
  const [untimedMode] = useState<boolean>(true);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const pendingAiMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiThinkWindowRef = useRef<{ requestedAt: number; minDelayMs: number } | null>(null);
  const gameEndAlertShownRef = useRef(false);
  const lastCheckAlertKeyRef = useRef<string | null>(null);

  const aiColorStorageKey = `ai-player-color:${gameId}`;
  const humanColor: PlayerColor = playerColor || selectedPlayerColor;

  const clearPendingAiMove = () => {
    if (!pendingAiMoveTimeoutRef.current) return;
    clearTimeout(pendingAiMoveTimeoutRef.current);
    pendingAiMoveTimeoutRef.current = null;
  };

  const persistPlayerColor = (color: PlayerColor) => {
    window.localStorage.setItem(aiColorStorageKey, color);
  };

  const readStoredPlayerColor = (): PlayerColor =>
    normalizePlayerColor(window.localStorage.getItem(aiColorStorageKey));

  const getAiThinkDelayMs = (level: number): number => {
    const boundedLevel = Math.max(1, Math.min(20, Math.floor(level)));
    const oneThird = (value: number) => Math.max(250, Math.round(value / 3));

    if (boundedLevel === 1) {
      const previous = 1600 + Math.floor(Math.random() * 900);
      return oneThird(previous);
    }

    // Tiempo de respuesta deliberadamente mas visible para seguir jugadas de la IA.
    const baseMs = 1300 + boundedLevel * 150;
    const jitterMs = Math.floor(Math.random() * 1200);
    const previous = Math.min(5600, baseMs + jitterMs);
    return oneThird(previous);
  };

  const finalizeIfGameOver = () => {
    const state = useGameStore.getState();
    const chess = state.chess;

    if (!chess || !chess.isGameOver()) {
      return false;
    }

    let message = 'Partida finalizada.';
    if (chess.isCheckmate()) {
      // In checkmate, side to move is the loser.
      const humanSide = humanColor === 'white' ? 'w' : 'b';
      const aiSide = humanSide === 'w' ? 'b' : 'w';
      const loserSide = chess.turn();
      const playerWon = loserSide === aiSide;
      message =
        playerWon
          ? '♔ Jaque mate. Ganaste a la IA.'
          : '♚ Jaque mate. Ganó la IA.';
    } else if (chess.isDraw() || chess.isStalemate()) {
      message = 'Tablas. No hay ganador.';
    }

    if (!gameEndAlertShownRef.current) {
      alert(message);
      gameEndAlertShownRef.current = true;
    }
    endGame();
    return true;
  };

  const applyAiMove = (aiMove: Move) => {
    const moved = makeMove(aiMove);
    setIsAiThinking(false);
    aiThinkWindowRef.current = null;
    pendingAiMoveTimeoutRef.current = null;

    if (!moved) {
      console.warn('[AIGame] AI move was invalid');
      return;
    }

    finalizeIfGameOver();
  };

  const getRandomAiMove = (): Move | null => {
    const state = useGameStore.getState();
    const chess = state.chess;
    if (!chess) return null;

    const aiTurn = state.turn;
    const candidates: Move[] = [];

    for (const file of FILES) {
      for (const rank of RANKS) {
        const from = `${file}${rank}`;
        const piece = chess.getPiece(from);
        if (!piece) continue;

        const pieceSide: 'w' | 'b' = piece === piece.toUpperCase() ? 'w' : 'b';
        if (pieceSide !== aiTurn) continue;

        const targets = chess.getLegalTargets(from);
        for (const to of targets) {
          const isPromotion = piece.toLowerCase() === 'p' && (to[1] === '1' || to[1] === '8');
          const promotion = isPromotion
            ? PROMOTION_OPTIONS[Math.floor(Math.random() * PROMOTION_OPTIONS.length)]
            : undefined;

          candidates.push({ from, to, promotion });
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const requestAiMove = () => {
    if (status !== 'active' || isAiThinking) {
      return;
    }

    const state = useGameStore.getState();
    const humanTurn = humanColor === 'white' ? 'w' : 'b';
    if (state.turn === humanTurn) {
      return;
    }

    const minDelayMs = getAiThinkDelayMs(aiLevel);
    aiThinkWindowRef.current = { requestedAt: Date.now(), minDelayMs };
    setIsAiThinking(true);

    if (aiLevel <= 1) {
      const randomMove = getRandomAiMove();
      if (!randomMove) {
        setIsAiThinking(false);
        aiThinkWindowRef.current = null;
        return;
      }

      clearPendingAiMove();
      pendingAiMoveTimeoutRef.current = setTimeout(() => {
        applyAiMove(randomMove);
      }, minDelayMs);
      return;
    }

    if (!stockfish) {
      setIsAiThinking(false);
      aiThinkWindowRef.current = null;
      return;
    }

    stockfish.setPosition(state.fen);
    stockfish.calculateMove(aiLevel);
  };

  // Cargar partida
  useEffect(() => {
    const loadGame = async () => {
      try {
        const game = await gameService.getGame(gameId);
        const storedColor = readStoredPlayerColor();
        setSelectedPlayerColor(storedColor);
        initGame(gameId, 'ai', storedColor, game.currentFen, game.pgn, game.status);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading game:', error);
        alert('Error al cargar la partida');
        navigate('/lobby');
      }
    };

    loadGame();
  }, [gameId, initGame, navigate]);

  // Inicializar Stockfish
  useEffect(() => {
    if (!stockfish) {
      console.log('[AIGame] Initializing Stockfish...');
      const engine = new StockfishEngine();

      engine
        .init()
        .then(() => {
          console.log('[AIGame] ✓ Stockfish ready');
          setStockfish(engine);

          engine.onBestMove((bestMove) => {
            const thinkWindow = aiThinkWindowRef.current;
            if (!thinkWindow) {
              return;
            }

            if (!bestMove || bestMove.length < 4 || bestMove === '(none)') {
              setIsAiThinking(false);
              aiThinkWindowRef.current = null;
              return;
            }

            const aiMove: Move = {
              from: bestMove.substring(0, 2),
              to: bestMove.substring(2, 4),
              promotion: bestMove.length > 4 ? bestMove[4] : undefined,
            };

            const elapsed = Date.now() - thinkWindow.requestedAt;
            const remainingDelay = Math.max(0, thinkWindow.minDelayMs - elapsed);

            if (remainingDelay === 0) {
              applyAiMove(aiMove);
              return;
            }

            clearPendingAiMove();
            pendingAiMoveTimeoutRef.current = setTimeout(() => {
              applyAiMove(aiMove);
            }, remainingDelay);
          });
        })
        .catch((error) => {
          console.error('[AIGame] Stockfish error:', error);
          alert('Error al inicializar el motor de IA');
        });
    }

    return () => {
      clearPendingAiMove();
      aiThinkWindowRef.current = null;
      if (stockfish) {
        console.log('[AIGame] Terminating Stockfish');
        stockfish.terminate();
      }
    };
  }, [stockfish, makeMove]);

  useEffect(() => {
    if (status !== 'active') {
      clearPendingAiMove();
      aiThinkWindowRef.current = null;
      setIsAiThinking(false);
      lastCheckAlertKeyRef.current = null;
      if (status === 'waiting') {
        gameEndAlertShownRef.current = false;
      }
      return;
    }

    requestAiMove();
  }, [status, turn, aiLevel, stockfish, humanColor, isAiThinking]);

  useEffect(() => {
    if (status !== 'active') {
      lastCheckAlertKeyRef.current = null;
      return;
    }

    const state = useGameStore.getState();
    const chess = state.chess;
    if (!chess || !chess.inCheck() || chess.isGameOver()) {
      lastCheckAlertKeyRef.current = null;
      return;
    }

    const checkedSide = chess.turn();
    const key = `${state.fen}|${checkedSide}`;
    if (lastCheckAlertKeyRef.current === key) {
      return;
    }

    lastCheckAlertKeyRef.current = key;
    const humanSide = humanColor === 'white' ? 'w' : 'b';
    alert(checkedSide === humanSide ? '⚠️ Jaque a tu rey' : '⚠️ Has puesto en jaque a la IA');
  }, [status, fen, turn, humanColor]);

  const handleMove = (move: Move): boolean => {
    const success = makeMove(move);
    if (!success) {
      console.log('Invalid move:', move);
      return false;
    }

    finalizeIfGameOver();
    return true;
  };

  const handleStartGame = async () => {
    try {
      setIsStartingGame(true);
      persistPlayerColor(selectedPlayerColor);
      useGameStore.setState({ playerColor: selectedPlayerColor });

      const startedGame = await gameService.startGame(gameId);
      useGameStore.setState({ status: startedGame.status });
    } catch (error) {
      console.error('[AIGame] Error starting game:', error);
      alert('No se pudo iniciar la partida');
    } finally {
      setIsStartingGame(false);
    }
  };

  const handleResign = () => {
    endGame();
    reset();
    navigate('/lobby');
  };

  const handleLeave = () => {
    reset();
    navigate('/lobby');
  };

  const handleExportTxt = () => {
    exportGameTxt({
      profileName: user?.username || 'Jugador',
      mode,
      status,
      playerColor: humanColor,
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
        <div className="text-xl">Cargando partida vs IA...</div>
      </div>
    );
  }

  // Construir acciones del header
  const headerActions = [];

  if (status === 'active') {
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

  const subtitle =
    status === 'active'
      ? `Nivel: ${aiLevel}/20 | Juegas: ${humanColor === 'white' ? 'Blancas' : 'Negras'} | ${untimedMode ? 'Sin tiempo' : 'Con reloj'}`
      : undefined;

  return (
    <GameLayout
      onMove={handleMove}
      gameFinished={status === 'finished'}
      clockEnabled={!untimedMode}
    >
      <GameHeader title="🤖 Vs Computadora" subtitle={subtitle} actions={headerActions} />

      {/* Configuración inicial */}
      {status === 'waiting' && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-gray-800 border border-blue-200 rounded">
          <h3 className="font-bold mb-2">Configurar dificultad</h3>
          <div className="flex items-center gap-4">
            <label className="text-sm">Nivel (1-20):</label>
            <input
              type="range"
              min="1"
              max="20"
              value={aiLevel}
              onChange={(e) => setAiLevel(parseInt(e.target.value, 10))}
              className="flex-1"
            />
            <span className="font-bold">{aiLevel}</span>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Nivel 1 = Basico | 2-7 = Principiante | 8-14 = Intermedio | 15-20 = Maestro
          </p>

          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Color de piezas</label>
            <select
              value={selectedPlayerColor}
              onChange={(e) => {
                const nextColor = normalizePlayerColor(e.target.value);
                setSelectedPlayerColor(nextColor);
                persistPlayerColor(nextColor);
                useGameStore.setState({ playerColor: nextColor });
              }}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              disabled={isStartingGame}
            >
              <option value="white">Blancas</option>
              <option value="black">Negras</option>
            </select>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Si eliges negras, la IA realiza la primera jugada.
            </p>
          </div>

          <Button className="mt-3" onClick={handleStartGame} disabled={isStartingGame}>
            {isStartingGame ? 'Iniciando...' : 'Iniciar Partida'}
          </Button>
        </div>
      )}

      {/* IA pensando */}
      {isAiThinking && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 rounded text-center">
          <p className="text-blue-800">🤔 La IA está pensando (Nivel {aiLevel})...</p>
        </div>
      )}
    </GameLayout>
  );
};
