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
  cors: { origin: ['http://localhost:8080', 'https://localhost:8443'], methods: ['GET', 'POST'] },
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
			const updatedGame = await this.gameService.startGame(gameId, userId);
			this.server.to(room).emit('playerJoined', { playerId: userId, status: updatedGame.status });
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
