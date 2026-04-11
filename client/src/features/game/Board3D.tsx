import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Board3DTheme, Move } from '@/types/game';
import { Button } from '@/components/ui/Button';
import {
  BOARD_3D_PALETTES,
  BOARD_3D_SQUARES,
  ParsedPiece,
  PromotionChoice,
  isOwnPiece,
  parseFenPieces,
  pieceTypeFromSymbol,
  promotionOptions,
  requiresPromotion,
  squareToWorld,
} from './boardUtils';

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

const pieceMaterialProps = (color: 'white' | 'black', selected: boolean) => {
  if (color === 'white') {
    return {
      color: '#f5f7fb',
      metalness: 0.34,
      roughness: 0.22,
      emissive: selected ? '#f59e0b' : '#000000',
      emissiveIntensity: selected ? 0.2 : 0,
    };
  }
  return {
    color: '#111827',
    metalness: 0.36,
    roughness: 0.28,
    emissive: selected ? '#f59e0b' : '#000000',
    emissiveIntensity: selected ? 0.18 : 0,
  };
};

const accentMaterialProps = (color: 'white' | 'black') => {
  if (color === 'white') {
    return {
      color: '#dbe4f2',
      metalness: 0.3,
      roughness: 0.3,
    };
  }
  return {
    color: '#334155',
    metalness: 0.35,
    roughness: 0.34,
  };
};

const PieceMesh: React.FC<{
  symbol: string;
  position: [number, number, number];
  selected: boolean;
  inCheck: boolean;
  onClick: () => void;
}> = ({ symbol, position, selected, inCheck, onClick }) => {
  const color: 'white' | 'black' = symbol === symbol.toUpperCase() ? 'white' : 'black';
  const type = pieceTypeFromSymbol(symbol);
  const mainMat = pieceMaterialProps(color, selected);
  const accentMat = accentMaterialProps(color);
  const effectiveMainMat = inCheck
    ? {
        ...mainMat,
        color: '#ef4444',
        emissive: '#7f1d1d',
        emissiveIntensity: 0.36,
      }
    : mainMat;

  return (
    <group
      position={[position[0], 0.17, position[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.36, 0.42, 0.1, 28]} />
        <meshStandardMaterial {...effectiveMainMat} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.29, 0.34, 0.07, 28]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>

      {type === 'pawn' && (
        <>
          <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.26, 24]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
        </>
      )}

      {type === 'rook' && (
        <>
          <mesh castShadow receiveShadow position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.42, 28]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.57, 0]}>
            <cylinderGeometry args={[0.26, 0.24, 0.08, 28]} />
            <meshStandardMaterial {...accentMat} />
          </mesh>
          {[-0.16, -0.05, 0.05, 0.16].map((x, idx) => (
            <mesh key={idx} castShadow receiveShadow position={[x, 0.66, 0]}>
              <boxGeometry args={[0.07, 0.07, 0.2]} />
              <meshStandardMaterial {...effectiveMainMat} />
            </mesh>
          ))}
        </>
      )}

      {type === 'knight' && (
        <>
          <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.18, 0.24, 0.34, 24]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.03, 0.53, 0]}>
            <boxGeometry args={[0.2, 0.24, 0.14]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.07, 0.66, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.12, 0.28, 18]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0.14, 0.73, 0]}>
            <sphereGeometry args={[0.08, 20, 20]} />
            <meshStandardMaterial {...accentMat} />
          </mesh>
        </>
      )}

      {type === 'bishop' && (
        <>
          <mesh castShadow receiveShadow position={[0, 0.31, 0]}>
            <cylinderGeometry args={[0.16, 0.22, 0.34, 24]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.14, 24, 24]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
            <coneGeometry args={[0.08, 0.18, 20]} />
            <meshStandardMaterial {...accentMat} />
          </mesh>
        </>
      )}

      {type === 'queen' && (
        <>
          <mesh castShadow receiveShadow position={[0, 0.33, 0]}>
            <cylinderGeometry args={[0.18, 0.24, 0.4, 26]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
            <cylinderGeometry args={[0.24, 0.2, 0.1, 26]} />
            <meshStandardMaterial {...accentMat} />
          </mesh>
          {[-0.16, -0.08, 0, 0.08, 0.16].map((x, idx) => (
            <mesh key={idx} castShadow receiveShadow position={[x, 0.7, 0]}>
              <coneGeometry args={[0.05, 0.12, 12]} />
              <meshStandardMaterial {...effectiveMainMat} />
            </mesh>
          ))}
          <mesh castShadow receiveShadow position={[0, 0.78, 0]}>
            <sphereGeometry args={[0.05, 18, 18]} />
            <meshStandardMaterial {...accentMat} />
          </mesh>
        </>
      )}

      {type === 'king' && (
        <>
          <mesh castShadow receiveShadow position={[0, 0.33, 0]}>
            <cylinderGeometry args={[0.18, 0.24, 0.4, 26]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.22, 0.19, 0.14, 24]} />
            <meshStandardMaterial {...accentMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.76, 0]}>
            <boxGeometry args={[0.06, 0.2, 0.06]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0.79, 0]}>
            <boxGeometry args={[0.18, 0.05, 0.05]} />
            <meshStandardMaterial {...effectiveMainMat} />
          </mesh>
        </>
      )}
    </group>
  );
};

