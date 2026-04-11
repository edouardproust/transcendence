import { Move } from "@/types/game";
import { PlayerColor } from "@/types/game";

export const FILES = "abcdefgh";
export const RANKS = "12345678";
export const PROMOTION_OPTIONS: Array<"q" | "r" | "b" | "n"> = ["q", "r", "b", "n"];
export const AI_LEVEL_STORAGE_PREFIX = "ai-level:";

export const normalizePlayerColor = (value: string | null | undefined): PlayerColor =>
  value === "black" ? "black" : "white";

export const normalizeAiLevel = (value: string | null | undefined): number => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (Number.isNaN(parsed)) return 10;
  return Math.max(1, Math.min(20, parsed));
};

export const appendPgnResultToken = (
  pgn: string,
  resultToken: "1-0" | "0-1" | "1/2-1/2",
): string => {
  const trimmed = pgn.trim();
  if (trimmed.endsWith("1-0") || trimmed.endsWith("0-1") || trimmed.endsWith("1/2-1/2")) {
    return trimmed.replace(/(1-0|0-1|1\/2-1\/2)\s*$/, resultToken).trim();
  }
  return trimmed ? `${trimmed} ${resultToken}` : resultToken;
};

export const getAiThinkDelayMs = (level: number): number => {
  const boundedLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const oneThird = (value: number) => Math.max(250, Math.round(value / 3));

  if (boundedLevel === 1) {
    return oneThird(1600 + Math.floor(Math.random() * 900));
  }

  const baseMs = 1300 + boundedLevel * 150;
  const jitterMs = Math.floor(Math.random() * 1200);
  return oneThird(Math.min(5600, baseMs + jitterMs));
};

export const getRandomAiMove = (chess: any, aiTurn: "w" | "b"): Move | null => {
  const candidates: Move[] = [];

  for (const file of FILES) {
    for (const rank of RANKS) {
      const from = `${file}${rank}`;
      const piece = chess.getPiece(from);
      if (!piece) continue;

      const pieceSide: "w" | "b" = piece === piece.toUpperCase() ? "w" : "b";
      if (pieceSide !== aiTurn) continue;

      const targets = chess.getLegalTargets(from);
      for (const to of targets) {
        const isPromotion =
          piece.toLowerCase() === "p" && (to[1] === "1" || to[1] === "8");
        const promotion = isPromotion
          ? PROMOTION_OPTIONS[Math.floor(Math.random() * PROMOTION_OPTIONS.length)]
          : undefined;
        candidates.push({ from, to, promotion });
      }
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
};