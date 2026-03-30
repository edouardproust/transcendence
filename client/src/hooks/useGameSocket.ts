import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket, disconnectSocket, getSocket } from '@/engine/socket';
import { useAuthStore } from '@/features/auth/authStore';
import { useGameStore } from '@/features/game/gameStore';
import { gameService } from '@/services/gameService';

export const useGameSocket = (gameId: string | null) => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const lastCheckAlertKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gameId || !token) return;

    const socket = connectSocket(token);

    const joinGame = () => {
      console.log('[SOCKET] joinGame', gameId);
      socket.emit('joinGame', gameId);
    };

    const handleGameUpdate = (data: any) => {
      console.log('[SOCKET] gameUpdate', data);
      useGameStore.getState().updateFromServer(data);

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
      console.log('[SOCKET] playerJoined');

      useGameStore.setState({
        status: 'active',
      });

      window.dispatchEvent(new Event('opponentJoined'));
    };

    const handleGameEnd = (data: any) => {
      console.log('[SOCKET] gameEnd', data);

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

      if (data.reason === 'draw' || data.reason === 'stalemate') {
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

    const handleGameCancelled = () => {
      alert('La partida fue cancelada');
      navigate('/lobby');
    };

    const handleError = (err: string) => {
      console.error('[SOCKET]', err);

      if (err === 'Not your turn' || err === 'Invalid move') {
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

      alert(err);
    };

    const handlePlayerDisconnected = () => {
      alert('Tu oponente se desconecto. Esperando reconexion...');
    };

    const handlePlayerReconnected = () => {
      alert('Tu oponente se reconecto');
    };

    const handleDrawOffered = (data: any) => {
      const { playerId } = data;
      const myUserId = useAuthStore.getState().user?.id;

      if (playerId === myUserId) {
        return;
      }

      const accept = confirm('Tu oponente ofrece tablas. ¿Aceptar?');
      const socket = getSocket();

      if (accept) {
        socket?.emit('acceptDraw', gameId);
      } else {
        socket?.emit('declineDraw', gameId);
      }
    };

    const handleDrawDeclined = () => {
      alert('Tu oponente rechazó las tablas');
    };

    socket.on('drawOffered', handleDrawOffered);
    socket.on('drawDeclined', handleDrawDeclined);

    socket.on('gameUpdate', handleGameUpdate);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('gameEnd', handleGameEnd);
    socket.on('gameCancelled', handleGameCancelled);
    socket.on('error', handleError);
    socket.on('playerDisconnected', handlePlayerDisconnected);
    socket.on('playerReconnected', handlePlayerReconnected);
    socket.on('connect', joinGame);

    if (socket.connected) {
      joinGame();
    }

    return () => {
      console.log('[SOCKET] cleanup');

      socket.off('gameUpdate', handleGameUpdate);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('gameEnd', handleGameEnd);
      socket.off('gameCancelled', handleGameCancelled);
      socket.off('error', handleError);
      socket.off('drawOffered', handleDrawOffered);
      socket.off('drawDeclined', handleDrawDeclined);
      socket.off('playerDisconnected', handlePlayerDisconnected);
      socket.off('playerReconnected', handlePlayerReconnected);
      socket.off('connect', joinGame);
      
      disconnectSocket();
    };
  }, [gameId, token, navigate]);
};
