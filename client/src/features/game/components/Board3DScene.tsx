import React from 'react';
import { PieceType } from '../utils';
import { board3DPalettes, type Board3DPalette } from '../utils/board3DPalettes';

interface PieceMeshProps {
  symbol: string;
  position: [number, number, number];
  selected: boolean;
  inCheck: boolean;
  onClick: () => void;
}

const pieceMaterialProps = (
  color: 'white' | 'black',
  selected: boolean,
) => {
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

const PieceMesh: React.FC<PieceMeshProps> = ({
  symbol,
  position,
  selected,
  inCheck,
  onClick,
}) => {
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

const pieceTypeFromSymbol = (piece: string): PieceType => {
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

const files = 'abcdefgh';

interface Board3DSceneProps {
  pieces: Array<{ square: string; piece: string }>;
  selectedSquare: string | null;
  legalTargets: string[];
  lastMoveFrom: string | null;
  lastMoveTo: string | null;
  checkedKingSquare: string | null;
  boardOrientation: 'white' | 'black';
  theme: 'wood' | 'obsidian';
  onSquareClick: (square: string) => void;
}

const squareToWorld = (square: string): [number, number, number] => {
  const fileIndex = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const x = fileIndex - 3.5;
  const z = 4.5 - rank;
  return [x, 0, z];
};

export const Board3DScene: React.FC<Board3DSceneProps> = ({
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
  const palette: Board3DPalette = board3DPalettes[theme];
  const squares = React.useMemo(() => {
    const items: Array<{ square: string; pos: [number, number, number]; light: boolean }> = [];
    for (let rank = 1; rank <= 8; rank += 1) {
      for (let fileIndex = 0; fileIndex < 8; fileIndex += 1) {
        const square = `${files[fileIndex]}${rank}`;
        const pos = squareToWorld(square);
        const light = (fileIndex + rank) % 2 === 0;
        items.push({ square, pos, light });
      }
    }
    return items;
  }, []);

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

      {squares.map((item) => {
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
