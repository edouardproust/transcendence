import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	SubscribeMessage,
	MessageBody,
	ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guard/ws-jwt.guard';

@WebSocketGateway({
	cors: {
		origin: ['http://localhost:8080', 'https://localhost:8443'],
		methods: ['GET', 'POST'],
	},
})
export class GameGateway implements OnGatewayConnection {
	@WebSocketServer()
	server: Server;

	constructor(private readonly gameService: GameService) {}
	handleConnection(client: Socket) {
		if (process.env.NODE_ENV != 'production') {
			console.log('Client connected:', client.id);
		}
	}
	@UseGuards(WsJwtGuard)
	@SubscribeMessage('joinGame')
	async handleJoinGame(
		@MessageBody() data: { gameId: string },
		@ConnectedSocket() client: Socket,
	) {
		const { gameId } = data;
		const room = `game:${gameId}`;
		client.join(room);

		const sockets = await this.server.in(room).fetchSockets();

		if (sockets.length == 2) {
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
			client.emit('error', { message: 'Game room is full' });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('makeMove')
	async handleMove(
		@MessageBody() data: { gameId: string; move: string },
		@ConnectedSocket() client: Socket,
	) {
		const userId = client.data.user.sub;
		try {
			const updatedGame = await this.gameService.makeMove(
				data.gameId,
				{ move: data.move },
				userId,
			);
			this.server
				.to(`game:${data.gameId}`)
				.emit('gameUpdate', updatedGame);
		} catch (error) {
			client.emit('error', { message: error.message }); // we keep it simple for now, we could work on a better error handling strategy later
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
			client.emit('error', { message: error.message });
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
			const game = await this.gameService.getGame(gameId);

			await this.gameService.finishGame(
				gameId,
				{
					winnerId: null,
					currentFen: game.currentFen,
					pgn: game.pgn,
				},
				userId,
			);

			this.server.to(room).emit('drawAccepted');
		} catch (error) {
			client.emit('error', { message: error.message });
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
			client.emit('error', { message: error.message });
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
			await this.gameService.resignGame(gameId, userId);

			this.server.to(room).emit('playerResigned', {
				playerId: userId,
			});
		} catch (error) {
			client.emit('error', { message: error.message });
		}
	}

	@UseGuards(WsJwtGuard)
	@SubscribeMessage('ping')
	async handlePing(@ConnectedSocket() client: Socket) {
		const user = client.data.user;
		console.log(`Received ping from user ${user.sub}`);
		client.emit('pong', {
			message: 'pong',
			userId: user.sub,
			username: user.username,
			timestamp: Date.now(),
		});
	}
}
