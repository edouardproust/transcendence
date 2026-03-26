import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) //frontend
export class GameGateway implements OnGatewayConnection {
	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket) {
		console.log('Client connected:', client.id);
	}
}
