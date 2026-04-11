import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from './gameStore';
import { Move } from '@/types/game';
import { Board3D } from './Board3D';
import {
  BOARD_2D_THEMES,
  findCheckedKingSquare,
  getBoardOrientation,
  getCheckStyles,
  getLastMoveStyles,
  getPieceColor,
  isPlayerTurn,
  parsePromotionPiece,
  requiresPromotion,
} from './boardUtils';

interface BoardProps {
  onMove: (move: Move) => boolean;
}

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
  const pendingPromotionRef = React.useRef<string | undefined>(undefined);
  const canPlay = status === 'active' && isPlayerTurn(turn, playerColor);
  const chessboardKey = `chessboard-${gameId ?? 'none'}-${playerColor ?? 'none'}-${status}-${canPlay ? 'play' : 'wait'}`;
  const active2DTheme = BOARD_2D_THEMES[board2DTheme];
  const boardOrientation = getBoardOrientation(playerColor);
  const checkedKingSquare = React.useMemo(() => findCheckedKingSquare(chess, turn), [chess, fen, turn]);
  const lastMoveStyles = React.useMemo(() => getLastMoveStyles(lastMove), [lastMove]);
  const checkStyles = React.useMemo(() => getCheckStyles(checkedKingSquare), [checkedKingSquare]);
  const getLegalTargets = React.useCallback(
    (square: string) => (chess ? chess.getLegalTargets(square) : []),
    [chess]
  );

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

    let promotion: string | undefined;
    if (requiresPromotion(sourcePiece, targetSquare)) {
      promotion = pendingPromotionRef.current || parsePromotionPiece(piece) || 'q';
    }

    const move: Move = {
      from: sourceSquare,
      to: targetSquare,
      promotion,
    };

    const moved = onMove(move);
    if (requiresPromotion(sourcePiece, targetSquare)) {
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
          boardOrientation={boardOrientation}
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
          boardOrientation={boardOrientation}
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
