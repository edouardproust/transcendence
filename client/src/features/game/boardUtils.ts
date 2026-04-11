import type { CSSProperties } from 'react';
import { ChessClient } from '@/engine/chessClient';
import {
  Board2DTheme,
  Board3DTheme,
  BoardViewMode,
  Move,
  PlayerColor,
} from '@/types/game';

export const BOARD_2D_THEME_ORDER: Board2DTheme[] = ['classic', 'wood', 'ocean', 'slate'];
export const BOARD_3D_THEME_ORDER: Board3DTheme[] = ['wood', 'obsidian'];
export const BOARD_VIEW_MODES: BoardViewMode[] = ['2d', '3d'];

export const BOARD_2D_THEMES: Record<
  Board2DTheme,
  { light: string; dark: string; border: string; shadow: string }
> = {
  classic: {
    light: '#f0d9b5',
    dark: '#b58863',
    border: '#5b3f2f',
    shadow: '0 8px 18px rgba(0, 0, 0, 0.2)',
  },
  wood: {
    light: '#f3e2c3',
    dark: '#8d5f3a',
    border: '#4d3018',
    shadow: '0 12px 22px rgba(59, 35, 16, 0.35)',
  },
  ocean: {
    light: '#d9f1ff',
    dark: '#3b82a8',
    border: '#174a63',
    shadow: '0 10px 20px rgba(23, 74, 99, 0.32)',
  },
  slate: {
    light: '#d8dde6',
    dark: '#4b5563',
    border: '#1f2937',
    shadow: '0 10px 22px rgba(17, 24, 39, 0.33)',
  },
};

export interface Board3DPalette {
  sceneBg: string;
  frameOuter: string;
  frameInner: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquare: string;
  legalTargetSquare: string;
  lastMoveFromSquare: string;
  lastMoveToSquare: string;
  checkSquare: string;
  floor: string;
}

export const BOARD_3D_PALETTES: Record<Board3DTheme, Board3DPalette> = {
  wood: {
    sceneBg: '#f4f1ea',
    frameOuter: '#6b4423',
    frameInner: '#d3a873',
    lightSquare: '#f3e1c8',
    darkSquare: '#8b5e34',
    selectedSquare: '#f59e0b',
    legalTargetSquare: '#7dd3fc',
    lastMoveFromSquare: '#fbbf24',
    lastMoveToSquare: '#22c55e',
    checkSquare: '#ef4444',
    floor: '#8d7b69',
  },
  obsidian: {
    sceneBg: '#e5e7eb',
    frameOuter: '#3b414d',
    frameInner: '#8b95a6',
    lightSquare: '#dbe3ef',
    darkSquare: '#374151',
    selectedSquare: '#fbbf24',
    legalTargetSquare: '#86efac',
    lastMoveFromSquare: '#f59e0b',
    lastMoveToSquare: '#16a34a',
    checkSquare: '#ef4444',
    floor: '#9ca3af',
  },
};

export const BOARD_FILES = 'abcdefgh';

export type PromotionChoice = 'q' | 'r' | 'b' | 'n';
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface ParsedPiece {
  square: string;
  piece: string;
}

interface BoardSquare {
  square: string;
  pos: [number, number, number];
  light: boolean;
}

const validPromotionPieces = new Set<PromotionChoice>(['q', 'r', 'b', 'n']);

export const promotionOptions: Array<{ value: PromotionChoice; label: string }> = [
  { value: 'q', label: 'Reina' },
  { value: 'r', label: 'Torre' },
  { value: 'b', label: 'Alfil' },
  { value: 'n', label: 'Caballo' },
];

export const getBoardOrientation = (playerColor: PlayerColor | null): 'white' | 'black' =>
  playerColor === 'black' ? 'black' : 'white';