const Board3DScene: React.FC<{
  pieces: ParsedPiece[];
  selectedSquare: string | null;
  legalTargets: string[];
  lastMoveFrom: string | null;
  lastMoveTo: string | null;
  checkedKingSquare: string | null;
  boardOrientation: 'white' | 'black';
  theme: Board3DTheme;
  onSquareClick: (square: string) => void;
}> = ({
  pieces,
  selectedSquare,
  legalTargets,
  lastMoveFrom,
  lastMoveTo,
  checkedKingSquare,
  boardOrientation,
  theme,
  onSquareClick,
}) => {
  const palette = BOARD_3D_PALETTES[theme];

  return (
    <group rotation-y={boardOrientation === 'black' ? Math.PI : 0}>
      <mesh receiveShadow position={[0, -0.18, 0]}>
        <boxGeometry args={[9.5, 0.35, 9.5]} />
        <meshStandardMaterial color={palette.frameOuter} metalness={0.28} roughness={0.62} />
      </mesh>
      <mesh receiveShadow position={[0, -0.03, 0]}>
        <boxGeometry args={[8.9, 0.14, 8.9]} />
        <meshStandardMaterial color={palette.frameInner} metalness={0.22} roughness={0.55} />
      </mesh>

      {BOARD_3D_SQUARES.map((item) => {
        const isSelected = selectedSquare === item.square;
        const isTarget = legalTargets.includes(item.square);
        const isLastMoveFrom = lastMoveFrom === item.square;
        const isLastMoveTo = lastMoveTo === item.square;
        const isCheckSquare = checkedKingSquare === item.square;
        const color = isSelected
          ? isCheckSquare
            ? palette.checkSquare
            : palette.selectedSquare
          : isTarget
            ? palette.legalTargetSquare
            : isCheckSquare
              ? palette.checkSquare
            : isLastMoveTo
              ? palette.lastMoveToSquare
              : isLastMoveFrom
                ? palette.lastMoveFromSquare
            : item.light
              ? palette.lightSquare
              : palette.darkSquare;

        return (
          <mesh
            key={item.square}
            receiveShadow
            position={[item.pos[0], 0.05, item.pos[2]]}
            onClick={(e) => {
              e.stopPropagation();
              onSquareClick(item.square);
            }}
          >
            <boxGeometry args={[1, 0.12, 1]} />
            <meshStandardMaterial color={color} metalness={0.28} roughness={0.4} />
          </mesh>
        );
      })}

      {pieces.map((p) => {
        const pos = squareToWorld(p.square);
        return (
          <PieceMesh
            key={`${p.square}-${p.piece}`}
            symbol={p.piece}
            position={pos}
            selected={selectedSquare === p.square}
            inCheck={checkedKingSquare === p.square}
            onClick={() => onSquareClick(p.square)}
          />
        );
      })}
    </group>
  );
};

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
  const palette = BOARD_3D_PALETTES[theme];
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
  const selectSquare = (square: string) => {
    setSelectedSquare(square);
    setLegalTargets(getLegalTargets(square));
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
        selectSquare(square);
      }
      return;
    }

    if (square === selectedSquare) {
      clearSelection();
      return;
    }

    if (clickedPiece && isOwnPiece(clickedPiece, playerColor)) {
      selectSquare(square);
      return;
    }

    if (legalTargets.includes(square)) {
      const selectedPiece = pieceMap.get(selectedSquare);

      if (requiresPromotion(selectedPiece, square)) {
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

      {pendingPromotion && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-3 text-center text-lg font-bold text-gray-900 dark:text-gray-100">
              Elige pieza de promocion
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {promotionOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="secondary"
                  onClick={() => handlePromotionSelection(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <Button className="mt-3 w-full" variant="danger" onClick={cancelPromotionSelection}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
