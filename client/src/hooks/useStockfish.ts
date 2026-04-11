import { useEffect } from "react";
import { StockfishEngine } from "@/engine/stockfish";
import { pushToast } from "@/components/ui/ToastProvider";

interface UseStockfishOptions {
  stockfishRef: React.MutableRefObject<StockfishEngine | null>;
  onBestMove: (bestMove: string) => void;
}

export const useStockfish = ({ stockfishRef, onBestMove }: UseStockfishOptions) => {
  useEffect(() => {
    const engine = new StockfishEngine();

    engine
      .init()
      .then(() => {
        engine.onBestMove(onBestMove);
        stockfishRef.current = engine;
      })
      .catch((error) => {
        console.error("[AIGame] Stockfish error:", error);
        pushToast("Error al inicializar el motor de IA", "error");
      });

    return () => {
      stockfishRef.current = null;
      engine.terminate();
    };
  }, []);
};