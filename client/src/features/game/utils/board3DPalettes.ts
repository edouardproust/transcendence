import { Board3DTheme } from '@/types/game';

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

export const board3DPalettes: Record<Board3DTheme, Board3DPalette> = {
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
