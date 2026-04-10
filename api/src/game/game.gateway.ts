import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guard/ws-jwt.guard';
import { UsersService } from '../users/users.service';
import { getErrorMessage } from '../common/utils/error.utils';
import { GameStatus } from '../prisma/generated/enums';
import { parseTimeControl } from './utils/time-control.utils';

interface GameTimer {
	intervalId: ReturnType<typeof setInterval>;
	gameId: string;
	currentTurn: 'w' | 'b';
	lastTick: number;
}

@WebSocketGateway({
	cors: {
		origin: process.env.CORS_ORIGIN
			? process.env.CORS_ORIGIN.split(',')
			: ['http://localhost:8080', 'https://localhost:8443'],
		methods: ['GET', 'POST'],
		credentials: true,
	},
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server!: Server;

	private socketGameMap = new Map<
		string,
		{ gameId: string; userId: string }
	>();

	private gameTimers = new Map<string, GameTimer>();
	private gameTurnMap = new Map<string, 'w' | 'b'>();

	constructor(
		private readonly gameService: GameService,
		private readonly usersService: UsersService,
	) {}

	private startGameTimer(gameId: string, timeControl: string) {
		const parsed = parseTimeControl(timeControl);
		if (!parsed) return;

		this.stopGameTimer(gameId);

		const intervalId = setInterval(async () => {
			const timer = this.gameTimers.get(gameId);
			if (!timer) return;

			const now = Date.now();
			const elapsed = Math.floor((now - timer.lastTick) / 1000);
			timer.lastTick = now;

			const currentTurn = this.gameTurnMap.get(gameId) || 'w';

			try {
				const updatedGame = await this.gameService.decrementTime(
					gameId,
					currentTurn,
					elapsed,
				);

				if (!updatedGame || !updatedGame.whiteTimeLeft || !updatedGame.blackTimeLeft) {
					this.stopGameTimer(gameId);
					return;
				}

				this.server.to(`game:${gameId}`).emit('gameUpdate', {
					timeLeft: {
						white: updatedGame.whiteTimeLeft,
						black: updatedGame.blackTimeLeft,
					},
					turn: currentTurn,
				});

				if (
					updatedGame.whiteTimeLeft <= 0 ||
					updatedGame.blackTimeLeft <= 0
				) {
					this.stopGameTimer(gameId);
					this.server.to(`game:${gameId}`).emit('gameEnd', {
						winnerId:
							updatedGame.whiteTimeLeft <= 0
								? updatedGame.blackId
								: updatedGame.whiteId,
						reason: 'timeout',
					});
				}
			} catch (error) {
				this.stopGameTimer(gameId);
			}
		}, 1000);

		this.gameTimers.set(gameId, {
			intervalId,
			gameId,
			currentTurn: 'w',
			lastTick: Date.now(),
		});
	}

	private stopGameTimer(gameId: string) {
		const timer = this.gameTimers.get(gameId);
		if (timer) {
			clearInterval(timer.intervalId);
			this.gameTimers.delete(gameId);
		}
	}

	private updateGameTurn(gameId: string, turn: 'w' | 'b') {
		this.gameTurnMap.set(gameId, turn);
		const timer = this.gameTimers.get(gameId);
		if (timer) {
			timer.currentTurn = turn;
			timer.lastTick = Date.now();
		}
	}

	handleConnection(client: Socket) {
		if (process.env.NODE_ENV != 'production') {
			console.log('Client connected:', client.id);
		}
	}

	async handleDisconnect(client: Socket) {
		if (process.env.NODE_ENV != 'production') {
			console.log('Client disconnected:', client.id);
		}

		const session = this.socketGameMap.get(client.id);
		if (!session) {
			return;
		}

		const { gameId, userId } = session;
		this.socketGameMap.delete(client.id);

		const hasAnotherSocketForSameUser = [...this.socketGameMap.values()].some(
			(activeSession) =>
				activeSession.gameId === gameId && activeSession.userId === userId,
		);

		if (hasAnotherSocketForSameUser) {
			return;
		}

		const room = `game:${gameId}`;
		const resolvedGame = await this.gameService.handlePlayerDisconnect(
			gameId,
			userId,
		);

		if (!resolvedGame) {
			return;
		}

		if (resolvedGame.status === GameStatus.ABORTED) {
			this.server.to(room).emit('gameUpdate', resolvedGame);
			this.server.to(room).emit('gameCancelled');
			return;
		}

		if (resolvedGame.status === GameStatus.FINISHED) {
			this.server.to(room).emit('gameEnd', {
				winnerId: resolvedGame.winnerId,
				reason: resolvedGame.endReason,
			});
			this.server.to(room).emit('gameUpdate', resolvedGame);
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('joinGame')
	async handleJoinGame(
		@MessageBody() data: { gameId: string },
		@ConnectedSocket() client: Socket,
	) {
		const { gameId } = data;
		const userId = client.data.user.sub;
		const room = `game:${gameId}`;

		const wasConnected = [...this.socketGameMap.values()].some(
			(session) => session.gameId === gameId && session.userId === userId,
		);
		client.join(room);
		this.socketGameMap.set(client.id, { gameId, userId });

		if (wasConnected) {
			client.to(room).emit('playerReconnected', { playerId: userId });

			const game = await this.gameService.getGame(gameId);
			client.emit('gameUpdate', {
				...game,
				timeLeft: {
					white: game.whiteTimeLeft,
					black: game.blackTimeLeft,
				},
			});

			return;
		}

		const sockets = await this.server.in(room).fetchSockets();

		if (sockets.length === 2) {
			const userId = client.data.user.sub;
			const updatedGame = await this.gameService.startGame(
				gameId,
				userId,
			);
			this.server.to(room).emit('playerJoined', {
				playerId: userId,
				status: updatedGame.status,
			});
			this.server.to(room).emit('gameUpdate', {
				...updatedGame,
				timeLeft: {
					white: updatedGame.whiteTimeLeft,
					black: updatedGame.blackTimeLeft,
				},
			});
		} else if (sockets.length > 2) {
			client.leave(room);
			this.socketGameMap.delete(client.id);
			client.emit('error', { message: 'Game room is full' });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('cancelGame')
	async handleCancelGame(
		@MessageBody() gameId: string,
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.user.sub;
		const room = `game:${gameId}`;

		try {
			const updatedGame = await this.gameService.cancelGame(
				gameId,
				userId,
			);

			this.stopGameTimer(gameId);

			if (updatedGame.status === GameStatus.ABORTED) {
				this.server.to(room).emit('gameUpdate', updatedGame);
				this.server.to(room).emit('gameCancelled');
				return;
			}

			if (updatedGame.status === GameStatus.FINISHED) {
				this.server.to(room).emit('gameEnd', {
					winnerId: updatedGame.winnerId,
					reason: updatedGame.endReason,
				});
				this.server.to(room).emit('gameUpdate', updatedGame);
			}
		} catch (error) {
			client.emit('error', { message: getErrorMessage(error) });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('makeMove')
	async handleMove(
		@MessageBody()
		data: {
			gameId: string;
			move: { from: string; to: string; promotion?: string };
		},
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.user.sub;
		try {
			const updatedGame = await this.gameService.makeMove(
				data.gameId,
				{ move: data.move },
				userId,
			);
			if (updatedGame.status === 'FINISHED') {
				this.stopGameTimer(data.gameId);
				this.server.to(`game:${data.gameId}`).emit('gameEnd', {
					winnerId: updatedGame.winnerId,
					reason: updatedGame.endReason,
				});
			}

			const nextTurn = updatedGame.currentFen?.split(' ')[1] === 'b' ? 'b' : 'w';
			
			// Start timer on first move, set initial turn
			const existingTimer = this.gameTimers.get(data.gameId);
			if (!existingTimer) {
				this.startGameTimer(data.gameId, updatedGame.timeControl || '10+0');
			}
			this.updateGameTurn(data.gameId, nextTurn);

			this.server
				.to(`game:${data.gameId}`)
				.emit('gameUpdate', {
					...updatedGame,
					timeLeft: {
						white: updatedGame.whiteTimeLeft,
						black: updatedGame.blackTimeLeft,
					},
				});
		} catch (error) {
			client.emit('error', { message: getErrorMessage(error) }); // we keep it simple for now, we could work on a better error handling strategy later
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('offerDraw')
	async handleOfferDraw(
		@MessageBody() gameId: string,
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.user.sub;
		const room = `game:${gameId}`;

		try {
			await this.gameService.offerDraw(gameId, userId);

			client.to(room).emit('drawOffered', {
				playerId: userId,
			});
		} catch (error) {
			client.emit('error', { message: getErrorMessage(error) });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('acceptDraw')
	async handleAcceptDraw(
		@MessageBody() gameId: string,
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.user.sub;
		const room = `game:${gameId}`;

		try {
			const updatedGame = await this.gameService.acceptDraw(
				gameId,
				userId,
			);

			this.stopGameTimer(gameId);
			this.server.to(room).emit('drawAccepted');

			this.server.to(room).emit('gameEnd', {
				winnerId: null,
				reason: updatedGame.endReason,
			});

			this.server.to(room).emit('gameUpdate', {
				...updatedGame,
				timeLeft: {
					white: updatedGame.whiteTimeLeft,
					black: updatedGame.blackTimeLeft,
				},
			});
		} catch (error) {
			client.emit('error', { message: getErrorMessage(error) });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('declineDraw')
	async handleDeclineDraw(
		@MessageBody() gameId: string,
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.user.sub;
		const room = `game:${gameId}`;

		try {
			await this.gameService.declineDraw(gameId, userId);

			client.to(room).emit('drawDeclined', {
				playerId: userId,
			});
		} catch (error) {
			client.emit('error', { message: getErrorMessage(error) });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('resign')
	async handleResign(
		@MessageBody() gameId: string,
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.user.sub;
		const room = `game:${gameId}`;

		try {
			const updatedGame = await this.gameService.resignGame(
				gameId,
				userId,
			);

			this.stopGameTimer(gameId);
			this.server.to(room).emit('gameEnd', {
				winnerId: updatedGame.winnerId,
				reason: updatedGame.endReason,
			});
			this.server.to(room).emit('gameUpdate', {
				...updatedGame,
				timeLeft: {
					white: updatedGame.whiteTimeLeft,
					black: updatedGame.blackTimeLeft,
				},
			});
		} catch (error) {
			client.emit('error', { message: getErrorMessage(error) });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('chatMessage')
	async handleChatMessage(
		@MessageBody() data: { gameId: string; message: string },
		@ConnectedSocket() client: Socket,
	) {
		const user = client.data.user;
		const room = `game:${data.gameId}`;
		const dbUser = await this.usersService.findOneById(user.sub);

		client.to(room).emit('chatMessage', {
			userId: user.sub,
			username: dbUser.username,
			message: data.message,
			timestamp: new Date().toISOString(),
		});
	}
}
