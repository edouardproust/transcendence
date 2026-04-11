import { useEffect, useRef, useState } from "react";
import { StockfishEngine } from "@/engine/stockfish";
import { Move, PlayerColor } from "@/types/game";
import { useGameStore } from "@/features/game/gameStore";
import { getAiThinkDelayMs, getRandomAiMove } from "@/features/game/utils/aiGameUtils";

interface UseAiMoveOptions {
  status: string;
  turn: string;
  aiLevel: number;
  humanColor: PlayerColor;
  /** Ref instead of state value — avoids circular dependency with useStockfish */
  stockfishRef: React.MutableRefObject<StockfishEngine | null>;
  onAiMove: (move: Move) => void;
}

export const useAiMove = ({
  status,
  turn,
  aiLevel,
  humanColor,
  stockfishRef,
  onAiMove,
}: UseAiMoveOptions) => {
  const [isAiThinking, setIsAiThinking] = useState(false);
  const pendingAiMoveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiThinkWindowRef = useRef<{ requestedAt: number; minDelayMs: number } | null>(null);

  const clearPendingAiMove = () => {
    if (!pendingAiMoveTimeoutRef.current) return;
    clearTimeout(pendingAiMoveTimeoutRef.current);
    pendingAiMoveTimeoutRef.current = null;
  };

  const applyAiMove = (move: Move) => {
    onAiMove(move);
    setIsAiThinking(false);
    aiThinkWindowRef.current = null;
    pendingAiMoveTimeoutRef.current = null;
  };

  const requestAiMove = () => {
    if (status !== "active" || isAiThinking) return;

    const state = useGameStore.getState();
    const humanTurn = humanColor === "white" ? "w" : "b";
    if (state.turn === humanTurn) return;

    const minDelayMs = getAiThinkDelayMs(aiLevel);
    aiThinkWindowRef.current = { requestedAt: Date.now(), minDelayMs };
    setIsAiThinking(true);

    if (aiLevel <= 1) {
      const randomMove = getRandomAiMove(state.chess, state.turn as "w" | "b");
      if (!randomMove) {
        setIsAiThinking(false);
        aiThinkWindowRef.current = null;
        return;
      }
      clearPendingAiMove();
      pendingAiMoveTimeoutRef.current = setTimeout(() => applyAiMove(randomMove), minDelayMs);
      return;
    }

    const engine = stockfishRef.current;
    if (!engine) {
      setIsAiThinking(false);
      aiThinkWindowRef.current = null;
      return;
    }

    engine.setPosition(state.fen);
    engine.calculateMove(aiLevel);
  };

  // Called by useStockfish's onBestMove callback
  const handleBestMove = (bestMove: string) => {
    const thinkWindow = aiThinkWindowRef.current;
    if (!thinkWindow) return;

    if (!bestMove || bestMove.length < 4 || bestMove === "(none)") {
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
    pendingAiMoveTimeoutRef.current = setTimeout(() => applyAiMove(aiMove), remainingDelay);
  };

  useEffect(() => {
    if (status !== "active") {
      clearPendingAiMove();
      aiThinkWindowRef.current = null;
      setIsAiThinking(false);
      return;
    }
    requestAiMove();
  }, [status, turn, aiLevel, stockfishRef, humanColor, isAiThinking]);

  useEffect(() => {
    return () => {
      clearPendingAiMove();
      aiThinkWindowRef.current = null;
    };
  }, []);

  return { isAiThinking, handleBestMove };
};