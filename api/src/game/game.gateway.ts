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

@WebSocketGateway({ cors: { origin: '*' } }) //frontend
export class GameGateway implements OnGatewayConnection {
	@WebSocketServer()
	server: Server;

	constructor(private readonly gameService: GameService) {}
	handleConnection(client: Socket) {
		console.log('Client connected:', client.id);
	}
	@UseGuards(WsJwtGuard)
	@SubscribeMessage('joinGame')
	async handleJoinGame(
		@MessageBody() data: { gameId: string },
		@ConnectedSocket() client: Socket,
	) {
		const { gameId } = data;
		client.join(`game:${gameId}`);
		console.log(`Client ${client.id} joined game ${gameId}`);
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
}
