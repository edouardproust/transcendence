import { useRef } from "react";
import { PlayerColor } from "@/types/game";
import { useGameStore } from "@/features/game/gameStore";
import { gameService } from "@/services/gameService";
import { pushToast } from "@/components/ui/ToastProvider";
import { getApiErrorMessage } from "@/utils/apiError";
import { appendPgnResultToken } from "@/features/game/utils/aiGameUtils";

interface UseAiGameResultOptions {
  humanColor: PlayerColor;
  userId: string | null | undefined;
}

export const useAiGameResult = ({ humanColor, userId }: UseAiGameResultOptions) => {
  const { endGame } = useGameStore();
  const gameEndAlertShownRef = useRef(false);
  const gameResultPersistedRef = useRef(false);

  const resetResultRefs = () => {
    gameEndAlertShownRef.current = false;
    gameResultPersistedRef.current = false;
  };

  const persistResult = async (
    gameId: string,
    fen: string,
    pgn: string,
    winnerId: string | null,
    resultToken: "1-0" | "0-1" | "1/2-1/2",
  ) => {
    if (gameResultPersistedRef.current) return;
    gameResultPersistedRef.current = true;

    try {
      await gameService.finishGame(gameId, {
        winnerId,
        currentFen: fen,
        pgn: appendPgnResultToken(pgn, resultToken),
      });
    } catch (error) {
      gameResultPersistedRef.current = false;
      console.error("[AIGame] Error saving game result:", error);
      pushToast(
        getApiErrorMessage(error, "La partida terminó, pero no se pudo guardar el resultado."),
        "error",
      );
    }
  };

  const finalizeIfGameOver = (): boolean => {
    const state = useGameStore.getState();
    const chess = state.chess;
    if (!chess || !chess.isGameOver()) return false;

    let message = "Partida finalizada.";
    let winnerId: string | null = null;
    let resultToken: "1-0" | "0-1" | "1/2-1/2" = "1/2-1/2";

    if (chess.isCheckmate()) {
      const humanSide = humanColor === "white" ? "w" : "b";
      const aiSide = humanSide === "w" ? "b" : "w";
      const loserSide = chess.turn();
      const playerWon = loserSide === aiSide;
      winnerId = playerWon ? userId || null : null;
      resultToken = playerWon
        ? humanColor === "white" ? "1-0" : "0-1"
        : humanColor === "white" ? "0-1" : "1-0";
      message = playerWon ? "♔ Jaque mate. Ganaste a la IA." : "♚ Jaque mate. Ganó la IA.";
    } else if (chess.isDraw() || chess.isStalemate()) {
      message = "Tablas. No hay ganador.";
    }

    if (!gameEndAlertShownRef.current) {
      pushToast(message, winnerId ? "success" : resultToken === "1/2-1/2" ? "info" : "error");
      gameEndAlertShownRef.current = true;
    }

    if (state.gameId) {
      void persistResult(state.gameId, state.fen, state.pgn, winnerId, resultToken);
    }

    endGame();
    return true;
  };

  const handleResign = async () => {
    const state = useGameStore.getState();
    endGame();

    if (state.gameId) {
      await persistResult(
        state.gameId,
        state.fen,
        state.pgn,
        null,
        humanColor === "white" ? "0-1" : "1-0",
      );
    }
  };

  return { finalizeIfGameOver, handleResign, resetResultRefs };
};