import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "./gameStore";
import { StockfishEngine } from "@/engine/stockfish";
import { gameService } from "@/services/gameService";
import { Move, PlayerColor } from "@/types/game";
import { GameLayout } from "./shared/GameLayout";
import { GameHeader } from "./shared/GameHeader";
import { pushToast } from "@/components/ui/ToastProvider";
import { useAuthStore } from "@/features/auth/authStore";
import { exportGameTxt } from "./utils/exportGameTxt";
import { getApiErrorMessage } from "@/utils/apiError";
import { useStockfish } from "@/hooks/useStockfish";
import { useAiMove } from "@/hooks/useAiMove";
import { useAiGameResult } from "@/hooks/useAiGameResult";
import { useCheckAlert } from "@/hooks/useCheckAlert";
import { AIGameSetup } from "@/features/game/components/AiGameSetup";
import {
  AI_LEVEL_STORAGE_PREFIX,
  normalizeAiLevel,
  normalizePlayerColor,
} from "./utils/aiGameUtils";

interface AIGamePageProps {
  gameId: string;
}

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
    reset,
  } = useGameStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [aiLevel, setAiLevel] = useState<number>(() =>
    normalizeAiLevel(window.localStorage.getItem(`${AI_LEVEL_STORAGE_PREFIX}${gameId}`)),
  );
  const [selectedPlayerColor, setSelectedPlayerColor] = useState<PlayerColor>("white");
  const [untimedMode] = useState<boolean>(true);

  const aiColorStorageKey = `ai-player-color:${gameId}`;
  const aiLevelStorageKey = `${AI_LEVEL_STORAGE_PREFIX}${gameId}`;
  const humanColor: PlayerColor = playerColor || selectedPlayerColor;

  const persistPlayerColor = (color: PlayerColor) =>
    window.localStorage.setItem(aiColorStorageKey, color);

  const persistAiLevel = (level: number) =>
    window.localStorage.setItem(aiLevelStorageKey, String(level));

  // stockfishRef breaks the circular dependency:
  // useAiMove needs the engine; useStockfish needs handleBestMove from useAiMove.
  // A ref lets both hooks share the same engine instance without coupling init order.
  const stockfishRef = useRef<StockfishEngine | null>(null);

  const { finalizeIfGameOver, handleResign, resetResultRefs } = useAiGameResult({
    humanColor,
    userId: user?.id,
  });

  const { isAiThinking, handleBestMove } = useAiMove({
    status,
    turn,
    aiLevel,
    humanColor,
    stockfishRef,
    onAiMove: (move: Move) => {
      makeMove(move);
      finalizeIfGameOver();
    },
  });

  useStockfish({ stockfishRef, onBestMove: handleBestMove });

  useCheckAlert({ status, fen, turn, humanColor });

  // Load game
  useEffect(() => {
    const loadGame = async () => {
      try {
        const game = await gameService.getGame(gameId);
        const storedColor = normalizePlayerColor(
          window.localStorage.getItem(aiColorStorageKey),
        );
        setSelectedPlayerColor(storedColor);
        initGame(gameId, "ai", storedColor, game.currentFen, game.pgn, game.status);
        resetResultRefs();
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading game:", error);
        pushToast(getApiErrorMessage(error, "Error al cargar la partida"), "error");
        navigate("/lobby");
      }
    };

    loadGame();
  }, [gameId, initGame, navigate]);

  const handleMove = (move: Move): boolean => {
    const success = makeMove(move);
    if (!success) return false;
    finalizeIfGameOver();
    return true;
  };

  const handleStartGame = async () => {
    try {
      setIsStartingGame(true);
      persistPlayerColor(selectedPlayerColor);
      persistAiLevel(aiLevel);
      useGameStore.setState({ playerColor: selectedPlayerColor });
      const startedGame = await gameService.startGame(gameId, {
        playerColor: selectedPlayerColor,
      });
      useGameStore.setState({ status: startedGame.status });
    } catch (error) {
      console.error("[AIGame] Error starting game:", error);
      pushToast(getApiErrorMessage(error, "No se pudo iniciar la partida"), "error");
    } finally {
      setIsStartingGame(false);
    }
  };

  const handleLeave = () => {
    void (async () => {
      try {
        if (status === "waiting" || status === "active") {
          await gameService.cancelGame(gameId);
        }
      } catch (error) {
        console.error("[AIGame] Error leaving game:", error);
        pushToast(getApiErrorMessage(error, "No se pudo cerrar la partida"), "error");
        return;
      }

      reset();
      navigate("/lobby");
    })();
  };

  const handleExportTxt = () => {
    exportGameTxt({
      profileName: user?.username || "Jugador",
      mode,
      status,
      playerColor: humanColor,
      moves,
    });
  };

  const board2DThemeLabels = {
    classic: "Clasico",
    wood: "Madera",
    ocean: "Oceano",
    slate: "Pizarra",
  } as const;

  const board3DThemeLabels = {
    wood: "Madera",
    obsidian: "Obsidiana",
  } as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Cargando partida vs IA...</div>
      </div>
    );
  }

  const headerActions = [
    ...(status === "active"
      ? [{ label: "Rendirse", onClick: handleResign, variant: "danger" as const }]
      : []),
    {
      label: boardView === "3d" ? "Vista 2D" : "Vista 3D",
      onClick: () => setBoardView(boardView === "3d" ? "2d" : "3d"),
      variant: "secondary" as const,
    },
    {
      label:
        boardView === "2d"
          ? `Tema 2D: ${board2DThemeLabels[board2DTheme]}`
          : `Tema 3D: ${board3DThemeLabels[board3DTheme]}`,
      onClick: boardView === "2d" ? cycleBoard2DTheme : cycleBoard3DTheme,
      variant: "secondary" as const,
    },
    { label: "Descargar TXT", onClick: handleExportTxt, variant: "primary" as const },
    {
      label: status === "waiting" ? "Cancelar" : "Salir",
      onClick: handleLeave,
      variant: "secondary" as const,
    },
  ];

  const subtitle =
    status === "active"
      ? `Nivel: ${aiLevel}/20 | Juegas: ${humanColor === "white" ? "Blancas" : "Negras"} | ${untimedMode ? "Sin tiempo" : "Con reloj"}`
      : undefined;

  return (
    <GameLayout
      onMove={handleMove}
      gameFinished={status === "finished"}
      clockEnabled={!untimedMode}
      isThinking={isAiThinking}
      aiLevel={aiLevel}
    >
      <GameHeader title="🤖 Vs Computadora" subtitle={subtitle} actions={headerActions} />

      {status === "waiting" && (
        <AIGameSetup
          aiLevel={aiLevel}
          selectedPlayerColor={selectedPlayerColor}
          isStartingGame={isStartingGame}
          onAiLevelChange={(level) => {
            setAiLevel(level);
            persistAiLevel(level);
          }}
          onPlayerColorChange={(color) => {
            setSelectedPlayerColor(color);
            persistPlayerColor(color);
            useGameStore.setState({ playerColor: color });
          }}
          onStart={handleStartGame}
        />
      )}
    </GameLayout>
  );
};