export const isPlayerTurn = (turn: 'w' | 'b', playerColor: PlayerColor | null) => {
  if (!playerColor) return false;
  return (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black');
};

export const getPieceColor = (piece: string): 'white' | 'black' => {
  if (piece.startsWith('w')) return 'white';
  if (piece.startsWith('b')) return 'black';
  const symbol = piece.length === 2 ? piece[1] : piece[0];
  return symbol === symbol.toUpperCase() ? 'white' : 'black';
};

export const parsePromotionPiece = (selectedPiece?: string): PromotionChoice | undefined => {
  if (!selectedPiece) return undefined;

  const promotionSymbol =
    selectedPiece.length === 2 && (selectedPiece[0] === 'w' || selectedPiece[0] === 'b')
      ? selectedPiece[1]
      : selectedPiece[0];
  const normalized = promotionSymbol?.toLowerCase() as PromotionChoice | undefined;

  return normalized && validPromotionPieces.has(normalized) ? normalized : undefined;
};

export const requiresPromotion = (pieceSymbol?: string | null, targetSquare?: string) => {
  if (!pieceSymbol || !targetSquare) return false;
  const isPawn = pieceSymbol.toLowerCase() === 'p';
  const reachesBackRank = targetSquare[1] === '1' || targetSquare[1] === '8';
  return isPawn && reachesBackRank;
};

export const findCheckedKingSquare = (chess: ChessClient | null, turn: 'w' | 'b') => {
  if (!chess?.inCheck()) return null;

  const kingSymbol = turn === 'w' ? 'K' : 'k';
  for (let rank = 1; rank <= 8; rank += 1) {
    for (const file of BOARD_FILES) {
      const square = `${file}${rank}`;
      if (chess.getPiece(square) === kingSymbol) {
        return square;
      }
    }
  }

  return null;
};

export const getLastMoveStyles = (lastMove?: Move | null): Record<string, CSSProperties> => {
  if (!lastMove?.from || !lastMove?.to) return {};

  return {
    [lastMove.from]: {
      backgroundColor: 'rgba(251, 191, 36, 0.45)',
      boxShadow: 'inset 0 0 0 2px rgba(146, 64, 14, 0.45)',
    },
    [lastMove.to]: {
      backgroundColor: 'rgba(34, 197, 94, 0.45)',
      boxShadow: 'inset 0 0 0 2px rgba(21, 128, 61, 0.5)',
    },
  };
};

export const getCheckStyles = (checkedKingSquare: string | null): Record<string, CSSProperties> =>
  checkedKingSquare
    ? {
        [checkedKingSquare]: {
          backgroundColor: 'rgba(239, 68, 68, 0.72)',
          boxShadow: 'inset 0 0 0 3px rgba(127, 29, 29, 0.72)',
        },
      }
    : {};

export const parseFenPieces = (fen: string): ParsedPiece[] => {
  const [placement] = fen.split(' ');
  if (!placement) return [];

  return placement.split('/').flatMap((row, rowIndex) => {
    let fileIndex = 0;
    const pieces: ParsedPiece[] = [];

    for (const char of row) {
      const digit = Number(char);
      if (!Number.isNaN(digit)) {
        fileIndex += digit;
        continue;
      }

      const file = BOARD_FILES[fileIndex];
      const rank = 8 - rowIndex;
      if (file) {
        pieces.push({ square: `${file}${rank}`, piece: char });
      }
      fileIndex += 1;
    }

    return pieces;
  });
};

export const squareToWorld = (square: string): [number, number, number] => {
  const fileIndex = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return [fileIndex - 3.5, 0, 4.5 - rank];
};

export const BOARD_3D_SQUARES: BoardSquare[] = Array.from({ length: 8 }, (_, rankIndex) =>
  Array.from({ length: 8 }, (_, fileIndex) => {
    const rank = rankIndex + 1;
    const square = `${BOARD_FILES[fileIndex]}${rank}`;
    return {
      square,
      pos: squareToWorld(square),
      light: (fileIndex + rank) % 2 === 0,
    };
  })
).flat();

export const pieceTypeFromSymbol = (piece: string): PieceType => {
  switch (piece.toLowerCase()) {
    case 'p':
      return 'pawn';
    case 'r':
      return 'rook';
    case 'n':
      return 'knight';
    case 'b':
      return 'bishop';
    case 'q':
      return 'queen';
    case 'k':
    default:
      return 'king';
  }
};

export const isOwnPiece = (pieceSymbol: string, playerColor: PlayerColor | null) => {
  if (!playerColor) return false;
  const white = pieceSymbol === pieceSymbol.toUpperCase();
  return (playerColor === 'white' && white) || (playerColor === 'black' && !white);
};
