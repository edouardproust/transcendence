import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "./gameStore";
import { useGameSocket } from "@/hooks/useGameSocket";
import { getSocket } from "@/engine/socket";
import { gameService } from "@/services/gameService";
import { useAuthStore } from "@/features/auth/authStore";
import { Move } from "@/types/game";
import { GameLayout } from "./shared/GameLayout";
import { GameHeader } from "./shared/GameHeader";
import { pushToast } from "@/components/ui/ToastProvider";
import { exportGameTxt } from "./utils/exportGameTxt";
import { getApiErrorMessage } from "@/utils/apiError";
import { useLeaveGame } from "@/hooks/useLeaveGame";
import { useDrawOffer } from "@/hooks/useDrawOffer";
import { useGameChat } from "@/hooks/useGameChat";
import { DrawOfferBanner } from "./components/DrawOfferBanner";
import { WaitingBanner } from "./components/WaitingBanner";
import { GameChat } from "./components/GameChat";

interface OnlineGamePageProps {
  gameId: string;
}

export const OnlineGamePage: React.FC<OnlineGamePageProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const {
    initGame,
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
  } = useGameStore();

  const [isLoading, setIsLoading] = useState(true);
  const [hasOpponent, setHasOpponent] = useState(false);

  const {
    isLeavingGame,
    setMounted,
    cleanup,
    handleResign,
    handleLeave,
  } = useLeaveGame({ gameId, token, status, hasOpponent });

  const {
    drawOffered,
    drawOfferFrom,
    resetDrawState,
    onDrawOffered,
    onDrawDeclined,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
  } = useDrawOffer({ gameId, status, hasOpponent, isLeavingGame });

  const {
    messages,
    chatInput,
    setChatInput,
    onChatMessage,
    handleSendMessage,
  } = useGameChat({ gameId, currentUser: user ?? null, isLeavingGame });

  // Socket
  useGameSocket(gameId, {
    suppressErrorAlerts: isLeavingGame,
    onError: (message) => {
      if (!isLeavingGame) return false;
      return (
        message === "Cannot cancel a started game" ||
        message === "Game is not ongoing"
      );
    },
    onPlayerJoined: () => setHasOpponent(true),
    onDrawOffered,
    onDrawDeclined,
    onChatMessage,
  });

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (status === "active") setHasOpponent(true);
    if (status !== "active") resetDrawState();
  }, [status]);

  // Cargar partida
  useEffect(() => {
    const loadGame = async () => {
      try {
        const game = await gameService.getGame(gameId);

        if (game.status === "cancelled") {
          pushToast("La partida fue cancelada", "info");
          navigate("/lobby");
          return;
        }

        const color = game.whitePlayerId === user?.id ? "white" : "black";
        if (game.blackPlayerId) setHasOpponent(true);

        initGame(gameId, "online", color, game.currentFen, game.pgn, game.status);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading game:", error);
        pushToast(getApiErrorMessage(error, "Error al cargar la partida"), "error");
        navigate("/lobby");
      }
    };

    loadGame();
  }, [gameId, user, initGame, navigate]);

  const handleMove = (move: Move): boolean => {
    if (isLeavingGame) return false;
    const socket = getSocket();
    if (!socket || !socket.connected) {
      pushToast("Conexion perdida. Esperando reconexion...", "error");
      return false;
    }
    socket.emit("makeMove", {
      gameId,
      move: { from: move.from, to: move.to, promotion: move.promotion },
    });
    return true;
  };

  const handleExportTxt = () => {
    exportGameTxt({ profileName: user?.username || "Jugador", mode, status, playerColor, moves });
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
        <div className="text-xl">Cargando partida online...</div>
      </div>
    );
  }

  const headerActions = [
    ...(status === "active" && hasOpponent
      ? [
          {
            label: drawOffered ? "Oferta Enviada" : "Ofrecer Tablas",
            onClick: handleOfferDraw,
            variant: "secondary" as const,
            disabled: drawOffered || isLeavingGame,
          },
          {
            label: isLeavingGame ? "Confirmando..." : "Rendirse",
            onClick: handleResign,
            variant: "danger" as const,
            disabled: isLeavingGame,
          },
        ]
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
    {
      label: "Descargar TXT",
      onClick: handleExportTxt,
      variant: "primary" as const,
      disabled: isLeavingGame,
    },
    {
      label: isLeavingGame
        ? "Confirmando..."
        : status === "waiting"
          ? "Cancelar"
          : "Salir",
      onClick: handleLeave,
      variant: "secondary" as const,
      disabled: isLeavingGame,
    },
  ];

  const subtitle =
    !hasOpponent && status === "waiting"
      ? "⏳ Esperando oponente..."
      : isLeavingGame
        ? "⏳ Confirmando el estado con el servidor..."
        : undefined;

  return (
    <GameLayout
      onMove={handleMove}
      gameFinished={status === "finished" || status === "cancelled"}
      clockEnabled
    >
      <GameHeader title="👥 Partida Online" subtitle={subtitle} actions={headerActions} />

      {drawOfferFrom && (
        <DrawOfferBanner
          isLeavingGame={isLeavingGame}
          onAccept={handleAcceptDraw}
          onDecline={handleDeclineDraw}
        />
      )}

      {!hasOpponent && status === "waiting" && <WaitingBanner />}

      <GameChat
        messages={messages}
        chatInput={chatInput}
        onInputChange={setChatInput}
        onSend={handleSendMessage}
      />
    </GameLayout>
  );
};
