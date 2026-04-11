import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Board3DTheme, Move } from '@/types/game';
import { parseFenPieces, isOwnPiece } from '../utils';
import { PromotionModal } from './PromotionModal';
import { Board3DScene } from './Board3DScene';
import { board3DPalettes } from '../utils';

interface Board3DProps {
  fen: string;
  boardOrientation: 'white' | 'black';
  canPlay: boolean;
  playerColor: 'white' | 'black' | null;
  lastMove?: Move | null;
  checkedKingSquare?: string | null;
  theme: Board3DTheme;
  onMove: (move: Move) => boolean;
  getLegalTargets: (square: string) => string[];
}

type PromotionChoice = 'q' | 'r' | 'b' | 'n';

export const Board3D: React.FC<Board3DProps> = ({
  fen,
  boardOrientation,
  canPlay,
  playerColor,
  lastMove,
  checkedKingSquare = null,
  theme,
  onMove,
  getLegalTargets,
}) => {
  const palette = board3DPalettes[theme];
  const pieces = useMemo(() => parseFenPieces(fen), [fen]);
  const pieceMap = useMemo(() => {
    const map = new Map<string, string>();
    pieces.forEach((p) => map.set(p.square, p.piece));
    return map;
  }, [pieces]);

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);

  const clearSelection = () => {
    setSelectedSquare(null);
    setLegalTargets([]);
  };

  React.useEffect(() => {
    clearSelection();
    setPendingPromotion(null);
  }, [fen]);

  const handlePromotionSelection = (promotion: PromotionChoice) => {
    if (!pendingPromotion) return;

    const moved = onMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion,
    });

    if (moved) {
      clearSelection();
    }

    setPendingPromotion(null);
  };

  const cancelPromotionSelection = () => {
    setPendingPromotion(null);
    clearSelection();
  };

  const handleSquareClick = (square: string) => {
    if (!canPlay || pendingPromotion) return;

    const clickedPiece = pieceMap.get(square);

    if (!selectedSquare) {
      if (clickedPiece && isOwnPiece(clickedPiece, playerColor)) {
        setSelectedSquare(square);
        setLegalTargets(getLegalTargets(square));
      }
      return;
    }

    if (square === selectedSquare) {
      clearSelection();
      return;
    }

    if (clickedPiece && isOwnPiece(clickedPiece, playerColor)) {
      setSelectedSquare(square);
      setLegalTargets(getLegalTargets(square));
      return;
    }

    if (legalTargets.includes(square)) {
      const selectedPiece = pieceMap.get(selectedSquare);
      const isPawn = selectedPiece?.toLowerCase() === 'p';
      const targetRank = square[1];
      const requiresPromotion = isPawn && (targetRank === '1' || targetRank === '8');

      if (requiresPromotion) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      const moved = onMove({ from: selectedSquare, to: square });
      if (moved) {
        clearSelection();
      }
      return;
    }

    clearSelection();
  };

  return (
    <div className={`board-3d-container board-3d-container--${theme}`}>
      <Canvas
        shadows
        camera={{ position: [0, 12.2, 13.4], fov: 48 }}
        dpr={[1, 1.6]}
        style={{ width: '100%', height: '700px' }}
      >
        <color attach="background" args={[palette.sceneBg]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          castShadow
          intensity={1.15}
          position={[6, 10, 5]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <hemisphereLight intensity={0.38} groundColor={palette.floor} />

        <Board3DScene
          pieces={pieces}
          selectedSquare={selectedSquare}
          legalTargets={legalTargets}
          lastMoveFrom={lastMove?.from || null}
          lastMoveTo={lastMove?.to || null}
          checkedKingSquare={checkedKingSquare}
          boardOrientation={boardOrientation}
          theme={theme}
          onSquareClick={handleSquareClick}
        />

        <mesh receiveShadow position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[8, 64]} />
          <meshStandardMaterial color={palette.floor} metalness={0} roughness={0.98} />
        </mesh>

        <OrbitControls
          target={[0, 0.25, 0]}
          enablePan={false}
          minDistance={13}
          maxDistance={18}
          minPolarAngle={0.72}
          maxPolarAngle={1.24}
          minAzimuthAngle={-1.15}
          maxAzimuthAngle={1.15}
        />
      </Canvas>

      <PromotionModal
        isOpen={!!pendingPromotion}
        onSelect={handlePromotionSelection}
        onCancel={cancelPromotionSelection}
      />
    </div>
  );
};
