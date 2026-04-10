import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guard/ws-jwt.guard';
import { UsersService } from '../users/users.service';
import { getErrorMessage } from '../common/utils/error.utils';
import { GameStatus } from '../prisma/generated/enums';

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

	constructor(
		private readonly gameService: GameService,
		private readonly usersService: UsersService,
	) {}

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
			client.emit('gameUpdate', game);

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
				this.server.to(`game:${data.gameId}`).emit('gameEnd', {
					winnerId: updatedGame.winnerId,
					reason: updatedGame.endReason,
				});
			}

			this.server
				.to(`game:${data.gameId}`)
				.emit('gameUpdate', updatedGame);
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

			this.server.to(room).emit('drawAccepted');

			this.server.to(room).emit('gameEnd', {
				winnerId: null,
				reason: updatedGame.endReason,
			});

			this.server.to(room).emit('gameUpdate', updatedGame);
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

			this.server.to(room).emit('gameEnd', {
				winnerId: updatedGame.winnerId,
				reason: updatedGame.endReason,
			});
			this.server.to(room).emit('gameUpdate', updatedGame);
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
