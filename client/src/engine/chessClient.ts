import { Chess, Square } from 'chess.js';
import { Move } from '@/types/game';

export class ChessClient {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  move(move: Move): boolean {
    try {
      const result = this.chess.move(move);
      return result !== null;
    } catch {
      return false;
    }
  }

  getFen(): string {
    return this.chess.fen();
  }

  getPgn(): string {
    return this.chess.pgn();
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  isDraw(): boolean {
    return this.chess.isDraw();
  }

  inCheck(): boolean {
    return this.chess.inCheck();
  }

  turn(): 'w' | 'b' {
    return this.chess.turn();
  }

  getMoves(square?: string): string[] {
    if (square) {
      return this.chess.moves({ square: square as Square, verbose: false });
    }
    return this.chess.moves({ verbose: false });
  }

  getLegalTargets(square: string): string[] {
    try {
      return this.chess
        .moves({ square: square as Square, verbose: true })
        .map((move) => move.to);
    } catch {
      return [];
    }
  }

  getPiece(square: string): string | null {
    try {
      const piece = this.chess.get(square as Square);
      if (!piece) return null;
      return piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
    } catch {
      return null;
    }
  }

  getHistory(): string[] {
    return this.chess.history();
  }

  reset(): void {
    this.chess.reset();
  }

  load(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  loadPgn(pgn: string): boolean {
    try {
      this.chess.reset();
      if (!pgn?.trim()) return true;
      this.chess.loadPgn(pgn);
      return true;
    } catch {
      return false;
    }
  }

  undo(): Move | null {
    return this.chess.undo();
  }
}
