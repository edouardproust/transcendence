import { ChessClient } from '@/engine/chessClient';

export interface ParsedPiece {
  square: string;
  piece: string;
}

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

const files = 'abcdefgh';

export const parseFenPieces = (fen: string): ParsedPiece[] => {
  const [placement] = fen.split(' ');
  if (!placement) return [];

  const rows = placement.split('/');
  const pieces: ParsedPiece[] = [];

  rows.forEach((row, rowIndex) => {
    let fileIndex = 0;
    for (const char of row) {
      const digit = Number(char);
      if (!Number.isNaN(digit)) {
        fileIndex += digit;
        continue;
      }

      const file = files[fileIndex];
      const rank = 8 - rowIndex;
      if (file) {
        pieces.push({ square: `${file}${rank}`, piece: char });
      }
      fileIndex += 1;
    }
  });

  return pieces;
};

export const squareToWorld = (square: string): [number, number, number] => {
  const fileIndex = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const x = fileIndex - 3.5;
  const z = 4.5 - rank;
  return [x, 0, z];
};

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

export const getPieceColor = (piece: string): 'white' | 'black' => {
  if (piece.startsWith('w')) return 'white';
  if (piece.startsWith('b')) return 'black';
  const symbol = piece.length === 2 ? piece[1] : piece[0];
  return symbol === symbol.toUpperCase() ? 'white' : 'black';
};

export const isOwnPiece = (
  pieceSymbol: string,
  playerColor: 'white' | 'black' | null,
): boolean => {
  if (!playerColor) return false;
  const white = pieceSymbol === pieceSymbol.toUpperCase();
  return (playerColor === 'white' && white) || (playerColor === 'black' && !white);
};

export const validPromotionPieces = new Set(['q', 'r', 'b', 'n']);

export const parsePromotionPiece = (selectedPiece?: string): string | undefined => {
  if (!selectedPiece) return undefined;
  const promotionSymbol =
    selectedPiece.length === 2 && (selectedPiece[0] === 'w' || selectedPiece[0] === 'b')
      ? selectedPiece[1]
      : selectedPiece[0];
  const normalized = promotionSymbol?.toLowerCase();
  return normalized && validPromotionPieces.has(normalized) ? normalized : undefined;
};

export const getCheckedKingSquare = (
  chess: ChessClient | null,
  turn: string,
): string | null => {
  if (!chess?.inCheck()) return null;

  const kingSymbol = turn === 'w' ? 'K' : 'k';

  for (let rank = 1; rank <= 8; rank += 1) {
    for (const file of files) {
      const square = `${file}${rank}`;
      if (chess.getPiece(square) === kingSymbol) {
        return square;
      }
    }
  }

  return null;
};

export const buildLastMoveStyles = (
  lastMove: { from: string; to: string } | null,
): Record<string, React.CSSProperties> => {
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

export const buildCheckStyles = (
  checkedKingSquare: string | null,
): Record<string, React.CSSProperties> => {
  if (!checkedKingSquare) return {};
  return {
    [checkedKingSquare]: {
      backgroundColor: 'rgba(239, 68, 68, 0.72)',
      boxShadow: 'inset 0 0 0 3px rgba(127, 29, 29, 0.72)',
    },
  };
};

export const isMyTurn = (
  mode: 'ai' | 'online' | null,
  playerColor: 'white' | 'black' | null,
  turn: string,
): boolean => {
  if (!playerColor) return false;
  if (mode === 'ai' || mode === 'online') {
    return (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black');
  }
  return false;
};
