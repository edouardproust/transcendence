import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameServiceMock, ongoingGameFixture } from './game.service.mock';
import { Socket, Server } from 'socket.io';
import { WsJwtGuard } from '../auth/guard/ws-jwt.guard';
import { UsersService } from '../users/users.service';

describe('GameGateway', () => {
	let gateway: GameGateway;
	let gameService: GameService;

	const mockServer = {
		to: jest.fn().mockReturnThis(),
		emit: jest.fn(),
		in: jest.fn().mockReturnValue({
			fetchSockets: jest.fn().mockResolvedValue([]), // tu peux ajuster selon test
		}),
	};

	const mockClient = {
		id: 'client-123',
		join: jest.fn(),
		emit: jest.fn(),
		data: {
			user: {
				sub: ongoingGameFixture.whiteId,
				username: 'testUser',
			},
		},
	} as unknown as Socket;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GameGateway,
				GameServiceMock,
				{
					provide: UsersService,
					useValue: {
						findOneById: jest.fn().mockResolvedValue({
							id: ongoingGameFixture.whiteId,
							username: 'testUser',
						}),
					},
				},
			],
		})
			.overrideGuard(WsJwtGuard)
			.useValue({
				canActivate: jest.fn(() => true),
			})
			.compile();

		gateway = module.get<GameGateway>(GameGateway);
		gameService = module.get<GameService>(GameService);

		gateway.server = mockServer as unknown as Server;

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(gateway).toBeDefined();
	});

	describe('handleConnection', () => {
		it('should log when a client connects', () => {
			const consoleSpy = jest.spyOn(console, 'log');
			gateway.handleConnection(mockClient);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Client connected:',
				mockClient.id,
			);
		});
	});

	describe('handleJoinGame', () => {
		it('should make the client join the correct room', async () => {
			await gateway.handleJoinGame(
				{ gameId: ongoingGameFixture.id },
				mockClient,
			);
			expect(mockClient.join).toHaveBeenCalledWith(
				`game:${ongoingGameFixture.id}`,
			);
		});
	});

	describe('handleMove', () => {
		const moveData = {
			gameId: ongoingGameFixture.id,
			move: 'e2e4',
			userId: ongoingGameFixture.whiteId,
		};

		it('should call gameService.makeMove and emit gameUpdate to the room', async () => {
			jest.spyOn(gameService, 'makeMove').mockResolvedValue(
				ongoingGameFixture as any,
			);

			await gateway.handleMove(moveData, mockClient);

			expect(gameService.makeMove).toHaveBeenCalledWith(
				moveData.gameId,
				{ move: moveData.move },
				moveData.userId,
			);
			expect(mockServer.to).toHaveBeenCalledWith(
				`game:${moveData.gameId}`,
			);
			expect(mockServer.emit).toHaveBeenCalledWith(
				'gameUpdate',
				ongoingGameFixture,
			);
		});

		it('should emit an error to the client if makeMove throws', async () => {
			jest.spyOn(gameService, 'makeMove').mockRejectedValue(
				new Error('Invalid move'),
			);

			await gateway.handleMove(moveData, mockClient);

			expect(mockClient.emit).toHaveBeenCalledWith('error', {
				message: 'Invalid move',
			});
		});
	});
});
