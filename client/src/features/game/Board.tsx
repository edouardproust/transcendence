import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from './gameStore';
import { Move } from '@/types/game';
import { Board3D } from './Board3D';

interface BoardProps {
  onMove: (move: Move) => boolean;
}

const board2DThemes = {
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
} as const;

export const Board: React.FC<BoardProps> = ({ onMove }) => {
  const {
    gameId,
    fen,
    playerColor,
    mode,
    turn,
    status,
    boardView,
    board3DTheme,
    board2DTheme,
    chess,
    lastMove,
  } = useGameStore();
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
  const active2DTheme = board2DThemes[board2DTheme];
  const checkedKingSquare = React.useMemo(() => {
    if (!chess?.inCheck()) return null;

    const kingSymbol = turn === 'w' ? 'K' : 'k';
    const files = 'abcdefgh';

    for (let rank = 1; rank <= 8; rank += 1) {
      for (const file of files) {
        const square = `${file}${rank}`;
        if (chess.getPiece(square) === kingSymbol) {
          return square;
        }
      }
    }

    return null;
  }, [chess, fen, turn]);
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
  const checkStyles = React.useMemo<Record<string, React.CSSProperties>>(() => {
    if (!checkedKingSquare) return {};

    return {
      [checkedKingSquare]: {
        backgroundColor: 'rgba(239, 68, 68, 0.72)',
        boxShadow: 'inset 0 0 0 3px rgba(127, 29, 29, 0.72)',
      },
    };
  }, [checkedKingSquare]);

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
      {/* {!canPlay && status === 'active' && (
        <div className="mb-3 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-600 rounded text-center">
          <p className="text-blue-800 dark:text-blue-200 font-medium">
            {mode === 'online' ? '⏳ Esperando el turno del oponente...' : '⏳ La IA está pensando...'}
          </p>
        </div>
      )} */}
      
      {status === 'waiting' && (
        <div className="mb-3 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 rounded text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            ⏳ {mode !== 'ai' ? 'Esperando que se una un oponente...' : 'Elige el nivel de IA...'}
          </p>
        </div>
      )}

      {boardView === '3d' ? (
        <Board3D
          fen={fen}
          boardOrientation={playerColor === 'black' ? 'black' : 'white'}
          canPlay={canPlay}
          playerColor={playerColor}
          lastMove={lastMove}
          checkedKingSquare={checkedKingSquare}
          theme={board3DTheme}
          onMove={onMove}
          getLegalTargets={getLegalTargets}
        />
      ) : (
        <Chessboard
          key={chessboardKey}
          position={fen}
          onPieceDrop={handlePieceDrop}
          onPromotionPieceSelect={handlePromotionPieceSelect}
          autoPromoteToQueen={false}
          boardOrientation={playerColor === 'black' ? 'black' : 'white'}
          customDarkSquareStyle={{ backgroundColor: active2DTheme.dark }}
          customLightSquareStyle={{ backgroundColor: active2DTheme.light }}
          customBoardStyle={{
            borderRadius: '12px',
            border: `6px solid ${active2DTheme.border}`,
            boxShadow: active2DTheme.shadow,
          }}
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

          customSquareStyles={{ ...lastMoveStyles, ...checkStyles }}
        />
      )}
    </div>
  );
};
