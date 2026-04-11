import { useEffect, useRef } from "react";
import { PlayerColor } from "@/types/game";
import { useGameStore } from "@/features/game/gameStore";
import { pushToast } from "@/components/ui/ToastProvider";

interface UseCheckAlertOptions {
  status: string;
  fen: string;
  turn: string;
  humanColor: PlayerColor;
}

export const useCheckAlert = ({ status, fen, turn, humanColor }: UseCheckAlertOptions) => {
  const lastCheckAlertKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "active") {
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
    if (lastCheckAlertKeyRef.current === key) return;

    lastCheckAlertKeyRef.current = key;
    const humanSide = humanColor === "white" ? "w" : "b";
    pushToast(
      checkedSide === humanSide ? "⚠️ Jaque a tu rey" : "⚠️ Has puesto en jaque a la IA",
      "info",
    );
  }, [status, fen, turn, humanColor]);
};