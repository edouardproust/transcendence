import React from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from './gameStore';
import { Move } from '@/types/game';
import { Board3D } from './components/Board3D';
import { WaitingBanner } from './components/WaitingBanner';
import {
  board2DThemes,
  getPieceColor,
  getCheckedKingSquare,
  buildLastMoveStyles,
  buildCheckStyles,
  isMyTurn,
  parsePromotionPiece,
} from './utils';

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

  const canPlay = status === 'active' && isMyTurn(mode, playerColor, turn);
  const chessboardKey = `chessboard-${gameId ?? 'none'}-${playerColor ?? 'none'}-${status}-${canPlay ? 'play' : 'wait'}`;
  const active2DTheme = board2DThemes[board2DTheme];
  const checkedKingSquare = React.useMemo(
    () => getCheckedKingSquare(chess, turn),
    [chess, fen, turn],
  );
  const lastMoveStyles = React.useMemo(
    () => buildLastMoveStyles(lastMove),
    [lastMove],
  );
  const checkStyles = React.useMemo(
    () => buildCheckStyles(checkedKingSquare),
    [checkedKingSquare],
  );

  const getLegalTargets = (square: string) => {
    if (!chess) return [];
    return chess.getLegalTargets(square);
  };

  const handlePromotionPieceSelect = (piece?: string): boolean => {
    pendingPromotionRef.current = parsePromotionPiece(piece);
    return true;
  };

  const handlePieceDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece?: string,
  ): boolean => {
    if (!canPlay) {
      return false;
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
      {status === 'waiting' && <WaitingBanner />}

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
