import { Test, TestingModule } from '@nestjs/testing';
import { PresenceGateway } from './presence.gateway';
import { UsersService } from '../users/users.service';
import { EXAMPLES } from '../common/constants';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

describe('PresenceGateway', () => {
	let gateway: PresenceGateway;
	let usersService: UsersService;
	let jwtService: JwtService;
	let mockServer: { emit: jest.Mock; to: jest.Mock };

	const mockClient = {
		id: 'client-123',
		join: jest.fn(),
		disconnect: jest.fn(),
		handshake: {
			auth: { token: 'valid-token' },
			headers: {},
		},
	} as unknown as Socket;

	beforeEach(async () => {
		mockServer = {
			emit: jest.fn(),
			to: jest.fn().mockReturnThis(),
		};

		jest.spyOn(console, 'log').mockImplementation(() => undefined);
		jest.spyOn(console, 'error').mockImplementation(() => undefined);

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PresenceGateway,
				{
					provide: UsersService,
					useValue: {
						updateOneById: jest.fn().mockResolvedValue({}),
					},
				},
				{
					provide: JwtService,
					useValue: {
						verify: jest.fn().mockReturnValue({
							sub: EXAMPLES.id,
							username: EXAMPLES.username,
						}),
					},
				},
			],
		}).compile();

		gateway = module.get<PresenceGateway>(PresenceGateway);
		usersService = module.get<UsersService>(UsersService);
		jwtService = module.get<JwtService>(JwtService);
		gateway.server = mockServer as unknown as Server;
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should be defined', () => {
		expect(gateway).toBeDefined();
	});

	describe('handleConnection', () => {
		it('should update user to online and emit user_status on first connection', async () => {
			await gateway.handleConnection(mockClient);

			expect(usersService.updateOneById).toHaveBeenCalledWith(
				EXAMPLES.id,
				expect.objectContaining({
					isOnline: true,
					lastSeen: expect.any(Date),
				}),
			);
			expect(mockServer.emit).toHaveBeenCalledWith(
				'user_status',
				expect.objectContaining({
					userId: EXAMPLES.id,
					is_online: true,
				}),
			);
		});

		it('should NOT update DB on subsequent connections (multiple tabs)', async () => {
			await gateway.handleConnection(mockClient);
			await gateway.handleConnection(mockClient);

			expect(usersService.updateOneById).toHaveBeenCalledTimes(1);
		});

		it('should emit user_status on subsequent connections without DB update', async () => {
			await gateway.handleConnection(mockClient);
			await gateway.handleConnection(mockClient);

			expect(mockServer.emit).toHaveBeenCalledTimes(2);
			expect(mockServer.emit).toHaveBeenLastCalledWith(
				'user_status',
				expect.objectContaining({
					userId: EXAMPLES.id,
					is_online: true,
				}),
			);
		});

		it('should disconnect client if no token provided', async () => {
			const clientWithoutToken = {
				...mockClient,
				id: 'no-token-client',
				disconnect: jest.fn(),
				handshake: { auth: {}, headers: {} },
			} as unknown as Socket;

			await gateway.handleConnection(clientWithoutToken);

			expect(clientWithoutToken.disconnect).toHaveBeenCalled();
		});

		it('should disconnect client if token is invalid', async () => {
			const clientWithBadToken = {
				...mockClient,
				id: 'bad-token-client',
				disconnect: jest.fn(),
			} as unknown as Socket;

			jest.spyOn(jwtService, 'verify').mockImplementation(() => {
				throw new Error('Invalid token');
			});

			await gateway.handleConnection(clientWithBadToken);

			expect(clientWithBadToken.disconnect).toHaveBeenCalled();
		});
	});

	describe('handleDisconnect', () => {
		it('should NOT update DB if other sockets still connected', async () => {
			const client1 = {
				...mockClient,
				id: 'client-1',
				join: jest.fn(),
			} as unknown as Socket;
			const client2 = {
				...mockClient,
				id: 'client-2',
				join: jest.fn(),
			} as unknown as Socket;

			await gateway.handleConnection(client1);
			await gateway.handleConnection(client2);

			(usersService.updateOneById as jest.Mock).mockClear();
			await gateway.handleDisconnect(client1);

			expect(usersService.updateOneById).not.toHaveBeenCalled();
		});

		it('should emit user_status with is_online: false on last disconnect', async () => {
			const client = {
				...mockClient,
				id: 'solo-client',
				join: jest.fn(),
			} as unknown as Socket;

			await gateway.handleConnection(client);
			mockServer.emit.mockClear();

			await gateway.handleDisconnect(client);

			expect(mockServer.emit).toHaveBeenCalledWith(
				'user_status',
				expect.objectContaining({
					userId: EXAMPLES.id,
					is_online: false,
				}),
			);
		});

		it('should update DB to offline on last disconnect', async () => {
			const client = {
				...mockClient,
				id: 'offline-client',
				join: jest.fn(),
			} as unknown as Socket;

			await gateway.handleConnection(client);
			(usersService.updateOneById as jest.Mock).mockClear();

			await gateway.handleDisconnect(client);

			expect(usersService.updateOneById).toHaveBeenCalledWith(
				EXAMPLES.id,
				expect.objectContaining({
					isOnline: false,
					lastSeen: expect.any(Date),
				}),
			);
		});

		it('should NOT emit user_status if other tabs still open', async () => {
			const client1 = {
				...mockClient,
				id: 'tab-1',
				join: jest.fn(),
			} as unknown as Socket;
			const client2 = {
				...mockClient,
				id: 'tab-2',
				join: jest.fn(),
			} as unknown as Socket;

			await gateway.handleConnection(client1);
			await gateway.handleConnection(client2);
			mockServer.emit.mockClear();

			await gateway.handleDisconnect(client1);

			expect(mockServer.emit).not.toHaveBeenCalled();
		});

		it('should handle unknown socket gracefully', async () => {
			const unknownClient = { id: 'unknown-client' } as unknown as Socket;

			await expect(
				gateway.handleDisconnect(unknownClient),
			).resolves.not.toThrow();
		});
	});

	describe('socket counter', () => {
		it('should handle multiple sockets from same user', async () => {
			const client1 = {
				...mockClient,
				id: 'c1',
				join: jest.fn(),
			} as unknown as Socket;
			const client2 = {
				...mockClient,
				id: 'c2',
				join: jest.fn(),
			} as unknown as Socket;
			const client3 = {
				...mockClient,
				id: 'c3',
				join: jest.fn(),
			} as unknown as Socket;

			await gateway.handleConnection(client1);
			await gateway.handleConnection(client2);
			await gateway.handleConnection(client3);

			(usersService.updateOneById as jest.Mock).mockClear();
			await gateway.handleDisconnect(client1);
			expect(usersService.updateOneById).not.toHaveBeenCalled();

			(usersService.updateOneById as jest.Mock).mockClear();
			await gateway.handleDisconnect(client2);
			expect(usersService.updateOneById).not.toHaveBeenCalled();

			(usersService.updateOneById as jest.Mock).mockClear();
			await gateway.handleDisconnect(client3);
			expect(usersService.updateOneById).toHaveBeenCalledWith(
				EXAMPLES.id,
				expect.objectContaining({ isOnline: false }),
			);
		});
	});

	describe('isUserOnline', () => {
		it('should return true when user is connected', async () => {
			const client = {
				...mockClient,
				id: 'online-client',
				join: jest.fn(),
			} as unknown as Socket;
			await gateway.handleConnection(client);
			expect(gateway.isUserOnline(EXAMPLES.id)).toBe(true);
		});

		it('should return false when user is not connected', () => {
			expect(gateway.isUserOnline('non-existent-id')).toBe(false);
		});

		it('should return false after user disconnects', async () => {
			const client = {
				...mockClient,
				id: 'temp-client',
				join: jest.fn(),
			} as unknown as Socket;
			await gateway.handleConnection(client);
			await gateway.handleDisconnect(client);
			expect(gateway.isUserOnline(EXAMPLES.id)).toBe(false);
		});
	});
});
