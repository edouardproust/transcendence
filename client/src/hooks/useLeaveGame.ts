import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/engine/socket";
import { gameService } from "@/services/gameService";
import { pushToast } from "@/components/ui/ToastProvider";
import {
  ExitAction,
  emitExitAction,
  getOrCreateSocket,
  getSocketErrorMessage,
} from "@/features/game/utils/socketUtils";
import { useGameStore } from "@/features/game/gameStore";

interface UseLeaveGameOptions {
  gameId: string;
  token: string | null | undefined;
  status: string;
  hasOpponent: boolean;
}

export const useLeaveGame = ({
  gameId,
  token,
  status,
  hasOpponent,
}: UseLeaveGameOptions) => {
  const navigate = useNavigate();
  const { reset } = useGameStore();
  const [isLeavingGame, setIsLeavingGame] = useState(false);
  const isMountedRef = useRef(true);
  const activeLeaveWaitCleanupRef = useRef<(() => void) | null>(null);

  const setMounted = (value: boolean) => {
    isMountedRef.current = value;
  };

  const cleanup = () => {
    activeLeaveWaitCleanupRef.current?.();
    activeLeaveWaitCleanupRef.current = null;
  };

  const waitForBackendExitConfirmation = (
    action: ExitAction,
    socket: ReturnType<typeof getSocket>,
    actionAlreadyEmitted: boolean,
  ) =>
    new Promise<{
      ok: boolean;
      message?: string;
      alreadyNotified?: boolean;
      resolvedStatus?: "cancelled" | "finished";
    }>((resolve) => {
      let settled = false;
      let pollInFlight = false;
      let actionEmitted = actionAlreadyEmitted;
      let socketErrorMessage: string | null = null;
      let pollTimer: number | null = null;
      let timeoutTimer: number | null = null;

      const tryEmit = () => {
        if (settled || actionEmitted) return;
        if (!emitExitAction(action, socket, gameId)) return;
        actionEmitted = true;
      };

      const teardown = () => {
        if (pollTimer !== null) window.clearInterval(pollTimer);
        if (timeoutTimer !== null) window.clearTimeout(timeoutTimer);
        socket?.off("connect", handleSocketConnect);
        socket?.off("error", handleSocketError);
        socket?.off("gameCancelled", handleGameCancelled);
        socket?.off("gameEnd", handleGameEnd);
        if (activeLeaveWaitCleanupRef.current === teardown) {
          activeLeaveWaitCleanupRef.current = null;
        }
      };

      const finish = (result: {
        ok: boolean;
        message?: string;
        alreadyNotified?: boolean;
        resolvedStatus?: "cancelled" | "finished";
      }) => {
        if (settled) return;
        settled = true;
        teardown();
        resolve(result);
      };

      const handleSocketConnect = () => tryEmit();

      const handleSocketError = (payload: unknown) => {
        const message = getSocketErrorMessage(payload);
        if (!message) return;
        socketErrorMessage = message;
        if (action === "cancel" && message === "Cannot cancel a started game") {
          finish({ ok: false, message, alreadyNotified: true });
        }
      };

      const handleGameCancelled = () =>
        finish({ ok: true, resolvedStatus: "cancelled" });

      const handleGameEnd = () => {
        if (action === "resign" || action === "cancel") {
          finish({ ok: true, resolvedStatus: "finished" });
        }
      };

      const pollGameStatus = async () => {
        if (pollInFlight || settled) return;
        pollInFlight = true;
        try {
          const game = await gameService.getGame(gameId);

          if (action === "cancel") {
            if (game.status === "cancelled") {
              finish({ ok: true, resolvedStatus: "cancelled" });
              return;
            }
            if (game.status === "finished") {
              finish({ ok: true, resolvedStatus: "finished" });
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
            finish({
              ok: true,
              resolvedStatus:
                game.status === "cancelled" ? "cancelled" : "finished",
            });
          }
        } catch (error: any) {
          const message = error.response?.data?.message;
          if (
            typeof message === "string" &&
            message.toLowerCase().includes("not found")
          ) {
            finish({ ok: false, message: "La partida ya no está disponible." });
          }
        } finally {
          pollInFlight = false;
        }
      };

      socket?.on("connect", handleSocketConnect);
      socket?.on("error", handleSocketError);
      socket?.on("gameCancelled", handleGameCancelled);
      socket?.on("gameEnd", handleGameEnd);

      activeLeaveWaitCleanupRef.current = teardown;
      tryEmit();
      void pollGameStatus();
      pollTimer = window.setInterval(() => void pollGameStatus(), 400);
      timeoutTimer = window.setTimeout(() => {
        finish({
          ok: false,
          message:
            "No se pudo confirmar el estado con el servidor. Inténtalo de nuevo.",
        });
      }, 5000);
    });

  const requestLeaveWithConfirmation = async (
    action: ExitAction,
    options?: { navigateOnSuccess?: boolean },
  ) => {
    const shouldNavigate = options?.navigateOnSuccess ?? true;
    if (isLeavingGame) return;

    const socket = getOrCreateSocket(token);
    if (!socket) {
      pushToast("No se pudo contactar el servidor. Inténtalo de nuevo.", "error");
      return;
    }

    setIsLeavingGame(true);

    try {
      const actionEmitted = emitExitAction(action, socket, gameId);
      const result = await waitForBackendExitConfirmation(
        action,
        socket,
        actionEmitted,
      );

      if (!isMountedRef.current) return;

      if (!result.ok) {
        if (!result.alreadyNotified) {
          pushToast(result.message || "No se pudo salir de la partida.", "error");
        }
        return;
      }

      if (result.resolvedStatus === "cancelled") {
        reset();
        if (shouldNavigate) navigate("/lobby");
      } else if (result.resolvedStatus === "finished") {
        if (shouldNavigate) navigate("/lobby");
      }
    } finally {
      if (isMountedRef.current) setIsLeavingGame(false);
    }
  };

  const handleResign = async () => {
    if (status !== "active" || !hasOpponent) return;
    await requestLeaveWithConfirmation("resign", { navigateOnSuccess: false });
  };

  const handleLeave = async () => {
    if (status === "finished" || status === "cancelled") {
      reset();
      navigate("/lobby");
      return;
    }
    const action: ExitAction = status === "waiting" ? "cancel" : "resign";
    await requestLeaveWithConfirmation(action, { navigateOnSuccess: true });
  };

  return {
    isLeavingGame,
    setMounted,
    cleanup,
    handleResign,
    handleLeave,
  };
};