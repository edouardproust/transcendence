import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from './gameStore';
import { Move } from '@/types/game';

interface BoardProps {
  onMove: (move: Move) => boolean;
}

export const Board: React.FC<BoardProps> = ({ onMove }) => {
  const { gameId, fen, playerColor, mode, turn, status, boardView, board2DTheme, board3DTheme, chess, lastMove } =
    useGameStore();
  const validPromotionPieces = new Set(['q', 'r', 'b', 'n']);
  const pendingPromotionRef = React.useRef<string | undefined>(undefined);

  const getPieceColor = (piece: string): 'white' | 'black' => {
    // react-chessboard can provide "wP"/"bP" or plain FEN-style symbols ("P"/"p")
    if (piece.startsWith('w')) return 'white';
    if (piece.startsWith('b')) return 'black';
    const symbol = piece.length === 2 ? piece[1] : piece[0];
    return symbol === symbol.toUpperCase() ? 'white' : 'black';
  };

  // Verificar si es el turno del jugador
  const isMyTurn = () => {
    if (mode === 'ai') {
      if (!playerColor) return false;
      return (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black');
    }
    if (mode === 'online') {
      if (!playerColor) return false;
      return (turn === 'w' && playerColor === 'white') || (turn === 'b' && playerColor === 'black');
    }
    return false;
  };

  // Verificar si el juego está listo para jugar
  const canPlay = status === 'active' && isMyTurn();
  const chessboardKey = `chessboard-${gameId ?? 'none'}-${playerColor ?? 'none'}-${status}-${canPlay ? 'play' : 'wait'}`;
  const lastMoveStyles = React.useMemo<Record<string, React.CSSProperties>>(() => {
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
  }, [lastMove]);

  const getLegalTargets = (square: string) => {
    if (!chess) return [];
    return chess.getLegalTargets(square);
  };

  const parsePromotionPiece = (selectedPiece?: string): string | undefined => {
    if (!selectedPiece) return undefined;
    const promotionSymbol =
      selectedPiece.length === 2 && (selectedPiece[0] === 'w' || selectedPiece[0] === 'b')
        ? selectedPiece[1]
        : selectedPiece[0];
    const normalized = promotionSymbol?.toLowerCase();
    return normalized && validPromotionPieces.has(normalized) ? normalized : undefined;
  };

  const handlePromotionPieceSelect = (piece?: string): boolean => {
    pendingPromotionRef.current = parsePromotionPiece(piece);
    return true;
  };

  const handlePieceDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece?: string
  ): boolean => {
    if (!canPlay) {
      return false; // Bloquear el movimiento si no es tu turno
    }

    const legalTargets = getLegalTargets(sourceSquare);
    if (!legalTargets.includes(targetSquare)) {
      return false;
    }

    const sourcePiece = chess?.getPiece(sourceSquare);
    const isPawn = sourcePiece?.toLowerCase() === 'p';
    const reachesBackRank = targetSquare[1] === '1' || targetSquare[1] === '8';

    let promotion: string | undefined;
    if (isPawn && reachesBackRank) {
      promotion = pendingPromotionRef.current || parsePromotionPiece(piece) || 'q';
    }

    const move: Move = {
      from: sourceSquare,
      to: targetSquare,
      promotion,
    };

    const moved = onMove(move);
    if (isPawn && reachesBackRank) {
      pendingPromotionRef.current = undefined;
    }
    return moved;
  };

  return (
    <div
      className={`w-full mx-auto ${
        boardView === '3d'
          ? `max-w-4xl board-3d-stage board-3d-stage--${board3DTheme}`
          : 'max-w-2xl'
      }`}
    >
      {!canPlay && status === 'active' && (
        <div className="mb-3 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-600 rounded text-center">
          <p className="text-blue-800 dark:text-blue-200 font-medium">
            {mode === 'online' ? '⏳ Esperando el turno del oponente...' : '⏳ La IA está pensando...'}
          </p>
        </div>
      )}
      
      {status === 'waiting' && (
        <div className="mb-3 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 rounded text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            ⏳ Esperando que se una un oponente...
          </p>
        </div>
      )}

        <Chessboard
          key={chessboardKey}
          position={fen}
          onPieceDrop={handlePieceDrop}
          onPromotionPieceSelect={handlePromotionPieceSelect}
          autoPromoteToQueen={false}
          boardOrientation={playerColor === 'black' ? 'black' : 'white'}
          arePiecesDraggable={canPlay}
          isDraggablePiece={({ piece, sourceSquare }) => {
            if (!canPlay || !piece || !sourceSquare) return false;
            const pieceColor = getPieceColor(piece);
            const isMyPiece =
              (playerColor === 'white' && pieceColor === 'white') ||
              (playerColor === 'black' && pieceColor === 'black');
            if (!isMyPiece) return false;
            return getLegalTargets(sourceSquare).length > 0;
          }}

          customSquareStyles={lastMoveStyles}
          
        />

    </div>
  );
};
