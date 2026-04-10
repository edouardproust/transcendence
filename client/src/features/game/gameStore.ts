import { create } from 'zustand';
import {
  GameState,
  Move,
  PlayerColor,
  GameMode,
  GameStatus,
  BoardViewMode,
  Board2DTheme,
  Board3DTheme,
} from '@/types/game';
import { ChessClient } from '@/engine/chessClient';

const board2DThemes: Board2DTheme[] = ['classic', 'wood', 'ocean', 'slate'];
const board3DThemes: Board3DTheme[] = ['wood', 'obsidian'];
const boardViewModes: BoardViewMode[] = ['2d', '3d'];

const STORAGE_KEYS = {
  boardView: 'game-preferences:boardView',
  board2DTheme: 'game-preferences:board2DTheme',
  board3DTheme: 'game-preferences:board3DTheme',
} as const;

const readStoredPreference = <T extends string>(
  key: string,
  allowedValues: readonly T[],
  fallback: T
): T => {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  return allowedValues.includes(value as T) ? (value as T) : fallback;
};

const persistPreference = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
};

interface GameStore extends GameState {
  chess: ChessClient | null;
  initGame: (
    gameId: string,
    mode: GameMode,
    playerColor?: PlayerColor,
    initialFen?: string,
    initialPgn?: string,
    initialStatus?: GameStatus
  ) => void;
  updateGame: (fen: string, pgn: string, turn: 'w' | 'b') => void;
  updateFromServer: (data: any) => void;
  makeMove: (move: Move) => boolean;
  setBoardView: (mode: BoardViewMode) => void;
  cycleBoard2DTheme: () => void;
  cycleBoard3DTheme: () => void;
  setConnected: (connected: boolean) => void;
  setTimeLeft: (white: number, black: number) => void;
  endGame: () => void;
  reset: () => void;
}

const createInitialState = (): GameState => ({
  gameId: null,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn: '',
  moves: [],
  lastMove: null,
  turn: 'w',
  status: 'waiting',
  isConnected: false,
  mode: 'online',
  playerColor: null,
  boardView: readStoredPreference(STORAGE_KEYS.boardView, boardViewModes, '2d'),
  board2DTheme: readStoredPreference(STORAGE_KEYS.board2DTheme, board2DThemes, 'classic'),
  board3DTheme: readStoredPreference(STORAGE_KEYS.board3DTheme, board3DThemes, 'wood'),
  timeLeft: {
    white: 600,
    black: 600,
  },
});

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  chess: null,

  initGame: (gameId, mode, playerColor, initialFen, initialPgn, initialStatus) => {
    const chess = new ChessClient();
    if (initialPgn && !chess.loadPgn(initialPgn) && initialFen) {
      chess.load(initialFen);
    } else if (!initialPgn && initialFen) {
      chess.load(initialFen);
    }

    set({
      gameId,
      mode,
      playerColor: playerColor || null,
      chess,
      status: initialStatus || 'waiting',
      fen: chess.getFen(),
      pgn: chess.getPgn(),
      moves: chess.getHistory(),
      lastMove: chess.getLastMove(),
      turn: chess.turn(),
    });
  },

  updateGame: (fen, pgn, turn) => {
    const { chess } = get();
    if (chess) {
      if (pgn) {
        chess.loadPgn(pgn);
      } else {
        chess.load(fen);
      }
      set({
        fen,
        pgn,
        turn,
        moves: chess.getHistory(),
        lastMove: chess.getLastMove(),
      });
    }
  },

  updateFromServer: (data: any) => {
    const { chess } = get();
    if (!chess) return;

    // Actualizar posición desde el servidor
    if (data.pgn) {
      chess.loadPgn(data.pgn);
    } else if (data.fen) {
      chess.load(data.fen);
    }

    const updates: Partial<GameState> = {
      fen: data.fen || get().fen,
      pgn: data.pgn || get().pgn,
      turn: data.turn || get().turn,
      moves: chess.getHistory(),
      lastMove:
        data.lastMove?.from && data.lastMove?.to
          ? {
              from: data.lastMove.from,
              to: data.lastMove.to,
              promotion: data.lastMove.promotion,
            }
          : chess.getLastMove(),
    };

    const nextStatus = data.status as GameStatus | undefined;
    if (nextStatus && ['waiting', 'active', 'finished', 'cancelled'].includes(nextStatus)) {
      updates.status = nextStatus;
    }

    // Si hay timeLeft, actualizarlo
    if (data.timeLeft) {
      updates.timeLeft = data.timeLeft;
    }
    
    set(updates);
  },

  makeMove: (move) => {
    const { chess } = get();
    if (!chess) return false;

    const success = chess.move(move);
    if (success) {
      set({
        fen: chess.getFen(),
        pgn: chess.getPgn(),
        moves: chess.getHistory(),
        lastMove: {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        },
        turn: chess.turn(),
      });
    }
    return success;
  },

  setBoardView: (mode) => {
    persistPreference(STORAGE_KEYS.boardView, mode);
    set({ boardView: mode });
  },

  cycleBoard2DTheme: () => {
    const currentTheme = get().board2DTheme;
    const currentIndex = board2DThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % board2DThemes.length;
    persistPreference(STORAGE_KEYS.board2DTheme, board2DThemes[nextIndex]);
    set({ board2DTheme: board2DThemes[nextIndex] });
  },

  cycleBoard3DTheme: () => {
    const currentTheme = get().board3DTheme;
    const currentIndex = board3DThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % board3DThemes.length;
    persistPreference(STORAGE_KEYS.board3DTheme, board3DThemes[nextIndex]);
    set({ board3DTheme: board3DThemes[nextIndex] });
  },

  setConnected: (connected) => {
    set({ isConnected: connected });
  },

  setTimeLeft: (white, black) => {
    set({ timeLeft: { white, black } });
  },

  endGame: () => {
    set({ status: 'finished' });
  },

  reset: () => {
    set({ ...createInitialState(), chess: null });
  },
}));
