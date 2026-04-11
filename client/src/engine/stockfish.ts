export class StockfishEngine {
  private worker: Worker | null = null;
  private isReady = false;
  private onBestMoveCallback: ((move: string) => void) | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker('/stockfish.js');

        this.worker.onmessage = (e) => {
          const message = e.data;

          if (typeof message === 'string') {
            if (message.includes('uciok')) {
              this.isReady = true;
              this.worker?.postMessage('isready');
            }

            if (message.includes('readyok')) {
              resolve();
            }

            if (message.startsWith('bestmove')) {
              const parts = message.split(' ');
              const move = parts[1];
              if (this.onBestMoveCallback && move) {
                this.onBestMoveCallback(move);
              }
            }
          }
        };

        this.worker.onerror = (error) => {
          console.error('Stockfish worker error:', error);
          reject(error);
        };

        this.worker.postMessage('uci');
      } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
        reject(error);
      }
    });
  }

  setPosition(fen: string): void {
    if (!this.worker || !this.isReady) {
      console.warn('Stockfish not ready');
      return;
    }
    this.worker.postMessage(`position fen ${fen}`);
  }

  calculateMove(level: number = 10): void {
    if (!this.worker || !this.isReady) {
      console.warn('Stockfish not ready');
      return;
    }

    const normalizedLevel = Math.max(1, Math.min(20, Math.floor(level)));
    const skillLevel = Math.max(0, normalizedLevel - 1);
    const depth = Math.max(1, Math.min(18, Math.round(normalizedLevel * 0.8 + 1)));

    // Ajustar fuerza para que niveles bajos sean realmente mas debiles.
    this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
    if (normalizedLevel <= 6) {
      const elo = 300 + (normalizedLevel - 1) * 80;
      this.worker.postMessage('setoption name UCI_LimitStrength value true');
      this.worker.postMessage(`setoption name UCI_Elo value ${elo}`);
    } else {
      this.worker.postMessage('setoption name UCI_LimitStrength value false');
    }

    this.worker.postMessage(`go depth ${depth}`);
  }

  onBestMove(callback: (move: string) => void): void {
    this.onBestMoveCallback = callback;
  }

  stop(): void {
    if (!this.worker) return;
    this.worker.postMessage('stop');
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }
}
