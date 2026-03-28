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

@WebSocketGateway({ cors: { origin: '*' } }) //frontend
export class GameGateway implements OnGatewayConnection {
	@WebSocketServer()
	server: Server;

	constructor(private readonly gameService: GameService) {}
	handleConnection(client: Socket) {
		console.log('Client connected:', client.id);
	}
	@SubscribeMessage('joinGame')
	async handleJoinGame(
		@MessageBody() data: { gameId: string },
		@ConnectedSocket() client: Socket,
	) {
		const { gameId } = data;
		client.join(`game:${gameId}`);
		console.log(`Client ${client.id} joined game ${gameId}`);
	}

	@SubscribeMessage('makeMove')
	async handleMove(
		@MessageBody() data: { gameId: string; move: string; userId: string },
		@ConnectedSocket() client: Socket,
	) {
		try {
			const updatedGame = await this.gameService.makeMove(
				data.gameId,
				{ move: data.move },
				data.userId,
			);
			this.server
				.to(`game:${data.gameId}`)
				.emit('gameUpdate', updatedGame);
		} catch (error) {
			client.emit('error', { message: error.message }); // we keep it simple for now, we could work on a better error handling strategy later
		}
	}
}
