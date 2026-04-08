import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '@/engine/socket';
import { useAuthStore } from '@/features/auth/authStore';
import { useGameStore } from '@/features/game/gameStore';
import { gameService } from '@/services/gameService';

type GameSocketErrorPayload = string | { message?: string };
type ChatMessagePayload = {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
};

interface UseGameSocketOptions {
  suppressErrorAlerts?: boolean;
  onError?: (message: string) => boolean | void;
  onPlayerJoined?: () => void;
  onDrawOffered?: (data: { playerId: string }) => void;
  onDrawDeclined?: () => void;
  onChatMessage?: (data: ChatMessagePayload) => void;
}

const normalizeGameStatus = (status: string | null | undefined) => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'ongoing' || normalized === 'active') return 'active';
  if (normalized === 'finished') return 'finished';
  if (normalized === 'cancelled' || normalized === 'aborted') return 'cancelled';
  return 'waiting';
};

const normalizeGameUpdatePayload = (data: any) => {
  const fen =
    typeof data?.fen === 'string' && data.fen
      ? data.fen
      : typeof data?.currentFen === 'string' && data.currentFen
        ? data.currentFen
        : undefined;
  const status = data?.status == null ? undefined : normalizeGameStatus(data.status);

  return {
    fen,
    pgn: typeof data?.pgn === 'string' ? data.pgn : undefined,
    turn: fen ? (fen.split(' ')[1] === 'b' ? 'b' : 'w') : undefined,
    status,
    lastMove: data?.lastMove,
    timeLeft: data?.timeLeft,
  };
};

export const useGameSocket = (gameId: string | null, options?: UseGameSocketOptions) => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const lastCheckAlertKeyRef = useRef<string | null>(null);
  const optionsRef = useRef<UseGameSocketOptions | undefined>(options);

  optionsRef.current = options;

  useEffect(() => {
    if (!gameId || !token) return;

    const socket = connectSocket(token);

    const joinGame = () => {
      socket.emit('joinGame', { gameId });
    };

    const handleGameUpdate = (data: any) => {
      useGameStore.getState().updateFromServer(normalizeGameUpdatePayload(data));

      const state = useGameStore.getState();
      const chess = state.chess;
      if (!chess || state.status !== 'active') {
        lastCheckAlertKeyRef.current = null;
        return;
      }

      if (!chess.inCheck() || chess.isGameOver()) {
        lastCheckAlertKeyRef.current = null;
        return;
      }

      const checkedSide = chess.turn();
      const key = `${state.fen}|${checkedSide}`;
      if (lastCheckAlertKeyRef.current === key) {
        return;
      }

      lastCheckAlertKeyRef.current = key;
      const myColor =
        state.playerColor === 'white' ? 'w' : state.playerColor === 'black' ? 'b' : null;
      const isMyKingInCheck = myColor ? checkedSide === myColor : false;
      alert(isMyKingInCheck ? '⚠️ Jaque a tu rey' : '⚠️ Jaque al rey rival');
    };

    const handlePlayerJoined = () => {
      useGameStore.setState({
        status: 'active',
      });
      optionsRef.current?.onPlayerJoined?.();
    };

    const handleGameEnd = (data: any) => {
      useGameStore.getState().endGame();
      lastCheckAlertKeyRef.current = null;

      const myUserId = useAuthStore.getState().user?.id;
      const iWon = Boolean(data.winnerId && myUserId && data.winnerId === myUserId);
      const hasWinner = Boolean(data.winnerId);

      let message = 'Partida finalizada';

      if (data.reason === 'checkmate') {
        message = hasWinner
          ? iWon
            ? '♔ Jaque mate. Ganaste la partida.'
            : '♚ Jaque mate. Ganó tu oponente.'
          : 'Jaque mate';
      }

      if (data.reason === 'resignation') {
        message = hasWinner
          ? iWon
            ? 'Ganaste por rendición del oponente.'
            : 'Perdiste por rendición.'
          : 'La partida terminó por rendición.';
      }

      if (
        data.reason === 'draw' ||
        data.reason === 'stalemate' ||
        data.reason === 'repetition' ||
        data.reason === 'insufficient'
      ) {
        message = 'Tablas. No hay ganador.';
      }

      if (data.reason === 'disconnect') {
        message = hasWinner
          ? iWon
            ? 'Ganaste por desconexión del oponente.'
            : 'Perdiste por desconexión.'
          : 'La partida terminó por desconexión.';
      }

      alert(message);
    };

    const handleDrawOffered = (data: { playerId: string }) => {
      optionsRef.current?.onDrawOffered?.(data);
    };

    const handleDrawDeclined = () => {
      optionsRef.current?.onDrawDeclined?.();
    };

    const handleChatMessage = (data: ChatMessagePayload) => {
      optionsRef.current?.onChatMessage?.(data);
    };

    const handleGameCancelled = () => {
      useGameStore.getState().reset();
      alert('La partida fue cancelada');
      navigate('/lobby');
    };

    const handleError = (payload: GameSocketErrorPayload) => {
      const message = typeof payload === 'string' ? payload : payload?.message || 'Socket error';

      console.error('[SOCKET]', message);

      if (message === 'Not your turn' || message === 'Illegal move') {
        // Re-sync against server authority to recover from client/server drift.
        void (async () => {
          try {
            const game = await gameService.getGame(gameId);
            const turn = game.currentFen.split(' ')[1] === 'b' ? 'b' : 'w';
            const gameStore = useGameStore.getState();
            gameStore.updateGame(game.currentFen, game.pgn, turn);
            useGameStore.setState({ status: game.status });
          } catch (syncError) {
            console.error('[SOCKET] failed to resync game state', syncError);
          }
        })();
      }

      const handledByPage = optionsRef.current?.onError?.(message) === true;
      if (!handledByPage && !optionsRef.current?.suppressErrorAlerts) {
        alert(message);
      }
    };

    const handlePlayerDisconnected = () => {
      alert('Tu oponente se desconecto. Esperando reconexion...');
    };

    const handlePlayerReconnected = () => {
      alert('Tu oponente se reconecto');
    };

    socket.on('gameUpdate', handleGameUpdate);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('gameEnd', handleGameEnd);
    socket.on('gameCancelled', handleGameCancelled);
    socket.on('drawOffered', handleDrawOffered);
    socket.on('drawDeclined', handleDrawDeclined);
    socket.on('chatMessage', handleChatMessage);
    socket.on('error', handleError);
    socket.on('playerDisconnected', handlePlayerDisconnected);
    socket.on('playerReconnected', handlePlayerReconnected);
    socket.on('connect', joinGame);

    if (socket.connected) {
      joinGame();
    }

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('gameEnd', handleGameEnd);
      socket.off('gameCancelled', handleGameCancelled);
      socket.off('drawOffered', handleDrawOffered);
      socket.off('drawDeclined', handleDrawDeclined);
      socket.off('chatMessage', handleChatMessage);
      socket.off('error', handleError);
      socket.off('playerDisconnected', handlePlayerDisconnected);
      socket.off('playerReconnected', handlePlayerReconnected);
      socket.off('connect', joinGame);
      disconnectSocket();
    };
  }, [gameId, token, navigate]);
};
