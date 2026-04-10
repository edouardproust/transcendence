import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { getErrorMessage } from '../common/utils/error.utils';

@WebSocketGateway({
	cors: {
		origin: process.env.CORS_ORIGIN
			? process.env.CORS_ORIGIN.split(',')
			: ['http://localhost:8080', 'https://localhost:8443'],
		methods: ['GET', 'POST'],
		credentials: true,
	},
	namespace: '/presence',
})
export class PresenceGateway
	implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer()
	server!: Server;

	private userSocketCount = new Map<string, number>();
	private socketUserMap = new Map<string, string>();

	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	private extractUserFromSocket(client: Socket): {
		sub: string;
		username: string;
	} {
		const token =
			client.handshake.auth?.token ||
			client.handshake.headers?.authorization?.replace('Bearer ', '');

		if (!token) {
			throw new UnauthorizedException('No token provided');
		}

		try {
			const payload = this.jwtService.verify(token);
			return {
				sub: payload.sub,
				username: payload.username || payload.sub,
			};
		} catch {
			throw new UnauthorizedException('Invalid token');
		}
	}

	async handleConnection(client: Socket) {
		try {
			const user = this.extractUserFromSocket(client);

			const count = (this.userSocketCount.get(user.sub) || 0) + 1;
			this.userSocketCount.set(user.sub, count);
			this.socketUserMap.set(client.id, user.sub);

			if (count === 1) {
				await this.usersService.updateOneById(user.sub, {
					isOnline: true,
					lastSeen: new Date(),
				});
			}

			this.server.emit('user_status', {
				userId: user.sub,
				is_online: true,
				last_seen: new Date().toISOString(),
			});

			client.join(`user:${user.sub}`);

			if (process.env.NODE_ENV !== 'production') {
				console.log(
					`[PRESENCE] User ${user.sub} connected (sockets: ${count})`,
				);
			}
		} catch (error) {
			console.error(
				'[PRESENCE] Connection error:',
				getErrorMessage(error),
			);
			client.disconnect();
		}
	}

	async handleDisconnect(client: Socket) {
		const userId = this.socketUserMap.get(client.id);
		if (!userId) return;

		this.socketUserMap.delete(client.id);

		const count = (this.userSocketCount.get(userId) || 1) - 1;
		this.userSocketCount.set(userId, count);

		if (count <= 0) {
			this.userSocketCount.delete(userId);

			try {
				await this.usersService.updateOneById(userId, {
					isOnline: false,
					lastSeen: new Date(),
				});
			} catch (error) {
				console.error(
					'[PRESENCE] Error updating offline status:',
					error,
				);
			}

			this.server.emit('user_status', {
				userId,
				is_online: false,
				last_seen: new Date().toISOString(),
			});
		}

		if (process.env.NODE_ENV !== 'production') {
			console.log(
				`[PRESENCE] User ${userId} disconnected (sockets: ${count})`,
			);
		}
	}
}
