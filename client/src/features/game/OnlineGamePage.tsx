import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "./gameStore";
import { useGameSocket } from "@/hooks/useGameSocket";
import { connectSocket, getSocket } from "@/engine/socket";
import { gameService } from "@/services/gameService";
import { useAuthStore } from "@/features/auth/authStore";
import { Move } from "@/types/game";
import { GameLayout } from "./shared/GameLayout";
import { GameHeader } from "./shared/GameHeader";
import { Button } from "@/components/ui/Button";
import { pushToast } from "@/components/ui/ToastProvider";
import { exportGameTxt } from "./utils/exportGameTxt";
import { getApiErrorMessage } from "@/utils/apiError";

interface OnlineGamePageProps {
  gameId: string;
}

export const OnlineGamePage: React.FC<OnlineGamePageProps> = ({ gameId }) => {
  type ExitAction = "cancel" | "resign";

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
    reset,
  } = useGameStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isLeavingGame, setIsLeavingGame] = useState(false);
  const [hasOpponent, setHasOpponent] = useState(false);
  const [drawOffered, setDrawOffered] = useState(false);
  const [drawOfferFrom, setDrawOfferFrom] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      userId: string;
      username: string;
      message: string;
      timestamp: string;
    }>
  >([]);
  const isMountedRef = useRef(true);
  const activeLeaveWaitCleanupRef = useRef<(() => void) | null>(null);

  // Conectar socket
  useGameSocket(gameId, {
    suppressErrorAlerts: isLeavingGame,
    onError: (message) => {
      if (!isLeavingGame) {
        return false;
      }

      return (
        message === "Cannot cancel a started game" ||
        message === "Game is not ongoing"
      );
    },
    onPlayerJoined: () => {
      setHasOpponent(true);
    },
    onDrawOffered: (data) => {
      setDrawOfferFrom(data.playerId);
    },
    onDrawDeclined: () => {
      setDrawOffered(false);
      setDrawOfferFrom(null);
      pushToast("Tu oponente rechazó las tablas", "info");
    },
    onChatMessage: (data) => {
      setMessages((prev) => [...prev.slice(-49), data]);
    },
  });

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      activeLeaveWaitCleanupRef.current?.();
      activeLeaveWaitCleanupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (status === "active") {
      setHasOpponent(true);
    }

    if (status !== "active") {
      setDrawOffered(false);
      setDrawOfferFrom(null);
    }
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

        if (game.blackPlayerId) {
          setHasOpponent(true);
        }

        initGame(
          gameId,
          "online",
          color,
          game.currentFen,
          game.pgn,
          game.status,
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading game:", error);
        pushToast(
          getApiErrorMessage(error, "Error al cargar la partida"),
          "error",
        );
        navigate("/lobby");
      }
    };

    loadGame();
  }, [gameId, user, initGame, navigate]);

  const handleMove = (move: Move): boolean => {
    if (isLeavingGame) {
      return false;
    }

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

  const getSocketErrorMessage = (payload: unknown) => {
    if (typeof payload === "string") return payload;
    if (payload && typeof payload === "object" && "message" in payload) {
      const message = (payload as { message?: unknown }).message;
      return typeof message === "string" ? message : null;
    }
    return null;
  };

  const getOrCreateSocket = () => {
    const existingSocket = getSocket();
    if (existingSocket) {
      if (!existingSocket.connected) {
        existingSocket.connect();
      }
      return existingSocket;
    }

    if (!token) {
      return null;
    }

    return connectSocket(token);
  };

  const emitExitAction = (
    action: ExitAction,
    socket: ReturnType<typeof getSocket>,
  ) => {
    if (!socket?.connected) {
      return false;
    }

    socket.emit(action === "cancel" ? "cancelGame" : "resign", gameId);
    return true;
  };

  const waitForBackendExitConfirmation = (
    action: ExitAction,
    socket: ReturnType<typeof getSocket>,
    actionAlreadyEmitted: boolean,
  ) =>
    new Promise<{ ok: boolean; message?: string; alreadyNotified?: boolean }>(
      (resolve) => {
        let settled = false;
        let pollInFlight = false;
        let actionEmitted = actionAlreadyEmitted;
        let socketErrorMessage: string | null = null;
        let pollTimer: number | null = null;
        let timeoutTimer: number | null = null;

        const emitWhenPossible = () => {
          if (settled || actionEmitted) return;

          if (!emitExitAction(action, socket)) {
            return;
          }

          actionEmitted = true;
        };

        const cleanup = () => {
          if (pollTimer !== null) {
            window.clearInterval(pollTimer);
          }
          if (timeoutTimer !== null) {
            window.clearTimeout(timeoutTimer);
          }
          socket?.off("connect", handleSocketConnect);
          socket?.off("error", handleSocketError);
          socket?.off("gameCancelled", handleGameCancelled);
          socket?.off("gameEnd", handleGameEnd);
          if (activeLeaveWaitCleanupRef.current === cleanup) {
            activeLeaveWaitCleanupRef.current = null;
          }
        };

        const finish = (result: {
          ok: boolean;
          message?: string;
          alreadyNotified?: boolean;
        }) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(result);
        };

        const handleSocketConnect = () => {
          emitWhenPossible();
        };

        const handleSocketError = (payload: unknown) => {
          const message = getSocketErrorMessage(payload);
          if (!message) return;

          socketErrorMessage = message;

          if (
            action === "cancel" &&
            message === "Cannot cancel a started game"
          ) {
            finish({ ok: false, message, alreadyNotified: true });
          }
        };

        const handleGameCancelled = () => {
          finish({ ok: true });
        };

        const handleGameEnd = () => {
          if (action === "resign" || action === "cancel") {
            finish({ ok: true });
          }
        };

        const pollGameStatus = async () => {
          if (pollInFlight || settled) return;
          pollInFlight = true;

          try {
            const game = await gameService.getGame(gameId);

            if (action === "cancel") {
              if (game.status === "cancelled") {
                finish({ ok: true });
                return;
              }

              if (game.status === "finished") {
                finish({ ok: true });
                return;
              }

              if (game.status === "active") {
                finish({
                  ok: false,
                  message:
                    socketErrorMessage ||
                    "No se pudo cancelar. La partida ya comenzó.",
                  alreadyNotified: Boolean(socketErrorMessage),
                });
                return;
              }
            }

            if (
              action === "resign" &&
              (game.status === "finished" || game.status === "cancelled")
            ) {
              finish({ ok: true });
            }
          } catch (error: any) {
            const message = error.response?.data?.message;
            if (
              typeof message === "string" &&
              message.toLowerCase().includes("not found")
            ) {
              finish({
                ok: false,
                message: "La partida ya no está disponible.",
              });
            }
          } finally {
            pollInFlight = false;
          }
        };

        socket?.on("connect", handleSocketConnect);
        socket?.on("error", handleSocketError);
        socket?.on("gameCancelled", handleGameCancelled);
        socket?.on("gameEnd", handleGameEnd);

        activeLeaveWaitCleanupRef.current = cleanup;
        emitWhenPossible();
        void pollGameStatus();
        pollTimer = window.setInterval(() => {
          void pollGameStatus();
        }, 400);
        timeoutTimer = window.setTimeout(() => {
          finish({
            ok: false,
            message:
              "No se pudo confirmar el estado con el servidor. Inténtalo de nuevo.",
          });
        }, 5000);
      },
    );

  const requestLeaveWithConfirmation = async (action: ExitAction) => {
    if (isLeavingGame) return;

    const socket = getOrCreateSocket();
    if (!socket) {
      pushToast(
        "No se pudo contactar el servidor. Inténtalo de nuevo.",
        "error",
      );
      return;
    }

    setIsLeavingGame(true);

    try {
      const actionEmitted = emitExitAction(action, socket);
      const result = await waitForBackendExitConfirmation(
        action,
        socket,
        actionEmitted,
      );

      if (!isMountedRef.current) {
        return;
      }

      if (!result.ok) {
        if (!result.alreadyNotified) {
          pushToast(
            result.message || "No se pudo salir de la partida.",
            "error",
          );
        }
        return;
      }

      reset();
      navigate("/lobby");
    } finally {
      if (isMountedRef.current) {
        setIsLeavingGame(false);
      }
    }
  };

  const handleResign = async () => {
    if (status !== "active" || !hasOpponent) return;
    await requestLeaveWithConfirmation("resign");
  };

  const handleOfferDraw = () => {
    if (isLeavingGame) return;

    const socket = getSocket();
    if (socket && status === "active" && hasOpponent && !drawOffered) {
      socket.emit("offerDraw", gameId);
      setDrawOffered(true);
      pushToast("Oferta de tablas enviada al oponente", "success");
    }
  };

  const handleAcceptDraw = () => {
    if (isLeavingGame) return;

    const socket = getSocket();
    if (socket && drawOfferFrom) {
      socket.emit("acceptDraw", gameId);
      setDrawOfferFrom(null);
    }
  };

  const handleDeclineDraw = () => {
    if (isLeavingGame) return;

    const socket = getSocket();
    if (socket) {
      socket.emit("declineDraw", gameId);
    }
    setDrawOfferFrom(null);
  };

  const handleLeave = async () => {
    const action: ExitAction = status === "waiting" ? "cancel" : "resign";
    await requestLeaveWithConfirmation(action);
  };

  const handleSendMessage = () => {
    if (isLeavingGame) return;

    const text = chatInput.trim();
    if (!text) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("chatMessage", { gameId, message: text });

    setMessages((prev) => [
      ...prev.slice(-49),
      {
        userId: user?.id || "",
        username: user?.username || "",
        message: text,
        timestamp: new Date().toISOString(),
      },
    ]);

    setChatInput("");
  };

  const handleExportTxt = () => {
    exportGameTxt({
      profileName: user?.username || "Jugador",
      mode,
      status,
      playerColor,
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
        <div className="text-xl">Cargando partida online...</div>
      </div>
    );
  }

  // Construir acciones del header
  const headerActions = [];

  if (status === "active" && hasOpponent) {
    headerActions.push({
      label: drawOffered ? "Oferta Enviada" : "Ofrecer Tablas",
      onClick: handleOfferDraw,
      variant: "secondary" as const,
      disabled: drawOffered || isLeavingGame,
    });
    headerActions.push({
      label: isLeavingGame ? "Confirmando..." : "Rendirse",
      onClick: handleResign,
      variant: "danger" as const,
      disabled: isLeavingGame,
    });
  }

  headerActions.push({
    label: boardView === "3d" ? "Vista 2D" : "Vista 3D",
    onClick: () => setBoardView(boardView === "3d" ? "2d" : "3d"),
    variant: "secondary" as const,
  });

  headerActions.push({
    label:
      boardView === "2d"
        ? `Tema 2D: ${board2DThemeLabels[board2DTheme]}`
        : `Tema 3D: ${board3DThemeLabels[board3DTheme]}`,
    onClick: boardView === "2d" ? cycleBoard2DTheme : cycleBoard3DTheme,
    variant: "secondary" as const,
  });

  headerActions.push({
    label: "Descargar TXT",
    onClick: handleExportTxt,
    variant: "primary" as const,
    disabled: isLeavingGame,
  });

  headerActions.push({
    label: isLeavingGame
      ? "Confirmando..."
      : status === "waiting"
        ? "Cancelar"
        : "Salir",
    onClick: handleLeave,
    variant: "secondary" as const,
    disabled: isLeavingGame,
  });

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
            <Button onClick={handleAcceptDraw} disabled={isLeavingGame}>
              ✓ Aceptar Tablas
            </Button>
            <Button
              variant="danger"
              onClick={handleDeclineDraw}
              disabled={isLeavingGame}
            >
              ✗ Rechazar
            </Button>
          </div>
        </div>
      )}

      {/* Banner de espera */}
      {!hasOpponent && status === "waiting" && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-gray-800 border border-yellow-200 rounded text-center">
          <p className="text-yellow-800 font-medium mb-2">
            ⏳ Esperando que se una un oponente...
          </p>
          <p className="text-sm text-gray-600">
            Comparte este link con tu oponente:
          </p>
          <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border">
            <code className="text-sm">{window.location.href}</code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              pushToast("Link copiado", "success");
            }}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            📋 Copiar link
          </button>
        </div>
      )}

      <div className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
        <h3 className="font-bold mb-2 text-gray-900 dark:text-gray-100">
          Chat
        </h3>
        <div className="h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded p-2 mb-2 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500">Sin mensajes todavía.</p>
          ) : (
            messages.map((m, idx) => (
              <div key={`${m.timestamp}-${idx}`} className="text-sm mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {m.username}:{" "}
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  {m.message}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
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
